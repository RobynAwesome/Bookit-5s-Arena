import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CANONICAL_OUTBOUND_LINKS,
  assertCanonicalOutboundLinks,
  containsHellenicIdentity,
  containsStaleLinkedIn,
  disposeKPGSTHREEScene,
  isEpochRootPath,
  isKPGSTHREEExperimentEnabled,
  resolveDpr,
  resolveKPGSTHREEPolicy,
  shouldRenderKPGSTHREECanvas,
} from "../../lib/experiments/KPGSTHREE.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

test("canonical CTA URLs are exact and fail closed on drift", () => {
  assert.equal(CANONICAL_OUTBOUND_LINKS.kopanoLabs, "https://KopanoLabs.com");
  assert.equal(CANONICAL_OUTBOUND_LINKS.krrababalela, "https://KRRababalela.com");
  assert.equal(
    CANONICAL_OUTBOUND_LINKS.linkedIn,
    "https://www.linkedin.com/in/kholofelorobynrababalela/",
  );
  assert.deepEqual(assertCanonicalOutboundLinks(), []);
  assert.ok(
    assertCanonicalOutboundLinks({
      ...CANONICAL_OUTBOUND_LINKS,
      linkedIn: "https://www.linkedin.com/in/kholofelo-robyn-rababalela-7a26273b6/",
    }).length > 0,
  );
});

test("stale LinkedIn slug detector catches hyphenated profile", () => {
  assert.equal(
    containsStaleLinkedIn(
      "https://www.linkedin.com/in/kholofelo-robyn-rababalela-7a26273b6/",
    ),
    true,
  );
  assert.equal(containsStaleLinkedIn(CANONICAL_OUTBOUND_LINKS.linkedIn), false);
});

test("parked root page has no Hellenic identity and no booking CTA", () => {
  const page = read("app/page.jsx");
  const relaunch = read("components/home/EpochRelaunchPage.jsx");
  const combined = `${page}\n${relaunch}`;

  assert.equal(containsHellenicIdentity(combined), false);
  assert.doesNotMatch(combined, /wa\.me\/27637820245/);
  assert.doesNotMatch(combined, /Book a Court|Book Pitch|#courts/i);
  assert.match(combined, /EpochRelaunchPage/);
  assert.match(relaunch, /CANONICAL_OUTBOUND_LINKS\.kopanoLabs/);
  assert.match(relaunch, /CANONICAL_OUTBOUND_LINKS\.krrababalela/);
  assert.match(relaunch, /CANONICAL_OUTBOUND_LINKS\.linkedIn/);
  assert.deepEqual(assertCanonicalOutboundLinks(), []);
});

test("parked root chrome hides legacy booking and extra identity surfaces", () => {
  const header = read("components/Header.jsx");
  const soccerBallMenu = read("components/SoccerBallMenu.jsx");

  assert.match(soccerBallMenu, /isEpochRelaunchRoot\(pathname\)/);
  assert.match(
    header,
    /\{!epochRoot && \(\s*<div className="hidden lg:flex items-center gap-2 mr-1">/s,
  );
  assert.match(
    header,
    /\{!epochRoot && \(\s*<div className="relative group hidden md:block mr-2">/s,
  );
});

test("creator page no longer uses the stale LinkedIn slug", () => {
  const creator = read("app/creator/page.jsx");
  assert.equal(containsStaleLinkedIn(creator), false);
  assert.match(
    creator,
    /https:\/\/www\.linkedin\.com\/in\/kholofelorobynrababalela\//,
  );
});

test("reduced-motion and experiment-off fall back without canvas", () => {
  const reduced = resolveKPGSTHREEPolicy({
    enabled: true,
    webglAvailable: true,
    reducedMotion: true,
  });
  assert.equal(shouldRenderKPGSTHREECanvas(reduced), false);

  const off = resolveKPGSTHREEPolicy({
    enabled: false,
    webglAvailable: true,
    reducedMotion: false,
  });
  assert.equal(shouldRenderKPGSTHREECanvas(off), false);

  const ok = resolveKPGSTHREEPolicy({
    enabled: true,
    webglAvailable: true,
    reducedMotion: false,
  });
  assert.equal(shouldRenderKPGSTHREECanvas(ok), true);
});

test("non-WebGL and feature switch disable the scene safely", () => {
  assert.equal(
    shouldRenderKPGSTHREECanvas(
      resolveKPGSTHREEPolicy({ enabled: true, webglAvailable: false }),
    ),
    false,
  );
  assert.equal(isKPGSTHREEExperimentEnabled({ NEXT_PUBLIC_KPGSTHREE_EXPERIMENT: "off" }), false);
  assert.equal(isKPGSTHREEExperimentEnabled({}), true);
});

test("accessible DOM contract remains when canvas is disabled (semantic copy present)", () => {
  const relaunch = read("components/home/EpochRelaunchPage.jsx");
  assert.match(relaunch, /<h1[\s\S]*FivesArena is evolving/);
  assert.match(relaunch, /aria-label="Canonical outbound identity"/);
  assert.match(relaunch, /data-testid="epoch-canonical-ctas"/);
  assert.match(relaunch, /Validated product-discovery evidence/);
});

test("mobile DPR is capped and disposal is safe", () => {
  assert.equal(resolveDpr(3, true), 1.5);
  assert.equal(resolveDpr(3, false), 2);
  assert.doesNotThrow(() =>
    disposeKPGSTHREEScene({
      geometries: [{ dispose() {} }],
      materials: [{ dispose() {} }],
      renderer: { dispose() {}, forceContextLoss() {} },
    }),
  );
});

test("epoch root path helper only matches parked /", () => {
  assert.equal(isEpochRootPath("/"), true);
  assert.equal(isEpochRootPath("/about"), false);
  assert.equal(isEpochRootPath("/bookings"), false);
});

test("root SEO continuity stays indexable", () => {
  const page = read("app/page.jsx");
  const layout = read("app/layout.jsx");
  const robots = read("app/robots.js");
  assert.match(page, /robots:\s*\{\s*index:\s*true/);
  assert.match(page, /canonical:\s*"https:\/\/fivesarena\.com\/"/);
  assert.match(layout, /robots:\s*\{\s*index:\s*true/);
  assert.doesNotMatch(page, /noindex/);
  assert.ok(robots.includes("allow: '/'"));
});
