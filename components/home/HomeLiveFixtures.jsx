"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaBolt, FaBroadcastTower, FaChevronRight } from "react-icons/fa";

import { loadFeaturedMatches } from "@/lib/offline/fixturesVaultClient";

export default function HomeLiveFixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromVault, setFromVault] = useState(false);
  const fetchGeneration = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchMatches() {
      const run = ++fetchGeneration.current;
      const ac = new AbortController();
      const timeoutId = setTimeout(() => ac.abort(), 12_000);
      try {
        const result = await loadFeaturedMatches({ signal: ac.signal });
        if (cancelled || run !== fetchGeneration.current) return;
        setMatches(result.matches);
        setFromVault(Boolean(result.vault?.fromVault));
      } catch (err) {
        if (err?.name === "AbortError") {
          console.warn("Featured matches request timed out or was aborted");
        } else {
          console.error("Failed to fetch featured matches", err);
        }
        if (cancelled || run !== fetchGeneration.current) return;
      } finally {
        clearTimeout(timeoutId);
        if (cancelled || run !== fetchGeneration.current) return;
        setLoading(false);
      }
    }

    fetchMatches();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return; // Do not burn network or battery while the tab is backgrounded
      }
      fetchMatches();
    }, 60000);

    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchMatches();
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      cancelled = true;
      fetchGeneration.current += 1;
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center bg-zinc-950 border-y border-zinc-900">
        <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 animate-pulse">Syncing Arena Data Feed...</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-zinc-950 border-y border-zinc-900 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-zinc-400">
            {fromVault
              ? "Showing saved match strip from your device vault while the live feed catches up."
              : null}
          </p>
          <Link
            href="/fixtures"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-yellow-600 hover:text-yellow-500 shrink-0"
          >
            Open fixtures <FaChevronRight size={8} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-zinc-950 border-y border-zinc-900 py-12 overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[min(42vw,300px)] w-[min(75vw,600px)] -translate-x-1/2 -translate-y-1/2 bg-yellow-600/10 blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-600/10 border border-yellow-600/20 flex items-center justify-center">
            <FaBolt className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">Live Match Center</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Global Coverage · PSL Tracked</p>
          </div>
        </div>
        <Link href="/fixtures" className="text-[10px] font-black uppercase tracking-widest text-yellow-600 hover:text-yellow-500 flex items-center gap-2 group transition-all">
            See All Leagues <FaChevronRight className="transition-transform group-hover:translate-x-1" size={8} />
        </Link>
      </div>

      <div className="relative z-10">
        <div className="flex gap-4 overflow-x-auto px-6 pb-6 hide-scrollbar mask-fade-edges">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-[280px] bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-5 hover:border-yellow-600/40 hover:bg-zinc-900 transition-all cursor-default group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-yellow-500 transition-colors">
                  {match.league.shortName || match.league.name}
                </span>
                {match.isLive ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                    <span className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-rose-500">{match.minute}&apos; LIVE</span>
                  </div>
                ) : (
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">{match.kickoffLabel}</span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-6 h-6 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/5">
                        {match.home.logo && <Image src={match.home.logo} alt="" fill className="object-contain p-0.5" unoptimized />}
                    </div>
                    <span className="text-xs font-bold text-zinc-300 truncate">{match.home.name}</span>
                  </div>
                  <span className={`text-sm font-black ${match.isLive ? 'text-white' : 'text-zinc-600'}`}>{match.score.home ?? 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-6 h-6 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/5">
                        {match.away.logo && <Image src={match.away.logo} alt="" fill className="object-contain p-0.5" unoptimized />}
                    </div>
                    <span className="text-xs font-bold text-zinc-300 truncate">{match.away.name}</span>
                  </div>
                  <span className={`text-sm font-black ${match.isLive ? 'text-white' : 'text-zinc-600'}`}>{match.score.away ?? 0}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FaBroadcastTower className="text-zinc-600" size={10} />
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">iSports Edge Feed</span>
                </div>
                <Link href={`/fixtures?league=${match.league.slug || "premier-league"}`} className="p-2 rounded-full bg-zinc-800/50 hover:bg-yellow-600/20 hover:text-yellow-500 transition-all">
                    <FaChevronRight size={8} />
                </Link>
              </div>
            </motion.div>
          ))}
          
          {/* View More Card */}
          <Link href="/fixtures" className="flex-shrink-0 w-[120px] rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-3 group hover:border-yellow-600/50 hover:bg-yellow-600/5 transition-all">
             <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaArrowRight className="text-zinc-500 group-hover:text-yellow-600" size={12} />
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-yellow-600">View All</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-fade-edges {
          webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
      `}</style>
    </section>
  );
}


