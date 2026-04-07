"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FaSync, FaPlay, FaStop, FaRandom, FaBell } from "react-icons/fa";
import Image from "next/image";

export default function ScoreEntry({ onUpdate }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [savingFixture, setSavingFixture] = useState(null);
  const [message, setMessage] = useState(null);
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchFixtures = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterGroup) params.set("group", filterGroup);
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(
        `/api/admin/competitions/tournament/fixtures?${params}`,
      );
      if (res.ok) {
        const data = await res.json();
        setFixtures(data.fixtures || []);
      }
    } catch (err) {
      console.error("Fixtures fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [filterGroup, filterStatus]);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  const generateDraw = async () => {
    if (
      !confirm(
        "This will generate a new random draw and overwrite existing fixtures. Continue?",
      )
    )
      return;
    setGenerating(true);
    try {
      const res = await fetch(
        "/api/admin/competitions/tournament/fixtures/generate",
        {
          method: "POST",
        },
      );
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        fetchFixtures();
        onUpdate?.();
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Draw generation failed." });
    } finally {
      setGenerating(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const updateFixture = async (fixtureId, updates) => {
    setSavingFixture(fixtureId);
    try {
      const res = await fetch("/api/admin/competitions/tournament/fixtures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId, ...updates }),
      });
      if (res.ok) {
        fetchFixtures();
        onUpdate?.();
      }
    } catch (err) {
      console.error("Fixture update failed:", err);
    } finally {
      setSavingFixture(null);
    }
  };

  const updateScore = (fixtureId, side, value) => {
    setFixtures((prev) =>
      prev.map((f) => {
        if (f._id === fixtureId) {
          return { ...f, [side]: parseInt(value) || 0 };
        }
        return f;
      }),
    );
  };

  // Group fixtures by group letter
  const groupedFixtures = {};
  fixtures.forEach((f) => {
    const group = f.groupLetter || "Ungrouped";
    if (!groupedFixtures[group]) groupedFixtures[group] = [];
    groupedFixtures[group].push(f);
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header with generate button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-sm font-black uppercase text-white tracking-widest">
            Fixtures & Scores
          </h3>
          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">
            {fixtures.length} fixtures ·{" "}
            {fixtures.filter((f) => f.status === "completed").length} completed
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filters */}
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-[9px] font-bold text-white"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateDraw}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-50"
          >
            {generating ? (
              <FaSync className="animate-spin" size={10} />
            ) : (
              <FaRandom size={10} />
            )}
            Generate Draw
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
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
            }}
            disabled={notifying}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider text-white disabled:opacity-50"
          >
            {notifying ? (
              <FaSync className="animate-spin" size={10} />
            ) : (
              <FaBell size={10} />
            )}
            Notify Teams
          </motion.button>
        </div>
      </div>

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

      {loading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <FaSync className="animate-spin text-yellow-500 text-2xl" />
        </div>
      ) : fixtures.length === 0 ? (
        <div className="text-center py-20">
          <FaRandom className="text-gray-800 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-sm font-bold uppercase tracking-widest mb-4">
            No fixtures yet
          </p>
          <p className="text-gray-700 text-[10px] font-bold uppercase mb-6">
            Generate a draw to create group-stage fixtures
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFixtures)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, groupFixtures]) => (
              <div key={group}>
                <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.3em] mb-4">
                  Group {group} · {groupFixtures.length} matches
                </h4>
                <div className="space-y-3">
                  {groupFixtures.map((fixture) => (
                    <motion.div
                      key={fixture._id}
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
                                alt={fixture.homeTeam?.teamName || "Home team"}
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

                        {/* Score */}
                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            min="0"
                            value={fixture.homeScore ?? ""}
                            onChange={(e) =>
                              updateScore(
                                fixture._id,
                                "homeScore",
                                e.target.value,
                              )
                            }
                            className="w-12 h-12 bg-gray-950 border border-gray-700 rounded-xl text-center text-lg font-black text-white focus:border-yellow-500 outline-none"
                            placeholder="-"
                          />
                          <span className="text-gray-600 font-black text-xs">
                            VS
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={fixture.awayScore ?? ""}
                            onChange={(e) =>
                              updateScore(
                                fixture._id,
                                "awayScore",
                                e.target.value,
                              )
                            }
                            className="w-12 h-12 bg-gray-950 border border-gray-700 rounded-xl text-center text-lg font-black text-white focus:border-yellow-500 outline-none"
                            placeholder="-"
                          />
                        </div>

                        {/* Away team */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative w-8 h-8 shrink-0">
                            {fixture.awayTeam?.worldCupTeamLogo ? (
                              <Image
                                src={fixture.awayTeam.worldCupTeamLogo}
                                alt={fixture.awayTeam?.teamName || "Away team"}
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
                              onClick={() =>
                                updateFixture(fixture._id, { status: "live" })
                              }
                              disabled={savingFixture === fixture._id}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-[8px] font-black uppercase text-white disabled:opacity-50"
                            >
                              <FaPlay size={8} /> Kick Off
                            </button>
                          )}
                          {fixture.status === "live" && (
                            <>
                              <button
                                onClick={() =>
                                  updateFixture(fixture._id, {
                                    homeScore: fixture.homeScore ?? 0,
                                    awayScore: fixture.awayScore ?? 0,
                                  })
                                }
                                disabled={savingFixture === fixture._id}
                                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-[8px] font-black uppercase text-white disabled:opacity-50"
                              >
                                Save Score
                              </button>
                              <button
                                onClick={() =>
                                  updateFixture(fixture._id, {
                                    status: "completed",
                                    homeScore: fixture.homeScore ?? 0,
                                    awayScore: fixture.awayScore ?? 0,
                                  })
                                }
                                disabled={savingFixture === fixture._id}
                                className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-[8px] font-black uppercase text-white disabled:opacity-50"
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

                          {/* Status badge */}
                          {fixture.status === "live" && (
                            <span className="text-[7px] font-black bg-green-600 text-white px-2 py-0.5 rounded-full uppercase animate-pulse">
                              LIVE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Matchday info */}
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
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
