"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaFutbol,
  FaSync,
  FaPlay,
  FaCheck,
  FaClock,
  FaDice,
} from "react-icons/fa";

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "text-gray-500", bg: "bg-gray-800" },
  live: { label: "Live", color: "text-green-400", bg: "bg-green-900/30" },
  completed: { label: "FT", color: "text-blue-400", bg: "bg-blue-900/30" },
  postponed: {
    label: "Postponed",
    color: "text-yellow-500",
    bg: "bg-yellow-900/20",
  },
};

export default function LeagueScoreEntry({ leagueId, onUpdate }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [matchdayFilter, setMatchdayFilter] = useState("all");

  const fetchFixtures = useCallback(async () => {
    if (!leagueId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/competitions/league/${leagueId}/fixtures`,
      );
      if (res.ok) {
        const data = await res.json();
        setFixtures(data.fixtures || []);
        // Seed score state
        const seed = {};
        (data.fixtures || []).forEach((f) => {
          seed[f._id] = { home: f.homeScore ?? "", away: f.awayScore ?? "" };
        });
        setScores(seed);
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const generateDraw = async () => {
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/admin/competitions/league/${leagueId}/fixtures/generate`,
        {
          method: "POST",
        },
      );
      if (res.ok) {
        await fetchFixtures();
        onUpdate?.();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to generate fixtures");
      }
    } finally {
      setGenerating(false);
    }
  };

  const updateFixture = async (fixtureId, newStatus) => {
    setSaving(fixtureId);
    try {
      const body = { fixtureId, status: newStatus };
      if (newStatus === "completed" || newStatus === "live") {
        body.homeScore = Number(scores[fixtureId]?.home ?? 0);
        body.awayScore = Number(scores[fixtureId]?.away ?? 0);
      }

      const res = await fetch(
        `/api/admin/competitions/league/${leagueId}/fixtures`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        await fetchFixtures();
        onUpdate?.();
      }
    } finally {
      setSaving(null);
    }
  };

  const matchdays = [...new Set(fixtures.map((f) => f.matchday))].sort(
    (a, b) => a - b,
  );

  const filtered = fixtures.filter((f) => {
    const statusOk = statusFilter === "all" || f.status === statusFilter;
    const matchdayOk =
      matchdayFilter === "all" || f.matchday === Number(matchdayFilter);
    return statusOk && matchdayOk;
  });

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <FaSync className="text-blue-500 animate-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <h2
          className="text-2xl font-black uppercase tracking-widest text-blue-400"
          style={{ fontFamily: "Impact, sans-serif" }}
        >
          Fixtures & Scores
        </h2>

        <div className="flex flex-wrap gap-3">
          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={matchdayFilter}
            onChange={(e) => setMatchdayFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
          >
            <option value="all">All Matchdays</option>
            {matchdays.map((md) => (
              <option key={md} value={md}>
                Matchday {md}
              </option>
            ))}
          </select>

          {/* Generate */}
          <motion.button
            onClick={generateDraw}
            disabled={generating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
          >
            {generating ? (
              <FaSync className="animate-spin" size={10} />
            ) : (
              <FaDice size={10} />
            )}
            {generating ? "Generating..." : "Generate Draw"}
          </motion.button>

          <button
            onClick={fetchFixtures}
            className="p-2 hover:bg-gray-900 rounded-xl transition-all text-gray-500 hover:text-white cursor-pointer"
          >
            <FaSync size={14} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <FaFutbol className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="font-bold uppercase tracking-widest text-sm">
            {fixtures.length === 0
              ? "No fixtures generated yet"
              : "No fixtures match the filter"}
          </p>
          {fixtures.length === 0 && (
            <p className="text-xs mt-2">
              Click &quot;Generate Draw&quot; to create the fixture list
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fixture) => {
            const cfg =
              STATUS_CONFIG[fixture.status] || STATUS_CONFIG.scheduled;
            const isSaving = saving === fixture._id;
            const home = fixture.homeTeam;
            const away = fixture.awayTeam;

            return (
              <motion.div
                key={fixture._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${cfg.bg} border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4`}
              >
                {/* Matchday badge */}
                <div className="w-14 text-center shrink-0">
                  <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest">
                    MD
                  </p>
                  <p className="text-lg font-black text-gray-500">
                    {fixture.matchday}
                  </p>
                  <span
                    className={`text-[8px] font-black uppercase ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                {/* Home team */}
                <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
                  <span className="text-sm font-black text-white uppercase tracking-tight truncate">
                    {home?.teamName || "TBD"}
                  </span>
                </div>

                {/* Score inputs */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="0"
                    value={scores[fixture._id]?.home ?? ""}
                    onChange={(e) =>
                      setScores((p) => ({
                        ...p,
                        [fixture._id]: {
                          ...p[fixture._id],
                          home: e.target.value,
                        },
                      }))
                    }
                    className="w-12 h-12 text-center text-lg font-black bg-gray-950 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500"
                    disabled={fixture.status === "completed"}
                  />
                  <span className="text-gray-600 font-black">:</span>
                  <input
                    type="number"
                    min="0"
                    value={scores[fixture._id]?.away ?? ""}
                    onChange={(e) =>
                      setScores((p) => ({
                        ...p,
                        [fixture._id]: {
                          ...p[fixture._id],
                          away: e.target.value,
                        },
                      }))
                    }
                    className="w-12 h-12 text-center text-lg font-black bg-gray-950 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500"
                    disabled={fixture.status === "completed"}
                  />
                </div>

                {/* Away team */}
                <div className="flex-1 flex items-center justify-start gap-3 min-w-0">
                  <span className="text-sm font-black text-white uppercase tracking-tight truncate">
                    {away?.teamName || "TBD"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 shrink-0">
                  {fixture.status === "scheduled" && (
                    <button
                      onClick={() => updateFixture(fixture._id, "live")}
                      disabled={isSaving}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {isSaving ? (
                        <FaSync className="animate-spin" size={8} />
                      ) : (
                        <FaPlay size={8} />
                      )}
                      Kick Off
                    </button>
                  )}

                  {fixture.status === "live" && (
                    <>
                      <button
                        onClick={() => updateFixture(fixture._id, "live")}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        {isSaving ? (
                          <FaSync className="animate-spin" size={8} />
                        ) : (
                          <FaClock size={8} />
                        )}
                        Update
                      </button>
                      <button
                        onClick={() => updateFixture(fixture._id, "completed")}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <FaCheck size={8} /> Full Time
                      </button>
                    </>
                  )}

                  {fixture.status === "completed" && (
                    <span className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-blue-400">
                      Final
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
