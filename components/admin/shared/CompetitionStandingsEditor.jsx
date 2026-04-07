"use client";

/**
 * @file components/admin/shared/CompetitionStandingsEditor.jsx
 * Unified standings editor for both tournament and league competitions.
 * Replaces:
 *   - components/admin/tournament/StandingsEditor.jsx
 *   - components/admin/league/StandingsEditor.jsx
 *
 * @param {{
 *   competitionType: 'tournament' | 'league',
 *   leagueId?: string,
 * }} props
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaSync, FaSave, FaCalculator } from "react-icons/fa";

const STAT_FIELDS = ["mp", "w", "d", "l", "gf", "ga", "gd", "pts"];
const STAT_LABELS = ["MP", "W", "D", "L", "GF", "GA", "GD", "PTS"];

export default function CompetitionStandingsEditor({
  competitionType = "tournament",
  leagueId,
}) {
  const isTournament = competitionType === "tournament";
  const accent = isTournament ? "green" : "blue";
  const accentClasses = {
    spinner: isTournament ? "text-green-500" : "text-blue-500",
    title: isTournament ? "text-green-400" : "text-blue-400",
    button: isTournament
      ? "bg-green-600 hover:bg-green-500"
      : "bg-blue-600 hover:bg-blue-500",
    badge: isTournament ? "bg-blue-500/20" : "bg-blue-500/20",
    topBorder: isTournament ? "border-l-green-500" : "border-l-blue-500",
    focusBorder: isTournament ? "focus:border-green-500" : "focus:border-blue-500",
    pts: isTournament ? "text-green-400" : "text-white",
    ptsBorder: isTournament ? "" : "border-blue-500/30",
  };

  /** @type {[Record<string, any[]>, Function]} */
  const [groups, setGroups] = useState({});
  const [ungrouped, setUngrouped] = useState([]);
  const [edited, setEdited] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [messages, setMessages] = useState({});

  const apiBase = isTournament
    ? "/api/admin/competitions/tournament/standings"
    : `/api/admin/competitions/league/${leagueId}/standings`;

  const fetchStandings = useCallback(async () => {
    if (!isTournament && !leagueId) return;
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (!res.ok) return;
      const json = await res.json();

      if (isTournament) {
        setGroups(json.groups || {});
        // Seed edited
        const seed = {};
        Object.entries(json.groups || {}).forEach(([g, teams]) => {
          seed[g] = teams.map((t) => ({ ...t }));
        });
        setEdited(seed);
      } else {
        setGroups(json.groups || {});
        setUngrouped(json.ungrouped || []);
        const seed = {};
        Object.entries(json.groups || {}).forEach(([g, teams]) => {
          seed[g] = teams.map((t) => ({ ...t }));
        });
        if (json.ungrouped?.length) {
          seed["__all__"] = json.ungrouped.map((t) => ({ ...t }));
        }
        setEdited(seed);
      }
    } finally {
      setLoading(false);
    }
  }, [apiBase, isTournament, leagueId]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const updateCell = (key, idx, field, value) => {
    setEdited((prev) => {
      const next = { ...prev };
      next[key] = (next[key] || []).map((t, i) =>
        i === idx
          ? { ...t, [field]: value === "" ? "" : parseInt(value) || 0 }
          : t,
      );
      return next;
    });
  };

  const autoCalcGD = (key, idx = null) => {
    setEdited((prev) => {
      const next = { ...prev };
      if (idx !== null) {
        // Per-row (league)
        next[key] = next[key].map((t, i) =>
          i === idx ? { ...t, gd: (t.gf || 0) - (t.ga || 0) } : t,
        );
      } else {
        // Whole group (tournament)
        next[key] = next[key].map((t) => ({
          ...t,
          gd: (t.gf || 0) - (t.ga || 0),
        }));
      }
      return next;
    });
  };

  const saveGroup = async (key, groupLetter) => {
    setSaving(key);
    try {
      const teams = (edited[key] || []).map((t) => ({
        _id: t._id,
        mp: t.mp || 0,
        w: t.w || 0,
        d: t.d || 0,
        l: t.l || 0,
        gf: t.gf || 0,
        ga: t.ga || 0,
        gd: t.gd || 0,
        pts: t.pts || 0,
      }));

      const body = {
        groupLetter: groupLetter !== "__all__" ? groupLetter : undefined,
        teams,
      };

      const res = await fetch(apiBase, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const msg = res.ok
        ? { type: "success", text: groupLetter !== "__all__" ? `Group ${groupLetter} saved!` : "Saved!" }
        : { type: "error", text: "Save failed." };

      setMessages((p) => ({ ...p, [key]: msg }));
      setTimeout(() => setMessages((p) => ({ ...p, [key]: null })), 2500);
      if (res.ok) fetchStandings();
    } finally {
      setSaving(null);
    }
  };

  const renderTable = (key, label, teams) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-5 py-3 border-b border-gray-800 ${
          isTournament
            ? "bg-linear-to-r from-green-900/30 to-transparent"
            : ""
        }`}
      >
        <div className="flex items-center gap-3">
          {!isTournament && (
            <div className={`w-6 h-6 rounded-lg ${accentClasses.badge} flex items-center justify-center`}>
              <span className={`${accentClasses.title} font-black text-[10px]`}>{label}</span>
            </div>
          )}
          <span
            className={`${isTournament ? "text-lg" : "text-sm"} font-black uppercase tracking-widest ${accentClasses.title}`}
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            {isTournament ? `GROUP ${label}` : key === "__all__" ? "League Table" : `Group ${label}`}
          </span>
          {isTournament && (
            <span className="text-[9px] font-bold text-gray-600 uppercase">
              {(edited[key] || teams).length} teams
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {messages[key] && (
            <span
              className={`text-[9px] font-black uppercase tracking-widest ${
                messages[key].type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {messages[key].text}
            </span>
          )}
          {isTournament && (
            <button
              onClick={() => autoCalcGD(key)}
              className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-500 hover:text-cyan-400"
              title="Auto-calculate GD (whole group)"
            >
              <FaCalculator size={10} />
            </button>
          )}
          <motion.button
            onClick={() => saveGroup(key, key)}
            disabled={saving === key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${accentClasses.button} text-[9px] font-black uppercase tracking-wider text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer`}
          >
            {saving === key ? <FaSync className="animate-spin" size={8} /> : <FaSave size={8} />}
            Save
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-bold">
          <thead>
            <tr className="text-gray-600 uppercase tracking-widest bg-gray-950/50">
              <th className="px-4 py-2 text-left w-8">#</th>
              <th className="px-4 py-2 text-left">Team</th>
              {STAT_LABELS.map((h) => (
                <th key={h} className="px-2 py-2 text-center w-10">{h}</th>
              ))}
              {!isTournament && <th className="px-2 py-2 w-6" />}
            </tr>
          </thead>
          <tbody>
            {(edited[key] || teams).map((team, idx) => (
              <tr
                key={team._id}
                className={`border-t border-gray-800/50 hover:bg-gray-800/20 transition-colors ${
                  idx < 2 ? `border-l-2 ${accentClasses.topBorder}` : ""
                }`}
              >
                <td className={`px-4 py-2 text-xs font-black ${idx < 2 ? accentClasses.title : "text-gray-600"}`}>
                  {idx + 1}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {(team.worldCupTeamLogo || team.logo) ? (
                      <div className="relative w-5 h-5 shrink-0">
                        <Image
                          src={team.worldCupTeamLogo || team.logo}
                          alt={team.teamName}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-800 shrink-0 flex items-center justify-center text-[8px] font-black text-gray-600">
                        {team.teamName?.[0]}
                      </div>
                    )}
                    <span className="text-white truncate max-w-[100px] text-[10px]">
                      {team.worldCupTeam?.split(" (")[0] || team.teamName}
                    </span>
                  </div>
                </td>
                {STAT_FIELDS.map((field) => (
                  <td key={field} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      value={(edited[key]?.[idx]?.[field] ?? 0)}
                      onChange={(e) => updateCell(key, idx, field, e.target.value)}
                      className={`w-9 text-center bg-gray-800/60 border rounded-lg py-1 text-[10px] text-white outline-none transition-colors ${
                        field === "pts"
                          ? `${accentClasses.ptsBorder || ""} ${accentClasses.pts} font-black border-opacity-30`
                          : `border-transparent hover:border-gray-700 ${accentClasses.focusBorder}`
                      }`}
                    />
                  </td>
                ))}
                {!isTournament && (
                  <td className="px-1 py-1 text-center">
                    <button
                      onClick={() => autoCalcGD(key, idx)}
                      title="Auto-calculate GD"
                      className="w-6 h-6 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <FaCalculator size={8} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <FaSync className={`animate-spin text-2xl ${accentClasses.spinner}`} />
      </div>
    );
  }

  const activeGroups = isTournament
    ? Object.keys(groups).filter((g) => groups[g]?.length > 0)
    : Object.keys(groups).sort();
  const hasGroups = activeGroups.length > 0;
  const hasUngroupedTeams = ungrouped.length > 0;

  return (
    <div className={`max-w-7xl mx-auto ${isTournament ? "px-4 md:px-8 py-8" : "p-6"}`}>
      {/* Header (league only) */}
      {!isTournament && (
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-black uppercase tracking-widest ${accentClasses.title}`}
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            League Standings
          </h2>
          <button
            onClick={fetchStandings}
            className="p-2 hover:bg-gray-900 rounded-xl transition-all text-gray-500 hover:text-white cursor-pointer"
          >
            <FaSync size={14} />
          </button>
        </div>
      )}

      {/* Empty state */}
      {!hasGroups && !hasUngroupedTeams && (
        <div className="text-center py-20">
          <FaSync className="text-gray-800 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">
            {isTournament
              ? "No groups assigned yet. Generate a draw first."
              : "No teams registered yet"}
          </p>
        </div>
      )}

      {/* Ungrouped table (league only) */}
      {!isTournament && hasUngroupedTeams && (
        <div className="mb-8">{renderTable("__all__", "All", ungrouped)}</div>
      )}

      {/* Groups grid */}
      {hasGroups && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeGroups.map((g) => renderTable(g, g, groups[g]))}
        </div>
      )}
    </div>
  );
}
