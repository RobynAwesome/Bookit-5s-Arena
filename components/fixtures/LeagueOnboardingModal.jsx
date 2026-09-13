"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaFutbol, FaTimes } from "react-icons/fa";
import { LEAGUES_CATALOG } from "@/lib/sports/leaguesCatalog";
import {
  FAVORITE_LEAGUE_COUNT,
  writeFavoriteLeagues,
} from "@/lib/sports/leaguePreferences";

export default function LeagueOnboardingModal({ open, onComplete }) {
  const [selected, setSelected] = useState(["premier-league", "psl", "uefa-champions-league"]);

  const grouped = useMemo(() => {
    const buckets = new Map();
    for (const league of LEAGUES_CATALOG) {
      const key = league.country;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(league);
    }
    return [...buckets.entries()];
  }, []);

  const toggle = (slug) => {
    setSelected((current) => {
      if (current.includes(slug)) {
        return current.filter((item) => item !== slug);
      }
      if (current.length >= FAVORITE_LEAGUE_COUNT) {
        return [...current.slice(1), slug];
      }
      return [...current, slug];
    });
  };

  const canSave = selected.length === FAVORITE_LEAGUE_COUNT;

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const fallback = selected.length === FAVORITE_LEAGUE_COUNT ? selected : ["premier-league", "psl", "uefa-champions-league"];
        const saved = writeFavoriteLeagues(fallback);
        onComplete?.(saved);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selected, onComplete]);

  const handleSave = () => {
    if (!canSave) return;
    const saved = writeFavoriteLeagues(selected);
    onComplete?.(saved);
  };

  const handleUseDefaults = () => {
    const defaults = ["premier-league", "psl", "uefa-champions-league"];
    const saved = writeFavoriteLeagues(defaults);
    onComplete?.(saved);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Choose your leagues"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="relative overflow-hidden border-b border-white/10 px-6 py-6 sm:px-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.18),transparent_55%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-green-400">
                    Service in society
                  </p>
                  <h2 className="mt-2 text-3xl font-black uppercase text-white">
                    Pick your 3 leagues
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
                    We will pin these to the top of Live Fixtures so you jump straight to the competitions you care about. You can change them any time.
                  </p>
                </div>
                <FaFutbol className="hidden shrink-0 text-green-500 sm:block" size={28} />
              </div>
              <div className="relative mt-5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-green-500"
                    animate={{ width: `${(selected.length / FAVORITE_LEAGUE_COUNT) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-zinc-300">
                  {selected.length}/{FAVORITE_LEAGUE_COUNT} selected
                </span>
              </div>
            </div>

            <div className="max-h-[52vh] overflow-y-auto px-4 py-5 sm:px-6">
              {grouped.map(([region, leagues]) => (
                <section key={region} className="mb-6 last:mb-0">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">
                    {region}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {leagues.map((league) => {
                      const active = selected.includes(league.slug);
                      return (
                        <button
                          key={league.slug}
                          type="button"
                          onClick={() => toggle(league.slug)}
                          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-green-500/50 bg-green-500/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="mr-2">{league.emoji}</span>
                            <span className="text-sm font-semibold">{league.name}</span>
                          </span>
                          {active ? (
                            <FaCheck className="shrink-0 text-green-400" />
                          ) : (
                            <FaTimes className="shrink-0 text-zinc-600" size={12} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="border-t border-white/10 px-6 py-5 sm:px-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleUseDefaults}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-black uppercase tracking-widest text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
              >
                Use defaults & browse
              </button>
              <button
                type="button"
                disabled={!canSave}
                onClick={handleSave}
                className="w-full sm:flex-1 rounded-2xl bg-green-500 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition enabled:hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                Save my leagues
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
