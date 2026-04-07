"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaTrophy, FaCircle, FaSync } from "react-icons/fa";
import useSSE from "@/hooks/useSSE";

export default function PublicStandingsPage() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [flashGroup, setFlashGroup] = useState(null);

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament/standings");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || {});
        setLastUpdated(new Date());
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStandings();
  }, [fetchStandings]);

  const { connected } = useSSE("/api/sse/tournament", (data) => {
    if (data.type === "standings-update") {
      // Update specific group in real-time
      if (data.groupLetter && data.standings) {
        setGroups((prev) => ({ ...prev, [data.groupLetter]: data.standings }));
        setFlashGroup(data.groupLetter);
        setLastUpdated(new Date());
        setTimeout(() => setFlashGroup(null), 2000);
      }
    }
    if (data.type === "fixture-update" || data.type === "score-live") {
      fetchStandings();
    }
  });

  const groupEntries = Object.entries(groups).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-green-500 mb-2">
              5s Arena World Cup 2026
            </p>
            <h1
              className="text-4xl md:text-7xl font-black uppercase text-white tracking-tighter"
              style={{ fontFamily: "Impact, sans-serif" }}
            >
              Group <span className="text-green-400">Standings</span>
            </h1>
            <div className="h-1 w-16 bg-green-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-green-500 animate-pulse" : "bg-gray-600"}`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${connected ? "text-green-500" : "text-gray-600"}`}
            >
              {connected ? "Live · Auto-updating" : "Offline"}
            </span>
            {lastUpdated && (
              <span className="text-[9px] text-gray-700 font-bold">
                ·{" "}
                {lastUpdated.toLocaleTimeString("en-ZA", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <FaSync className="text-green-500 animate-spin text-3xl" />
          </div>
        ) : groupEntries.length === 0 ? (
          <div className="text-center py-20">
            <FaTrophy className="text-gray-700 text-5xl mx-auto mb-4" />
            <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">
              Standings not available yet
            </p>
            <p className="text-gray-700 text-xs mt-2">
              Check back once the group stage begins
            </p>
            <Link
              href="/tournament"
              className="inline-block mt-8 px-8 py-3 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-500 transition-all text-sm"
            >
              Register Your Team
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupEntries.map(([groupLetter, teams], groupIdx) => (
              <motion.div
                key={groupLetter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.05 }}
                className={`bg-gray-900 rounded-3xl border overflow-hidden transition-all duration-500 ${
                  flashGroup === groupLetter
                    ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
                    : "border-gray-800"
                }`}
              >
                {/* Group header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                      <span className="text-green-400 font-black text-sm">
                        {groupLetter}
                      </span>
                    </div>
                    <h3
                      className="text-sm font-black uppercase tracking-widest text-white"
                      style={{ fontFamily: "Impact, sans-serif" }}
                    >
                      Group {groupLetter}
                    </h3>
                  </div>
                  <AnimatePresence>
                    {flashGroup === groupLetter && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-[8px] font-black uppercase text-green-400 bg-green-900/30 border border-green-700/30 px-2 py-0.5 rounded-full tracking-widest"
                      >
                        Updated
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Standings table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-bold">
                    <thead>
                      <tr className="text-gray-600 uppercase tracking-widest">
                        <th className="px-4 py-2 text-left w-6">#</th>
                        <th className="px-4 py-2 text-left">Team</th>
                        <th className="px-2 py-2 text-center w-8">MP</th>
                        <th className="px-2 py-2 text-center w-8">W</th>
                        <th className="px-2 py-2 text-center w-8">D</th>
                        <th className="px-2 py-2 text-center w-8">L</th>
                        <th className="px-2 py-2 text-center w-8">GF</th>
                        <th className="px-2 py-2 text-center w-8">GA</th>
                        <th className="px-2 py-2 text-center w-8">GD</th>
                        <th className="px-2 py-2 text-center w-8 font-black text-white">
                          PTS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, idx) => (
                        <motion.tr
                          key={team._id}
                          layout
                          className="border-t border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                        >
                          <td
                            className={`px-4 py-3 font-black ${
                              idx < 2
                                ? "text-green-400 border-l-2 border-l-green-500"
                                : "text-gray-500"
                            }`}
                          >
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {/* Player profile, logo, or fallback */}
                              {team.worldCupTeamProfile ? (
                                <div className="relative w-7 h-7 shrink-0">
                                  <Image
                                    src={team.worldCupTeamProfile}
                                    alt={team.teamName + " player profile"}
                                    fill
                                    className="object-cover rounded-full border-2 border-green-400 bg-gray-950 shadow-md"
                                  />
                                </div>
                              ) : team.worldCupTeamLogo ? (
                                <div className="relative w-6 h-6 shrink-0">
                                  <Image
                                    src={team.worldCupTeamLogo}
                                    alt={
                                      team.worldCupTeam?.split(" (")[0] ||
                                      team.teamName
                                    }
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[8px] font-black text-gray-500 shrink-0">
                                  {team.teamName?.[0]}
                                </div>
                              )}
                              <div>
                                <p className="text-white font-black text-[10px] leading-none">
                                  {team.teamName}
                                </p>
                                {team.worldCupTeam && (
                                  <p className="text-gray-600 text-[8px] leading-none mt-0.5">
                                    {team.worldCupTeam.split(" (")[0]}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {["mp", "w", "d", "l", "gf", "ga", "gd"].map((f) => (
                            <td
                              key={f}
                              className="px-2 py-3 text-center text-gray-400"
                            >
                              {team[f] ?? 0}
                            </td>
                          ))}
                          <td className="px-2 py-3 text-center font-black text-white text-sm">
                            {team.pts ?? 0}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Qualification legend */}
                <div className="px-5 py-3 border-t border-gray-800/50 flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-sm shrink-0" />
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                    Top 2 qualify for knockout stage
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-12">
          <Link
            href="/tournament/bracket"
            className="px-6 py-3 bg-gray-900 border border-gray-800 hover:border-green-500/30 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Knockout Bracket →
          </Link>
          <Link
            href="/tournament"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Register Team →
          </Link>
        </div>
      </div>
    </div>
  );
}
