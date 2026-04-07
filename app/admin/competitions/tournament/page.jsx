"use client";

import { useState, useEffect, useCallback } from "react";
import PDFViewer from "@/components/PDFViewer";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrophy,
  FaUsers,
  FaFutbol,
  FaArrowLeft,
  FaTimes,
  FaSave,
  FaSync,
  FaUserTie,
} from "react-icons/fa";
import Image from "next/image";
import StandingsEditor from "@/components/admin/tournament/StandingsEditor";
import PlayerEditor from "@/components/admin/tournament/PlayerEditor";
import ScoreEntry from "@/components/admin/tournament/ScoreEntry";
import useSSE from "@/hooks/useSSE";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

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

export default function AdminTournamentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const _canManageTournament = useFeatureAccess('admin.tournament.manage');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState(null); // null = landing, 'standings', 'players', 'scores'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [paymentStatusUpdating, setPaymentStatusUpdating] = useState(false);
  // Helper to get deposit slip URL (files stored in /public/uploads/payments/)
  const getDepositSlipUrl = (team) => {
    if (!team?.paymentScreenshot) return null;
    return `/uploads/payments/${team.paymentScreenshot}`;
  };

  // Admin: Update payment status
  const handlePaymentStatus = async (teamId, newStatus) => {
    setPaymentStatusUpdating(true);
    try {
      const res = await fetch("/api/admin/competitions/tournament/payment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, paymentStatus: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTeams((prev) =>
          prev.map((t) => (t._id === teamId ? updated.team : t)),
        );
        setSelectedTeam((prev) =>
          prev && prev._id === teamId ? updated.team : prev,
        );
        setEditForm((prev) =>
          prev && prev._id === teamId
            ? { ...prev, paymentStatus: newStatus }
            : prev,
        );
        setMessage({
          type: "success",
          text: `Payment status set to ${newStatus}`,
        });
        setTimeout(() => setMessage(null), 2500);
      } else {
        setMessage({ type: "error", text: "Failed to update payment status." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update payment status." });
    } finally {
      setPaymentStatusUpdating(false);
    }
  };

  // SSE connection for real-time updates
  const { connected } = useSSE("/api/sse/tournament", (data) => {
    if (data.type === "team-update") {
      setTeams((prev) =>
        prev.map((t) => (t._id === data.teamId ? data.team : t)),
      );
    }
    if (data.type === "standings-update") {
      // Refresh teams when standings change
      fetchTeams();
    }
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session.user.activeRole !== "admin")
      router.push("/");
  }, [status, session, router]);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tournament");
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
    setEditForm({ ...team });
  };

  const handleSaveTeam = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/competitions/tournament/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: editForm._id, updates: editForm }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTeams((prev) =>
          prev.map((t) => (t._id === editForm._id ? updated.team : t)),
        );
        setSelectedTeam(updated.team);
        setMessage({ type: "success", text: "Changes deployed!" });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to sync update." });
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════
  // LANDING VIEW: 3 Buttons + Floating Logos
  // ═══════════════════════════════════════════
  if (!activeView) {
    return (
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        {/* SSE connection indicator */}
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
            {connected ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Back to hub */}
        <div className="fixed top-24 left-6 z-50">
          <button
            onClick={() => router.push("/admin/competitions")}
            className="p-3 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 hover:border-green-500/30 transition-all"
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
          <h1
            className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            Tournament <span className="text-green-500">Master</span>
          </h1>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] mt-2">
            {teams.length} Squads Registered
          </p>
        </motion.div>

        {/* Floating logos background */}
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
              <div className="relative w-16 h-16 md:w-20 md:h-20 opacity-30 hover:opacity-100 transition-opacity duration-300">
                {team.worldCupTeamLogo ? (
                  <Image
                    src={team.worldCupTeamLogo}
                    alt={team.worldCupTeam?.split(" (")[0] || team.teamName}
                    fill
                    className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
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
              label: "Edit Tournament",
              desc: "Standings & Group Tables",
              icon: FaTrophy,
              color: "#22c55e",
              view: "standings",
            },
            {
              label: "Edit Players",
              desc: "Rosters, Staff & Profiles",
              icon: FaUsers,
              color: "#3b82f6",
              view: "players",
            },
            {
              label: "Update Scores",
              desc: "Live Fixtures & Results",
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
                className="w-full md:w-64 h-48 md:h-56 rounded-[30px] bg-gray-900 border border-gray-800 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:border-opacity-50"
                style={{ "--hover-border": btn.color }}
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

        {/* Team detail panel (when logo clicked) */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedTeam(null)}
              />

              {/* Left: Edit form */}
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
                      <h3 className="text-[10px] font-black uppercase text-green-500 tracking-[0.4em] mb-1">
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
                      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-all"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {editForm && (
                    <div className="space-y-8">
                      {/* Payment Proof & Status */}
                      <div className="bg-gray-800/20 rounded-3xl p-6 border border-yellow-400/20">
                        <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full" />{" "}
                          Deposit Slip / Payment
                        </h4>
                        {selectedTeam?.paymentScreenshot ? (
                          <div className="mb-4">
                            <button
                              className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-300 font-bold text-xs hover:bg-yellow-500/40 transition-all"
                              onClick={() => {
                                setPdfUrl(getDepositSlipUrl(selectedTeam));
                                setShowPDFModal(true);
                              }}
                            >
                              Preview Deposit Slip (PDF)
                            </button>
                          </div>
                        ) : (
                          <div className="mb-4 text-xs text-gray-500">
                            No deposit slip uploaded.
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-gray-400">
                            Payment Status:
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${
                              editForm.paymentStatus === "confirmed"
                                ? "bg-green-900/40 text-green-400 border border-green-700/50"
                                : editForm.paymentStatus === "pending"
                                  ? "bg-yellow-900/40 text-yellow-400 border border-yellow-700/50"
                                  : editForm.paymentStatus === "rejected"
                                    ? "bg-red-900/40 text-red-400 border border-red-700/50"
                                    : "bg-gray-800 text-gray-500"
                            }`}
                          >
                            {editForm.paymentStatus || "unpaid"}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            className="px-3 py-1 rounded bg-green-700/80 text-xs text-white font-bold disabled:opacity-50"
                            disabled={
                              paymentStatusUpdating ||
                              editForm.paymentStatus === "confirmed"
                            }
                            onClick={() =>
                              handlePaymentStatus(selectedTeam._id, "confirmed")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-700/80 text-xs text-white font-bold disabled:opacity-50"
                            disabled={
                              paymentStatusUpdating ||
                              editForm.paymentStatus === "rejected"
                            }
                            onClick={() =>
                              handlePaymentStatus(selectedTeam._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-gray-700/80 text-xs text-white font-bold disabled:opacity-50"
                            disabled={
                              paymentStatusUpdating ||
                              editForm.paymentStatus === "unpaid"
                            }
                            onClick={() =>
                              handlePaymentStatus(selectedTeam._id, "unpaid")
                            }
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                      {/* PDF Preview Modal */}
                      <AnimatePresence>
                        {showPDFModal && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur"
                          >
                            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
                              <button
                                className="absolute top-2 right-2 z-10 bg-gray-900 text-white rounded-full p-2 hover:bg-red-700/80"
                                onClick={() => setShowPDFModal(false)}
                              >
                                <FaTimes />
                              </button>
                              <div className="flex-1 overflow-auto p-4">
                                <PDFViewer
                                  url={pdfUrl}
                                  className="w-full h-[65vh] border rounded-xl bg-white"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Manager Identity */}
                      <div className="bg-gray-800/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />{" "}
                          Manager Identity
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-2xl bg-gray-950 border border-white/5 overflow-hidden shrink-0">
                              {editForm.managerImage ? (
                                <Image
                                  src={editForm.managerImage}
                                  alt={editForm.managerName || "Manager"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <FaUserTie
                                  className="absolute inset-0 m-auto text-gray-800"
                                  size={30}
                                />
                              )}
                            </div>
                            <input
                              value={editForm.managerImage || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  managerImage: e.target.value,
                                })
                              }
                              placeholder="Manager image URL (1:1)"
                              className="flex-1 bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-[10px] font-bold text-white"
                            />
                          </div>
                          <input
                            value={editForm.managerName || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                managerName: e.target.value,
                              })
                            }
                            placeholder="Manager Full Name"
                            className="w-full bg-gray-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:border-green-500 outline-none"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              value={editForm.managerPhone || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  managerPhone: e.target.value,
                                })
                              }
                              placeholder="Phone"
                              className="bg-gray-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white"
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
                              className="bg-gray-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Team Identity */}
                      <div className="bg-gray-800/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="w-1 h-1 bg-yellow-400 rounded-full" />{" "}
                          Team Identity
                        </h4>
                        <div className="space-y-4">
                          <input
                            value={editForm.teamName || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                teamName: e.target.value,
                              })
                            }
                            placeholder="Team Name"
                            className="w-full bg-gray-950 border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:border-yellow-500 outline-none"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block">
                                Group
                              </label>
                              <select
                                value={editForm.groupLetter || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    groupLetter: e.target.value,
                                  })
                                }
                                className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white"
                              >
                                <option value="">Unassigned</option>
                                {["A", "B", "C", "D", "E", "F", "G", "H"].map(
                                  (l) => (
                                    <option key={l} value={l}>
                                      Group {l}
                                    </option>
                                  ),
                                )}
                              </select>
                            </div>
                            <div>
                              <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block">
                                Status
                              </label>
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
                                <option value="disqualified">
                                  Disqualified
                                </option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Support Staff */}
                      <div className="bg-gray-800/20 rounded-3xl p-6 border border-white/5">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full" />{" "}
                          Support Staff
                        </h4>
                        {editForm.supportGuests?.map((guest, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-3 gap-3 mb-3"
                          >
                            <input
                              value={guest.name || ""}
                              onChange={(e) => {
                                const next = [...editForm.supportGuests];
                                next[idx] = {
                                  ...next[idx],
                                  name: e.target.value,
                                };
                                setEditForm({
                                  ...editForm,
                                  supportGuests: next,
                                });
                              }}
                              placeholder="Name"
                              className="bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold text-white"
                            />
                            <input
                              value={guest.role || ""}
                              onChange={(e) => {
                                const next = [...editForm.supportGuests];
                                next[idx] = {
                                  ...next[idx],
                                  role: e.target.value,
                                };
                                setEditForm({
                                  ...editForm,
                                  supportGuests: next,
                                });
                              }}
                              placeholder="Role (e.g. Ball Boy)"
                              className="bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold text-white"
                            />
                            <input
                              value={guest.image || ""}
                              onChange={(e) => {
                                const next = [...editForm.supportGuests];
                                next[idx] = {
                                  ...next[idx],
                                  image: e.target.value,
                                };
                                setEditForm({
                                  ...editForm,
                                  supportGuests: next,
                                });
                              }}
                              placeholder="Image URL"
                              className="bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-[9px] font-bold text-white"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Save button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveTeam}
                        disabled={saving}
                        className="w-full h-14 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? (
                          <FaSync className="animate-spin" />
                        ) : (
                          <FaSave />
                        )}
                        {saving ? "SYNCING..." : "DEPLOY CHANGES"}
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

              {/* Right: Massive logo */}
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden md:flex w-1/2 h-full items-center justify-center relative z-10"
              >
                <div className="relative w-[60%] aspect-square">
                  {selectedTeam.worldCupTeamLogo ? (
                    <Image
                      src={selectedTeam.worldCupTeamLogo}
                      alt={
                        selectedTeam.worldCupTeam?.split(" (")[0] ||
                        selectedTeam.teamName
                      }
                      fill
                      className="object-contain drop-shadow-[0_30px_60px_rgba(34,197,94,0.3)]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-4 border-dashed border-gray-700 flex items-center justify-center text-8xl font-black text-gray-700">
                      {selectedTeam.teamName?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-20 text-center w-full">
                  <h2
                    className="text-4xl font-black uppercase text-white tracking-widest"
                    style={{ fontFamily: "Impact, sans-serif" }}
                  >
                    {selectedTeam.worldCupTeam?.split(" (")[0]}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
                    {selectedTeam.teamName}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SUB-VIEWS: Standings / Players / Scores
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20">
      {/* Top bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 flex items-center h-14 px-6 justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView(null)}
            className="p-2.5 hover:bg-gray-900 rounded-xl transition-all border border-transparent hover:border-gray-800"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <h2
            className="font-black uppercase tracking-widest text-sm"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            <span className="text-green-500">
              {activeView === "standings" && "Edit Tournament"}
              {activeView === "players" && "Edit Players"}
              {activeView === "scores" && "Update Scores"}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">
            {connected ? "REAL-TIME ACTIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div className="pt-14">
        {activeView === "standings" && <StandingsEditor />}
        {activeView === "players" && (
          <PlayerEditor teams={teams} onTeamUpdate={fetchTeams} />
        )}
        {activeView === "scores" && <ScoreEntry onUpdate={fetchTeams} />}
      </div>
    </div>
  );
}
