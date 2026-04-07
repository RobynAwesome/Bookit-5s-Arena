"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaUsers,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFutbol,
  FaIdBadge,
  FaEdit,
  FaSync,
  FaLock,
  FaInfoCircle,
  FaUserTie,
  FaShieldAlt,
} from "react-icons/fa";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import ManagerNavbar from "@/components/manager/ManagerNavbar";

const POSITIONS = ["GK", "DEF", "MID", "FWD"];

// Security-sorted feature access matrix for managers
const MANAGER_PERMISSIONS = {
  allowed: [
    { label: "View your team & squad", icon: FaUsers },
    { label: "Edit player names & positions", icon: FaFutbol },
    { label: "Update player photos (URL)", icon: FaEdit },
    { label: "Edit support staff details", icon: FaUserTie },
    { label: "View your fixtures & schedule", icon: FaCheckCircle },
    { label: "View league/tournament standings", icon: FaCheckCircle },
  ],
  blocked: [
    { label: "Edit standings (MP/W/D/L/PTS)", icon: FaLock },
    { label: "Change group assignment", icon: FaLock },
    { label: "Confirm/edit payment status", icon: FaLock },
    { label: "Access other teams data", icon: FaLock },
    { label: "Set match scores or kick off", icon: FaLock },
    { label: "Generate fixture draws", icon: FaLock },
  ],
};

export default function ManagerSquadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canEditSquad = useFeatureAccess('manager.squad.edit');
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedPlayers, setEditedPlayers] = useState([]);
  const [editedSupport, setEditedSupport] = useState([]);
  const [message, setMessage] = useState(null);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated") {
      if (session.user.activeRole !== "manager") {
        router.replace("/");
      } else {
        fetchMyTeam();
      }
    }
  }, [status, session]);

  const fetchMyTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tournament/my-team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        setEditedPlayers(JSON.parse(JSON.stringify(data.team.players || [])));
        setEditedSupport(
          JSON.parse(JSON.stringify(data.team.supportGuests || [])),
        );
      } else if (res.status === 404) {
        setTeam(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tournament/my-team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: editedPlayers,
          supportGuests: editedSupport,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setTeam(data.team);
      setEditing(false);
      setMessage({ type: "success", text: "Squad updated successfully!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const updatePlayer = (idx, field, value) => {
    setEditedPlayers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const updateSupport = (idx, field, value) => {
    setEditedSupport((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <FaUsers className="animate-pulse text-blue-500 text-4xl" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <FaExclamationTriangle className="text-yellow-500 text-5xl mb-4" />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-2">
          No Registration Found
        </h1>
        <p className="text-gray-400 max-w-md mb-8">
          You haven&apos;t registered a team for the 5s Arena World Cup. Register to
          manage your squad.
        </p>
        <Link
          href="/tournament"
          className="px-8 py-3 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
        >
          Register Team
        </Link>
      </div>
    );
  }

  const isConfirmed = team.paymentStatus === "confirmed";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ManagerNavbar session={session} connected={false} />
      <div className="pt-24 pb-20 px-4 md:px-6">
      {/* Animated page title */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">
          Manager Interface
        </p>
        <h1
          className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter"
          style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
        >
          SQUAD <span className="text-blue-400">MANAGEMENT</span>
        </h1>
        <div className="h-1 w-16 bg-blue-500 mx-auto mt-4 rounded-full" />
      </motion.div>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/manager/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <FaArrowLeft size={10} /> Dashboard
          </Link>
          <button
            onClick={() => setShowPermissions((p) => !p)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
          >
            <FaShieldAlt size={10} /> Your Access Level
          </button>
        </div>

        {/* Permissions panel */}
        <AnimatePresence>
          {showPermissions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-900 border border-gray-800 rounded-3xl">
                <div>
                  <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FaCheckCircle size={10} /> Allowed
                  </h4>
                  <ul className="space-y-2">
                    {MANAGER_PERMISSIONS.allowed.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-2 text-[10px] text-gray-400"
                      >
                        <item.icon
                          className="text-green-500 shrink-0"
                          size={9}
                        />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FaLock size={10} /> Blocked
                  </h4>
                  <ul className="space-y-2">
                    {MANAGER_PERMISSIONS.blocked.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-2 text-[10px] text-gray-600"
                      >
                        <FaLock className="text-red-800 shrink-0" size={9} />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-5">
            {team.worldCupTeamLogo && (
              <div className="relative w-20 h-20 shrink-0">
                <Image
                  src={team.worldCupTeamLogo}
                  alt={team.worldCupTeam || team.teamName}
                  fill
                  className="object-contain drop-shadow-lg"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    isConfirmed
                      ? "bg-green-900/20 text-green-400 border-green-500/30"
                      : "bg-yellow-900/20 text-yellow-500 border-yellow-500/30"
                  }`}
                >
                  {isConfirmed ? (
                    <>
                      <FaCheckCircle className="inline mr-1" />
                      Confirmed
                    </>
                  ) : (
                    <>
                      <FaHourglassHalf className="inline mr-1" />
                      Pending Payment
                    </>
                  )}
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-black uppercase tracking-tight"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                {team.teamName} <span className="text-blue-400">Squad</span>
              </h1>
              {team.worldCupTeam && (
                <p className="text-gray-500 mt-1 text-sm">
                  Representing{" "}
                  <span className="text-white font-bold">
                    {team.worldCupTeam.split(" (")[0]}
                  </span>
                </p>
              )}
              {team.groupLetter && (
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">
                  Group {team.groupLetter}
                </p>
              )}
            </div>
          </div>

          {!isConfirmed && (
            <div className="bg-red-900/20 border border-red-800/30 p-4 rounded-2xl flex items-start gap-3 max-w-sm">
              <FaExclamationTriangle
                className="text-red-500 shrink-0 mt-0.5"
                size={14}
              />
              <p className="text-[10px] text-red-300 leading-relaxed uppercase font-black tracking-wider">
                Editing locked until payment is verified by admin.
              </p>
            </div>
          )}
        </div>

        {/* Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-xl text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-900/20 text-green-400 border-green-500/30"
                  : "bg-red-900/20 text-red-500 border-red-500/30"
              }`}
            >
              {message.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationTriangle />
              )}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Starters */}
        <div className="mb-8">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-green-400 mb-4">
            Starting Five
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(editing ? editedPlayers : team.players || [])
              .filter((p) => !p.isReserve)
              .map((p, i) => (
                <PlayerCard
                  key={i}
                  player={p}
                  index={i}
                  editing={editing}
                  isReserve={false}
                  onChange={(field, value) => {
                    const actualIdx = (
                      editing ? editedPlayers : team.players
                    ).findIndex((ep, idx) => !ep.isReserve && idx === i);
                    updatePlayer(i, field, value);
                  }}
                />
              ))}
          </div>
        </div>

        {/* Reserves */}
        {(team.players || []).filter((p) => p.isReserve).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-yellow-400 mb-4">
              Reserves
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(editing ? editedPlayers : team.players)
                .filter((p) => p.isReserve)
                .map((p, i) => (
                  <PlayerCard
                    key={i}
                    player={p}
                    index={i}
                    editing={editing}
                    isReserve={true}
                    onChange={(field, value) => {
                      const starters = (
                        editing ? editedPlayers : team.players
                      ).filter((ep) => !ep.isReserve).length;
                      updatePlayer(starters + i, field, value);
                    }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Support Staff */}
        {(editing ? editedSupport : team.supportGuests || []).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-4">
              Support Staff
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(editing ? editedSupport : team.supportGuests).map((g, i) => (
                <div
                  key={i}
                  className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 ${editing ? "border-blue-500/20" : ""}`}
                >
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        value={g.name || ""}
                        onChange={(e) =>
                          updateSupport(i, "name", e.target.value)
                        }
                        placeholder="Name"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <input
                        value={g.role || ""}
                        onChange={(e) =>
                          updateSupport(i, "role", e.target.value)
                        }
                        placeholder="Role (e.g. Ball Boy)"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-white">
                        {g.name || "Unnamed"}
                      </p>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        {g.role || "—"}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          {isConfirmed && !editing && canEditSquad && (
            <motion.button
              onClick={() => setEditing(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white font-black uppercase tracking-widest rounded-xl border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer text-xs"
            >
              <FaEdit size={12} /> Edit Squad
            </motion.button>
          )}

          {editing && (
            <>
              <motion.button
                onClick={() => {
                  setEditing(false);
                  setEditedPlayers(
                    JSON.parse(JSON.stringify(team.players || [])),
                  );
                  setEditedSupport(
                    JSON.parse(JSON.stringify(team.supportGuests || [])),
                  );
                }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-gray-400 font-black uppercase tracking-widest rounded-xl border border-gray-800 hover:text-white transition-all cursor-pointer text-xs"
              >
                <FaTimes size={12} /> Cancel
              </motion.button>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-900/20 hover:bg-green-500 transition-all cursor-pointer disabled:opacity-50 text-xs"
              >
                {saving ? (
                  <FaSync className="animate-spin" size={12} />
                ) : (
                  <FaSave size={12} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

function PlayerCard({ player, index, editing, isReserve, onChange }) {
  return (
    <motion.div
      className={`p-4 rounded-2xl border transition-all ${
        editing
          ? isReserve
            ? "bg-gray-800 border-yellow-500/20"
            : "bg-gray-800 border-green-500/20"
          : "bg-gray-900 border-gray-800"
      }`}
      whileHover={!editing ? { scale: 1.01 } : {}}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-sm border border-gray-700 shrink-0">
          {isReserve ? (
            <FaIdBadge className="text-yellow-500" />
          ) : (
            <span className="font-black text-gray-600">{index + 1}</span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">
            {isReserve ? `Reserve #${index + 1}` : `Starter #${index + 1}`}
          </p>
          {editing ? (
            <div className="flex gap-2">
              <input
                value={player.name || ""}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Player Name"
                className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-green-500 outline-none"
              />
              <select
                value={player.position || "MID"}
                onChange={(e) => onChange("position", e.target.value)}
                className="bg-gray-950 border border-gray-700 rounded-lg px-2 text-xs text-gray-400"
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-sm text-white">
                {player.name || `Player ${index + 1}`}
              </h3>
              <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">
                {player.position}
              </p>
            </>
          )}
        </div>
      </div>
      {editing && (
        <input
          value={player.image || ""}
          onChange={(e) => onChange("image", e.target.value)}
          placeholder="Photo URL (optional)"
          className="w-full mt-2 bg-gray-950 border border-gray-700 rounded-lg px-3 py-1.5 text-[10px] text-gray-500 focus:border-green-500 outline-none"
        />
      )}
    </motion.div>
  );
}
