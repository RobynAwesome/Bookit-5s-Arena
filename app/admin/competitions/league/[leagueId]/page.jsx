"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFutbol,
  FaUsers,
  FaTrophy,
  FaArrowLeft,
  FaTimes,
  FaSave,
  FaSync,
  FaUserTie,
} from "react-icons/fa";
import LeagueStandingsEditor from "@/components/admin/league/StandingsEditor";
import LeaguePlayerEditor from "@/components/admin/league/PlayerEditor";
import LeagueScoreEntry from "@/components/admin/league/ScoreEntry";
import useSSE from "@/hooks/useSSE";

const StatusBadge = ({ status }) => {
  const map = {
    confirmed: "bg-green-900/40 text-green-400 border-green-700/50",
    pending: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
    disqualified: "bg-red-900/40 text-red-400 border-red-700/50",
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${map[status] || "bg-gray-800 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

export default function AdminLeagueDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const leagueId = params.leagueId;

  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const { connected } = useSSE(`/api/sse/league/${leagueId}`, (data) => {
    if (data.type === "team-update") {
      setTeams((prev) =>
        prev.map((t) => (t._id === data.teamId ? data.team : t)),
      );
    }
    if (data.type === "standings-update") fetchData();
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session.user.activeRole !== "admin")
      router.push("/");
  }, [status, session, router]);

  const fetchData = useCallback(async () => {
    if (!leagueId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/competitions/league/${leagueId}/teams`,
      );
      if (res.ok) {
        const data = await res.json();
        setLeague(data.league);
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setEditForm({ ...team });
  };

  const handleSaveTeam = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/admin/competitions/league/${leagueId}/teams`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teamId: editForm._id, updates: editForm }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setTeams((prev) =>
          prev.map((t) => (t._id === editForm._id ? data.team : t)),
        );
        setSelectedTeam(data.team);
        setMessage({ type: "success", text: "Changes deployed!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  if (!activeView) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* SSE indicator */}
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-blue-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Back */}
        <div className="fixed top-24 left-6 z-50">
          <button
            onClick={() => router.push("/admin/competitions/league")}
            className="p-3 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all cursor-pointer"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-28 pb-8 relative z-20"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">
            League Control
          </p>
          <h1
            className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            {league?.name || "Loading..."}
          </h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-2">
            {teams.length} Teams Registered
          </p>
        </motion.div>

        {/* Floating team logos */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {teams.map((team, i) => (
            <motion.div
              key={team._id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${10 + (i % 7) * 13}%`,
                top: `${20 + Math.floor(i / 7) * 25}%`,
              }}
              animate={{
                x: [0, Math.random() * 40 - 20, 0],
                y: [0, Math.random() * 30 - 15, 0],
              }}
              transition={{
                duration: 8 + Math.random() * 7,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.5, zIndex: 50 }}
              onClick={() => handleSelectTeam(team)}
            >
              <div className="relative w-14 h-14 md:w-18 md:h-18 opacity-30 hover:opacity-100 transition-opacity duration-300">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt={team.teamName}
                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center text-xl font-black text-gray-700">
                    {team.teamName?.[0]}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3 Action Buttons */}
        <div className="relative z-20 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 px-6 mt-8 md:mt-16">
          {[
            {
              label: "Edit League",
              desc: "Standings & Tables",
              icon: FaTrophy,
              color: "#3b82f6",
              view: "standings",
            },
            {
              label: "Edit Players",
              desc: "Rosters & Staff",
              icon: FaUsers,
              color: "#22c55e",
              view: "players",
            },
            {
              label: "Update Scores",
              desc: "Fixtures & Results",
              icon: FaFutbol,
              color: "#eab308",
              view: "scores",
            },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <motion.button
                key={btn.view}
                onClick={() => setActiveView(btn.view)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.08,
                  y: -8,
                  boxShadow: `0 20px 60px ${btn.color}40`,
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-64 h-48 md:h-56 rounded-[30px] bg-gray-900 border border-gray-800 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${btn.color}15`,
                    border: `1px solid ${btn.color}30`,
                  }}
                >
                  <Icon size={28} style={{ color: btn.color }} />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-black uppercase text-white tracking-widest">
                    {btn.label}
                  </h3>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider mt-1">
                    {btn.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Team detail overlay */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex"
            >
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedTeam(null)}
              />

              <motion.div
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative w-full md:w-1/2 h-full bg-gray-950 border-r border-gray-800 overflow-y-auto z-10"
              >
                <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] mb-1">
                        TEAM COMMAND
                      </h3>
                      <h2
                        className="text-2xl font-black uppercase tracking-tighter"
                        style={{ fontFamily: "Impact, sans-serif" }}
                      >
                        {selectedTeam.teamName}
                      </h2>
                      <StatusBadge status={selectedTeam.status} />
                    </div>
                    <button
                      onClick={() => setSelectedTeam(null)}
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all cursor-pointer"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {editForm && (
                    <div className="space-y-6">
                      {/* Manager */}
                      <div className="bg-gray-800/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />{" "}
                          Manager
                        </h4>
                        <div className="space-y-3">
                          <input
                            value={editForm.managerName || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                managerName: e.target.value,
                              })
                            }
                            placeholder="Manager Name"
                            className="w-full bg-gray-950 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold text-white focus:border-blue-500 outline-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              value={editForm.managerPhone || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  managerPhone: e.target.value,
                                })
                              }
                              placeholder="Phone"
                              className="bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white"
                            />
                            <input
                              value={editForm.managerEmail || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  managerEmail: e.target.value,
                                })
                              }
                              placeholder="Email"
                              className="bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Team Identity */}
                      <div className="bg-gray-800/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />{" "}
                          Team
                        </h4>
                        <div className="space-y-3">
                          <input
                            value={editForm.teamName || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                teamName: e.target.value,
                              })
                            }
                            placeholder="Team Name"
                            className="w-full bg-gray-950 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold text-white"
                          />
                          <select
                            value={editForm.status || "pending"}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                status: e.target.value,
                              })
                            }
                            className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="disqualified">Disqualified</option>
                          </select>
                        </div>
                      </div>

                      {/* Save */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveTeam}
                        disabled={saving}
                        className="w-full h-14 bg-linear-to-r from-blue-600 to-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? (
                          <FaSync className="animate-spin" />
                        ) : (
                          <FaSave />
                        )}
                        {saving ? "Syncing..." : "Deploy Changes"}
                      </motion.button>

                      {message && (
                        <p
                          className={`text-center text-[10px] font-black uppercase tracking-widest ${message.type === "success" ? "text-green-400" : "text-red-400"}`}
                        >
                          {message.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Right: Team display */}
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden md:flex w-1/2 h-full items-center justify-center relative z-10"
              >
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto mb-6 bg-gray-900 rounded-full border-2 border-blue-500/20 flex items-center justify-center overflow-hidden shadow-[0_0_80px_rgba(59,130,246,0.2)]">
                    {selectedTeam.logo ? (
                      <img
                        src={selectedTeam.logo}
                        alt={selectedTeam.teamName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-8xl font-black text-gray-700">
                        {selectedTeam.teamName?.[0]}
                      </span>
                    )}
                  </div>
                  <h2
                    className="text-4xl font-black uppercase text-white tracking-widest"
                    style={{ fontFamily: "Impact, sans-serif" }}
                  >
                    {selectedTeam.teamName}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                    {league?.name}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      <div className="fixed top-20 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 flex items-center h-14 px-6 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView(null)}
            className="p-2.5 hover:bg-gray-900 rounded-xl transition-all border border-transparent hover:border-gray-800 cursor-pointer"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <h2
            className="font-black uppercase tracking-widest text-sm"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            <span className="text-blue-400">
              {activeView === "standings" && "Edit League"}
              {activeView === "players" && "Edit Players"}
              {activeView === "scores" && "Update Scores"}
            </span>
            {league && (
              <span className="text-gray-600 ml-2 font-bold text-xs">
                — {league.name}
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-blue-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
            {connected ? "REAL-TIME ACTIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div className="pt-14">
        {activeView === "standings" && (
          <LeagueStandingsEditor leagueId={leagueId} />
        )}
        {activeView === "players" && (
          <LeaguePlayerEditor
            leagueId={leagueId}
            teams={teams}
            onTeamUpdate={fetchData}
          />
        )}
        {activeView === "scores" && (
          <LeagueScoreEntry leagueId={leagueId} onUpdate={fetchData} />
        )}
      </div>
    </div>
  );
}
