"use client";

/**
 * @file components/admin/shared/CompetitionScoreEntry.jsx
 * Unified score entry for both tournament and league competitions.
 * Replaces:
 *   - components/admin/tournament/ScoreEntry.jsx
 *   - components/admin/league/ScoreEntry.jsx
 *
 * @param {{
 *   competitionType: 'tournament' | 'league',
 *   leagueId?: string,
 *   onUpdate?: () => void,
 * }} props
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaSync,
  FaPlay,
  FaStop,
  FaCheck,
  FaClock,
  FaRandom,
  FaBell,
  FaFutbol,
} from "react-icons/fa";

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "text-gray-500", bg: "bg-gray-900" },
  live: { label: "Live", color: "text-green-400", bg: "bg-green-900/20" },
  completed: {
    label: "FT",
    color: "text-gray-500",
    bg: "bg-gray-900 opacity-70",
  },
  postponed: {
    label: "Postponed",
    color: "text-yellow-500",
    bg: "bg-yellow-900/20",
  },
};

export default function CompetitionScoreEntry({
  competitionType = "tournament",
  leagueId,
  onUpdate,
}) {
  const isTournament = competitionType === "tournament";

  const accentClasses = {
    spinner: isTournament ? "text-yellow-500" : "text-blue-500",
    title: isTournament ? "text-white" : "text-blue-400",
    generateBtn: isTournament
      ? "bg-yellow-600 hover:bg-yellow-500"
      : "bg-blue-600 hover:bg-blue-500",
    scoreFocus: isTournament
      ? "focus:border-yellow-500"
      : "focus:border-blue-500",
    groupLabel: isTournament ? "text-yellow-400" : "text-blue-400",
  };

  const apiBase = isTournament
    ? "/api/admin/competitions/tournament/fixtures"
    : `/api/admin/competitions/league/${leagueId}/fixtures`;

  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState(null);

  // Tournament filters
  const [filterGroup, setFilterGroup] = useState("");
  // League filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [matchdayFilter, setMatchdayFilter] = useState("all");

  const fetchFixtures = useCallback(async () => {
    if (!isTournament && !leagueId) return;
    try {
      setLoading(true);
      let url = apiBase;
      if (isTournament) {
        const params = new URLSearchParams();
        if (filterGroup) params.set("group", filterGroup);
        if (url && params.toString()) url += `?${params}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const list = data.fixtures || [];
        setFixtures(list);
        // Seed scores state
        const seed = {};
        list.forEach((f) => {
          seed[f._id] = {
            home: f.homeScore ?? "",
            away: f.awayScore ?? "",
          };
        });
        setScores(seed);
      }
    } catch (err) {
      console.error("Fixtures fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, isTournament, leagueId, filterGroup]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const generateDraw = async () => {
    if (
      isTournament &&
      !confirm(
        "This will generate a new random draw and overwrite existing fixtures. Continue?",
      )
    )
      return;
    setGenerating(true);
    try {
      const res = await fetch(`${apiBase}/generate`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: data.message || "Draw generated!",
        });
        await fetchFixtures();
        onUpdate?.();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to generate fixtures.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Draw generation failed." });
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const updateFixture = async (fixtureId, newStatus) => {
    setSaving(fixtureId);
    try {
      const body = { fixtureId, status: newStatus };
      if (newStatus === "live" || newStatus === "completed") {
        body.homeScore = Number(scores[fixtureId]?.home ?? 0);
        body.awayScore = Number(scores[fixtureId]?.away ?? 0);
      }

      const res = await fetch(apiBase, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchFixtures();
        onUpdate?.();
      }
    } catch (err) {
      console.error("Fixture update failed:", err);
    } finally {
      setSaving(null);
    }
  };

  const notifyTeams = async () => {
    setNotifying(true);
    try {
      const res = await fetch("/api/admin/notifications/fixture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "schedule",
          competitionType: "tournament",
          ...(filterGroup && { groupLetter: filterGroup }),
        }),
      });
      const data = await res.json();
      setMessage({
        type: res.ok ? "success" : "error",
        text: data.message || data.error,
      });
    } catch {
      setMessage({ type: "error", text: "Notification failed." });
    } finally {
      setNotifying(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // League: derive matchday list for filter
  const matchdays = isTournament
    ? []
    : [...new Set(fixtures.map((f) => f.matchday))].sort((a, b) => a - b);

  // Filter & group fixtures
  const filtered = isTournament
    ? fixtures // tournament filtering is server-side via params
    : fixtures.filter((f) => {
        const statusOk = statusFilter === "all" || f.status === statusFilter;
        const matchdayOk =
          matchdayFilter === "all" || f.matchday === Number(matchdayFilter);
        return statusOk && matchdayOk;
      });

  // Tournament: group by groupLetter
  const groupedFixtures = {};
  if (isTournament) {
    filtered.forEach((f) => {
      const g = f.groupLetter || "Ungrouped";
      if (!groupedFixtures[g]) groupedFixtures[g] = [];
      groupedFixtures[g].push(f);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <FaSync className={`animate-spin text-2xl ${accentClasses.spinner}`} />
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto ${isTournament ? "px-6 py-8" : "p-6"}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          {isTournament ? (
            <>
              <h3 className="text-sm font-black uppercase text-white tracking-widest">
                Fixtures & Scores
              </h3>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                {fixtures.length} fixtures ·{" "}
                {fixtures.filter((f) => f.status === "completed").length}{" "}
                completed
              </p>
            </>
          ) : (
            <h2
              className={`text-2xl font-black uppercase tracking-widest ${accentClasses.title}`}
              style={{ fontFamily: "Impact, sans-serif" }}
            >
              Fixtures & Scores
            </h2>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tournament: group filter */}
          {isTournament && (
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-[9px] font-bold text-white"
            >
              <option value="">All Groups</option>
              {["A", "B", "C", "D", "E", "F", "G", "H"].map((l) => (
                <option key={l} value={l}>
                  Group {l}
                </option>
              ))}
            </select>
          )}

          {/* Shared: status filter */}
          <select
            value={isTournament ? "" : statusFilter}
            onChange={(e) =>
              isTournament ? undefined : setStatusFilter(e.target.value)
            }
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-[9px] font-bold text-white"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>

          {/* League: matchday filter */}
          {!isTournament && (
            <select
              value={matchdayFilter}
              onChange={(e) => setMatchdayFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-[9px] font-bold text-white"
            >
              <option value="all">All Matchdays</option>
              {matchdays.map((md) => (
                <option key={md} value={md}>
                  Matchday {md}
                </option>
              ))}
            </select>
          )}

          {/* Generate Draw */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateDraw}
            disabled={generating}
            className={`flex items-center gap-2 px-4 py-2 ${accentClasses.generateBtn} rounded-lg text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-50 cursor-pointer`}
          >
            {generating ? (
              <FaSync className="animate-spin" size={10} />
            ) : (
              <FaRandom size={10} />
            )}
            {generating ? "Generating…" : "Generate Draw"}
          </motion.button>

          {/* Tournament only: Notify Teams */}
          {isTournament && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={notifyTeams}
              disabled={notifying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-50 cursor-pointer"
            >
              {notifying ? (
                <FaSync className="animate-spin" size={10} />
              ) : (
                <FaBell size={10} />
              )}
              Notify Teams
            </motion.button>
          )}

          {/* League only: Refresh */}
          {!isTournament && (
            <button
              onClick={fetchFixtures}
              className="p-2 hover:bg-gray-900 rounded-xl transition-all text-gray-500 hover:text-white cursor-pointer"
            >
              <FaSync size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Message banner */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest ${
            message.type === "success"
              ? "bg-green-900/30 text-green-400 border border-green-800"
              : "bg-red-900/30 text-red-400 border border-red-800"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <FaFutbol className="text-gray-800 text-4xl mx-auto mb-4 opacity-30" />
          <p className="text-gray-600 text-sm font-bold uppercase tracking-widest mb-2">
            {fixtures.length === 0
              ? "No fixtures yet"
              : "No fixtures match the filter"}
          </p>
          {fixtures.length === 0 && (
            <p className="text-gray-700 text-[10px] font-bold uppercase">
              {isTournament
                ? "Generate a draw to create group-stage fixtures"
                : 'Click "Generate Draw" to create the fixture list'}
            </p>
          )}
        </div>
      )}

      {/* Tournament: grouped view */}
      {isTournament && filtered.length > 0 && (
        <div className="space-y-8">
          {Object.entries(groupedFixtures)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, groupFixtures]) => (
              <div key={group}>
                <h4
                  className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${accentClasses.groupLabel}`}
                >
                  Group {group} · {groupFixtures.length} matches
                </h4>
                <div className="space-y-3">
                  {groupFixtures.map((fixture) => (
                    <TournamentFixtureRow
                      key={fixture._id}
                      fixture={fixture}
                      scores={scores}
                      setScores={setScores}
                      saving={saving}
                      updateFixture={updateFixture}
                      accentClasses={accentClasses}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* League: flat list */}
      {!isTournament && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((fixture) => (
            <LeagueFixtureRow
              key={fixture._id}
              fixture={fixture}
              scores={scores}
              setScores={setScores}
              saving={saving}
              updateFixture={updateFixture}
              accentClasses={accentClasses}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tournament fixture row ────────────────────────────────────────────────────
function TournamentFixtureRow({
  fixture,
  scores,
  setScores,
  saving,
  updateFixture,
  accentClasses,
}) {
  const isSaving = saving === fixture._id;

  return (
    <motion.div
      className={`bg-gray-900 rounded-xl border p-4 transition-all ${
        fixture.status === "live"
          ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          : fixture.status === "completed"
            ? "border-gray-800 opacity-70"
            : "border-gray-800"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
          <span className="text-[10px] font-bold text-white truncate text-right">
            {fixture.homeTeam?.worldCupTeam?.split(" (")[0] ||
              fixture.homeTeam?.teamName ||
              "TBD"}
          </span>
          <div className="relative w-8 h-8 shrink-0">
            {fixture.homeTeam?.worldCupTeamLogo ? (
              <Image
                src={fixture.homeTeam.worldCupTeamLogo}
                alt={fixture.homeTeam?.teamName || "Home"}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[8px] font-black text-gray-600">
                H
              </div>
            )}
          </div>
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
                [fixture._id]: { ...p[fixture._id], home: e.target.value },
              }))
            }
            className={`w-12 h-12 bg-gray-950 border border-gray-700 rounded-xl text-center text-lg font-black text-white outline-none ${accentClasses.scoreFocus}`}
            placeholder="-"
            disabled={fixture.status === "completed"}
          />
          <span className="text-gray-600 font-black text-xs">VS</span>
          <input
            type="number"
            min="0"
            value={scores[fixture._id]?.away ?? ""}
            onChange={(e) =>
              setScores((p) => ({
                ...p,
                [fixture._id]: { ...p[fixture._id], away: e.target.value },
              }))
            }
            className={`w-12 h-12 bg-gray-950 border border-gray-700 rounded-xl text-center text-lg font-black text-white outline-none ${accentClasses.scoreFocus}`}
            placeholder="-"
            disabled={fixture.status === "completed"}
          />
        </div>

        {/* Away team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative w-8 h-8 shrink-0">
            {fixture.awayTeam?.worldCupTeamLogo ? (
              <Image
                src={fixture.awayTeam.worldCupTeamLogo}
                alt={fixture.awayTeam?.teamName || "Away"}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[8px] font-black text-gray-600">
                A
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold text-white truncate">
            {fixture.awayTeam?.worldCupTeam?.split(" (")[0] ||
              fixture.awayTeam?.teamName ||
              "TBD"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {fixture.status === "scheduled" && (
            <button
              onClick={() => updateFixture(fixture._id, "live")}
              disabled={isSaving}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-[8px] font-black uppercase text-white disabled:opacity-50 cursor-pointer"
            >
              <FaPlay size={8} /> Kick Off
            </button>
          )}
          {fixture.status === "live" && (
            <>
              <button
                onClick={() => updateFixture(fixture._id, "live")}
                disabled={isSaving}
                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-[8px] font-black uppercase text-white disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <FaSync className="animate-spin" size={8} />
                ) : (
                  "Save Score"
                )}
              </button>
              <button
                onClick={() => updateFixture(fixture._id, "completed")}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-[8px] font-black uppercase text-white disabled:opacity-50 cursor-pointer"
              >
                <FaStop size={8} /> Full Time
              </button>
            </>
          )}
          {fixture.status === "completed" && (
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
              FT
            </span>
          )}
          {fixture.status === "live" && (
            <span className="text-[7px] font-black bg-green-600 text-white px-2 py-0.5 rounded-full uppercase animate-pulse">
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Matchday / date info */}
      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-800/50">
        <span className="text-[8px] font-bold text-gray-700 uppercase tracking-wider">
          Matchday {fixture.matchday}
        </span>
        {fixture.scheduledAt && (
          <span className="text-[8px] font-bold text-gray-700">
            {new Date(fixture.scheduledAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── League fixture row ────────────────────────────────────────────────────────
function LeagueFixtureRow({
  fixture,
  scores,
  setScores,
  saving,
  updateFixture,
  accentClasses,
}) {
  const cfg = STATUS_CONFIG[fixture.status] || STATUS_CONFIG.scheduled;
  const isSaving = saving === fixture._id;
  const home = fixture.homeTeam;
  const away = fixture.awayTeam;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${cfg.bg} border border-gray-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4`}
    >
      {/* Matchday badge */}
      <div className="w-14 text-center shrink-0">
        <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest">
          MD
        </p>
        <p className="text-lg font-black text-gray-500">{fixture.matchday}</p>
        <span className={`text-[8px] font-black uppercase ${cfg.color}`}>
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
              [fixture._id]: { ...p[fixture._id], home: e.target.value },
            }))
          }
          className={`w-12 h-12 text-center text-lg font-black bg-gray-950 border border-gray-700 rounded-xl text-white outline-none ${accentClasses.scoreFocus}`}
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
              [fixture._id]: { ...p[fixture._id], away: e.target.value },
            }))
          }
          className={`w-12 h-12 text-center text-lg font-black bg-gray-950 border border-gray-700 rounded-xl text-white outline-none ${accentClasses.scoreFocus}`}
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
}
