"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { projectArenaReality } from "@/lib/arena/reality";

const ArenaWorld = dynamic(() => import("@/components/experience/ArenaWorld"), {
  ssr: false,
  loading: () => null,
});

const CHAPTERS = [
  { short: "ARRIVE", title: "Enter the arena" },
  { short: "REALITY", title: "Know what is real" },
  { short: "RESERVE", title: "Choose the pitch" },
  { short: "PLAY", title: "Move through football" },
  { short: "LEGACY", title: "Carry the history" },
];

function chapterNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function RealitySignal({ reality }) {
  const tone =
    reality.evidenceClass === "verified-source"
      ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
      : reality.evidenceClass === "database-empty"
        ? "border-amber-400/35 bg-amber-400/10 text-amber-200"
        : "border-red-400/35 bg-red-400/10 text-red-200";

  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${tone}`}
      data-kpgs-evidence={reality.evidenceClass}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">{reality.label}</span>
    </div>
  );
}

function ScenePlate({ eyebrow, title, body, children, align = "left", reducedMotion }) {
  const aligned = align === "right" ? "lg:ml-auto lg:text-right" : "lg:mr-auto";
  return (
    <motion.div
      className={`relative w-full max-w-2xl ${aligned}`}
      initial={reducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.42 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-amber-300/90">
        {eyebrow}
      </p>
      <h2
        className="max-w-[14ch] text-balance text-[clamp(2.7rem,8vw,6.6rem)] font-black uppercase leading-[0.83] tracking-[-0.035em] text-[#f3efdf] lg:max-w-[11ch]"
        style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif" }}
      >
        {title}
      </h2>
      <p className="mt-6 max-w-xl text-sm leading-7 text-white/68 sm:text-base">{body}</p>
      {children ? <div className="mt-8">{children}</div> : null}
    </motion.div>
  );
}

function CourtStrip({ courts, reality }) {
  if (!reality.inventoryVerified) {
    return (
      <div className="max-w-xl border-l border-amber-300/35 pl-4 text-sm leading-7 text-white/72">
        <p>{reality.detail}</p>
        <a
          href="https://wa.me/27637820245"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center border-b border-amber-300/70 text-xs font-black uppercase tracking-[0.2em] text-amber-200"
        >
          Confirm with the venue ↗
        </a>
      </div>
    );
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
      <div className="flex w-max gap-3 lg:grid lg:w-full lg:grid-cols-2">
        {courts.slice(0, 4).map((court, index) => (
          <Link
            key={court._id || `${court.name}-${index}`}
            href={`/courts/${court._id}`}
            className="group w-[min(78vw,290px)] border border-white/12 bg-black/38 p-4 no-underline backdrop-blur-md transition hover:border-amber-300/45 hover:bg-black/58 lg:w-auto"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300/80">
                  Court record verified
                </p>
                <h3 className="mt-2 text-xl font-black uppercase tracking-[-0.02em] text-white">
                  {court.name}
                </h3>
              </div>
              <span className="text-xs text-white/45">{chapterNumber(index)}</span>
            </div>
            <div className="mt-7 flex items-end justify-between gap-5 border-t border-white/10 pt-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">Persisted rate</p>
                <p className="mt-1 text-2xl font-black text-amber-200">R{court.price_per_hour}</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/72 transition group-hover:text-amber-200">
                Resolve slots →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ArenaChronicle({ courts = [], courtSource = "unavailable", minPrice = null }) {
  const reducedMotion = useReducedMotion();
  const sectionRefs = useRef([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [quality, setQuality] = useState("full");

  const reality = useMemo(
    () => projectArenaReality({ courtSource, courts, minPrice }),
    [courtSource, courts, minPrice],
  );

  useEffect(() => {
    const saveData = Boolean(navigator.connection?.saveData);
    const updateQuality = () => {
      if (reducedMotion || saveData) {
        setQuality("static");
      } else if (window.innerWidth < 820) {
        setQuality("lite");
      } else {
        setQuality("full");
      }
    };

    updateQuality();
    window.addEventListener("resize", updateQuality, { passive: true });
    return () => window.removeEventListener("resize", updateQuality);
  }, [reducedMotion]);

  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const next = Number(visible.target.dataset.chapter);
        if (Number.isInteger(next)) setActiveChapter(next);
      },
      { threshold: [0.25, 0.45, 0.65], rootMargin: "-12% 0px -35% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const goToChapter = (index) => {
    sectionRefs.current[index]?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      className="relative isolate overflow-clip bg-[#040705] text-white"
      data-kpgs-proof={reality.evidenceClass}
      data-slot-proof="resolve-at-court"
    >
      <div className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden">
        {quality === "static" ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 55% 42%, rgba(34,197,94,.17), transparent 25%), linear-gradient(155deg,#050806 10%,#102419 52%,#030504 100%)",
            }}
          >
            <div className="absolute inset-x-[8%] bottom-[16%] h-[34%] border border-white/15 [transform:perspective(700px)_rotateX(58deg)]" />
          </div>
        ) : (
          <ArenaWorld chapter={activeChapter} sourceState={reality.source} quality={quality} />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,3,.82)_0%,rgba(2,5,3,.42)_45%,rgba(2,5,3,.12)_72%,rgba(2,5,3,.58)_100%)] lg:bg-[linear-gradient(90deg,rgba(2,5,3,.82)_0%,rgba(2,5,3,.26)_44%,rgba(2,5,3,.04)_70%,rgba(2,5,3,.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,5,.18),transparent_45%,rgba(4,7,5,.78))]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      <nav
        aria-label="Arena chapters"
        className="pointer-events-auto fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-4 xl:flex"
      >
        {CHAPTERS.map((chapter, index) => (
          <button
            type="button"
            key={chapter.short}
            onClick={() => goToChapter(index)}
            aria-current={activeChapter === index ? "step" : undefined}
            className="group flex items-center justify-end gap-3 bg-transparent p-0 text-right"
          >
            <span
              className={`text-[9px] font-black uppercase tracking-[0.2em] transition ${
                activeChapter === index ? "text-amber-200" : "text-white/38 group-hover:text-white/68"
              }`}
            >
              {chapter.short}
            </span>
            <span
              className={`h-px transition-all ${
                activeChapter === index ? "w-9 bg-amber-200" : "w-4 bg-white/25 group-hover:w-6"
              }`}
            />
            <span className="w-5 text-[9px] text-white/35">{chapterNumber(index)}</span>
          </button>
        ))}
      </nav>

      <main className="relative z-10 -mt-[100svh]">
        <section
          ref={(node) => { sectionRefs.current[0] = node; }}
          data-chapter="0"
          className="flex min-h-[100svh] items-end px-5 pb-24 pt-28 sm:px-8 sm:pb-20 lg:items-center lg:px-16 xl:px-24"
        >
          <div className="w-full max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-200">
              Milnerton · Cape Town · Hellenic Football Club
            </p>
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-[10ch] text-balance text-[clamp(4rem,14vw,10rem)] font-black uppercase leading-[0.77] tracking-[-0.045em] text-[#f3efdf]"
              style={{ fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif" }}
            >
              Five&apos;s Arena
            </motion.h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
              One arena, one booking truth, one football journey. The world changes as you move through it; the commercial state only changes when the source proves it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={reality.inventoryVerified && courts[0]?._id ? `/courts/${courts[0]._id}` : "#arena-reserve"}
                className="inline-flex min-h-12 items-center bg-amber-300 px-6 text-xs font-black uppercase tracking-[0.18em] text-black no-underline transition hover:bg-[#f6de8b]"
              >
                Enter booking flow
              </Link>
              <a
                href="https://wa.me/27637820245"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center border border-white/35 px-6 text-xs font-black uppercase tracking-[0.18em] text-white no-underline transition hover:border-white/70"
              >
                WhatsApp venue ↗
              </a>
            </div>

            <div className="mt-8">
              <RealitySignal reality={reality} />
            </div>
          </div>
        </section>

        <section
          ref={(node) => { sectionRefs.current[1] = node; }}
          data-chapter="1"
          className="flex min-h-[100svh] items-center px-5 py-24 sm:px-8 lg:px-16 xl:px-24"
        >
          <ScenePlate
            eyebrow="02 / Reality before decoration"
            title="Know what is real"
            body={reality.detail}
            reducedMotion={reducedMotion}
          >
            <div className="grid max-w-xl grid-cols-3 border-y border-white/12 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">Courts</p>
                <p className="mt-2 text-2xl font-black text-white">{reality.inventoryVerified ? reality.count : "—"}</p>
              </div>
              <div className="border-x border-white/10 px-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">From</p>
                <p className="mt-2 text-2xl font-black text-white">{reality.minPrice ? `R${reality.minPrice}` : "—"}</p>
              </div>
              <div className="pl-4">
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/38">Slots</p>
                <p className="mt-2 text-xs font-black uppercase leading-5 tracking-[0.12em] text-amber-200">Resolve per court</p>
              </div>
            </div>
          </ScenePlate>
        </section>

        <section
          id="arena-reserve"
          ref={(node) => { sectionRefs.current[2] = node; }}
          data-chapter="2"
          className="flex min-h-[100svh] items-center px-5 py-24 sm:px-8 lg:px-16 xl:px-24"
        >
          <ScenePlate
            eyebrow="03 / Reservation threshold"
            title="Choose the pitch"
            body="A court record is not the same thing as an open slot. FivesArena keeps those states separate: discover the real court here, then resolve time availability at the transactional boundary."
            reducedMotion={reducedMotion}
          >
            <CourtStrip courts={courts} reality={reality} />
          </ScenePlate>
        </section>

        <section
          ref={(node) => { sectionRefs.current[3] = node; }}
          data-chapter="3"
          className="flex min-h-[100svh] items-center px-5 py-24 sm:px-8 lg:px-16 xl:px-24"
        >
          <ScenePlate
            eyebrow="04 / Football beyond checkout"
            title="Play through the city"
            body="Bookings are the commercial spine, not the whole identity. Fixtures, tactics and events become adjacent views of the same arena instead of competing home-page modules."
            align="right"
            reducedMotion={reducedMotion}
          >
            <div className="grid max-w-xl gap-px bg-white/10 sm:grid-cols-3 lg:ml-auto">
              {[
                ["Fixtures", "/fixtures", "Follow football"],
                ["Tactics", "/creator", "Build your five"],
                ["Events", "/events-and-services", "Use the venue"],
              ].map(([label, href, note]) => (
                <Link
                  key={label}
                  href={href}
                  className="bg-black/55 p-5 text-left no-underline transition hover:bg-black/75"
                >
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/38">{note}</p>
                  <p className="mt-4 text-lg font-black uppercase text-white">{label} →</p>
                </Link>
              ))}
            </div>
          </ScenePlate>
        </section>

        <section
          ref={(node) => { sectionRefs.current[4] = node; }}
          data-chapter="4"
          className="flex min-h-[100svh] items-center px-5 py-24 sm:px-8 lg:px-16 xl:px-24"
        >
          <ScenePlate
            eyebrow="05 / Time is part of truth"
            title="Keep the legacy moving"
            body="World Cup 5s ran 29–31 May 2026. It remains part of FivesArena as an archive, not as a fake live registration state. History gives the arena depth; present-tense actions remain present-tense."
            reducedMotion={reducedMotion}
          >
            <div className="max-w-xl border-t border-white/12 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/38">World Cup 5s</p>
                  <p className="mt-2 text-2xl font-black uppercase text-white">2026 archive</p>
                </div>
                <Link
                  href="/tournament"
                  className="border-b border-amber-200/70 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200 no-underline"
                >
                  Open archive →
                </Link>
              </div>
            </div>
          </ScenePlate>
        </section>
      </main>

      <nav
        aria-label="Arena chapter shortcuts"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 border border-white/12 bg-black/78 p-1 backdrop-blur-xl xl:hidden"
      >
        {CHAPTERS.map((chapter, index) => (
          <button
            type="button"
            key={chapter.short}
            onClick={() => goToChapter(index)}
            aria-label={`${chapterNumber(index)} ${chapter.title}`}
            aria-current={activeChapter === index ? "step" : undefined}
            className={`min-h-11 px-1 text-[8px] font-black uppercase tracking-[0.08em] transition ${
              activeChapter === index ? "bg-amber-300 text-black" : "text-white/52"
            }`}
          >
            {chapter.short}
          </button>
        ))}
      </nav>
    </div>
  );
}
