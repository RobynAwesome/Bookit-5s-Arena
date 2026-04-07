"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSave, FaSync, FaCalculator } from "react-icons/fa";
import Image from "next/image";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const STAT_COLS = [
  { key: "mp", label: "MP", width: "w-12" },
  { key: "w", label: "W", width: "w-10" },
  { key: "d", label: "D", width: "w-10" },
  { key: "l", label: "L", width: "w-10" },
  { key: "gf", label: "GF", width: "w-12" },
  { key: "ga", label: "GA", width: "w-12" },
  { key: "gd", label: "GD", width: "w-12" },
  { key: "pts", label: "PTS", width: "w-12" },
];

export default function StandingsEditor() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingGroup, setSavingGroup] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/competitions/tournament/standings");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || {});
      }
    } catch (err) {
      console.error("Standings fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const updateTeamStat = (groupLetter, teamIdx, key, value) => {
    setGroups((prev) => {
      const next = { ...prev };
      next[groupLetter] = [...next[groupLetter]];
      next[groupLetter][teamIdx] = {
        ...next[groupLetter][teamIdx],
        [key]: parseInt(value) || 0,
      };
      return next;
    });
  };

  const autoCalcGD = (groupLetter) => {
    setGroups((prev) => {
      const next = { ...prev };
      next[groupLetter] = next[groupLetter].map((t) => ({
        ...t,
        gd: (t.gf || 0) - (t.ga || 0),
      }));
      return next;
    });
  };

  const saveGroup = async (groupLetter) => {
    setSavingGroup(groupLetter);
    try {
      const res = await fetch("/api/admin/competitions/tournament/standings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupLetter,
          teams: groups[groupLetter].map((t) => ({
            _id: t._id,
            mp: t.mp || 0,
            w: t.w || 0,
            d: t.d || 0,
            l: t.l || 0,
            gf: t.gf || 0,
            ga: t.ga || 0,
            gd: t.gd || 0,
            pts: t.pts || 0,
          })),
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `Group ${groupLetter} saved!` });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Save failed." });
    } finally {
      setSavingGroup(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <FaSync className="animate-spin text-green-500 text-2xl" />
      </div>
    );
  }

  const activeGroups = GROUPS.filter((g) => groups[g]?.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-8">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 text-center text-[11px] font-black uppercase tracking-widest ${
            message.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {activeGroups.map((letter) => (
          <motion.div
            key={letter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
          >
            {/* Group header */}
            <div className="flex flex-wrap items-center justify-between px-3 sm:px-5 py-3 bg-linear-to-r from-green-900/30 to-transparent border-b border-gray-800">
              <div className="flex items-center gap-3">
                <span
                  className="text-lg font-black text-green-400"
                  style={{ fontFamily: "Impact, sans-serif" }}
                >
                  GROUP {letter}
                </span>
                <span className="text-[9px] font-bold text-gray-600 uppercase">
                  {groups[letter].length} teams
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => autoCalcGD(letter)}
                  className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-500 hover:text-cyan-400"
                  title="Auto-calculate GD"
                >
                  <FaCalculator size={10} />
                </button>
                <button
                  onClick={() => saveGroup(letter)}
                  disabled={savingGroup === letter}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-[9px] font-black uppercase tracking-wider text-white transition-colors disabled:opacity-50"
                >
                  {savingGroup === letter ? (
                    <FaSync className="animate-spin" size={8} />
                  ) : (
                    <FaSave size={8} />
                  )}
                  Save
                </button>
              </div>
            </div>

            {/* Table header */}
            <div
              className="grid items-center px-2 sm:px-4 py-2 bg-gray-950/50 text-[8px] font-black uppercase tracking-widest text-gray-600 min-w-0"
              style={{
                gridTemplateColumns:
                  "28px minmax(60px,1fr) repeat(8, minmax(32px, 1fr))",
              }}
            >
              <span className="text-center">#</span>
              <span className="truncate">Team</span>
              {STAT_COLS.map((col) => (
                <span key={col.key} className="text-center">
                  {col.label}
                </span>
              ))}
            </div>

            {/* Team rows */}
            {groups[letter].map((team, idx) => (
              <div
                key={team._id}
                className={`grid items-center px-2 sm:px-4 py-2 border-t border-gray-800/50 transition-colors hover:bg-gray-800/30 ${
                  idx < 2 ? "border-l-2 border-l-green-500" : ""
                } min-w-0`}
                style={{
                  gridTemplateColumns:
                    "28px minmax(60px,1fr) repeat(8, minmax(32px, 1fr))",
                }}
              >
                {/* Position */}
                <span
                  className={`text-center text-xs font-black ${idx < 2 ? "text-green-400" : "text-gray-500"}`}
                >
                  {idx + 1}
                </span>

                {/* Team info */}
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <div className="relative w-6 h-6 aspect-square shrink-0">
                    {team.worldCupTeamLogo ? (
                      <Image
                        src={team.worldCupTeamLogo}
                        alt={team.teamName}
                        fill
                        className="object-contain aspect-square"
                      />
                    ) : (
                      <div className="w-6 h-6 aspect-square rounded-full bg-gray-800 flex items-center justify-center text-[8px] font-black text-gray-600">
                        {team.teamName?.[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-white truncate">
                    {team.worldCupTeam?.split(" (")[0] || team.teamName}
                  </span>
                </div>

                {/* Stat inputs */}
                {STAT_COLS.map((col) => (
                  <input
                    key={col.key}
                    type="number"
                    value={team[col.key] ?? 0}
                    onChange={(e) =>
                      updateTeamStat(letter, idx, col.key, e.target.value)
                    }
                    className={`min-w-0 w-full bg-transparent border border-transparent hover:border-gray-700 focus:border-green-500 rounded px-1 py-1 text-center text-[11px] font-mono font-bold outline-none transition-colors ${
                      col.key === "pts"
                        ? "text-green-400 font-black"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            ))}

            {/* Empty group placeholder */}
            {groups[letter].length === 0 && (
              <p className="text-center text-gray-700 text-[10px] font-bold uppercase py-8">
                No teams assigned
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {activeGroups.length === 0 && (
        <div className="text-center py-20">
          <FaSync className="text-gray-800 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">
            No groups assigned yet. Generate a draw first.
          </p>
        </div>
      )}
    </div>
  );
}
