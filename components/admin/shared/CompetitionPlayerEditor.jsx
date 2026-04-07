"use client";

/**
 * @file components/admin/shared/CompetitionPlayerEditor.jsx
 * Unified player/roster editor for both tournament and league competitions.
 * Replaces:
 *   - components/admin/tournament/PlayerEditor.jsx
 *   - components/admin/league/PlayerEditor.jsx
 *
 * @param {{
 *   competitionType: 'tournament' | 'league',
 *   leagueId?: string,
 *   teams: Array,
 *   onTeamUpdate?: () => void,
 * }} props
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaSave,
  FaSync,
  FaUserTie,
  FaFutbol,
  FaIdBadge,
} from "react-icons/fa";

const POSITIONS = ["GK", "DEF", "MID", "FWD"];

export default function CompetitionPlayerEditor({
  competitionType = "tournament",
  leagueId,
  teams,
  onTeamUpdate,
}) {
  const isTournament = competitionType === "tournament";

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editingPlayerIdx, setEditingPlayerIdx] = useState(null); // tournament only
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const selectTeam = (team) => {
    setSelectedTeam(team);
    setEditForm(JSON.parse(JSON.stringify(team)));
    setEditingPlayerIdx(null);
    setMessage(null);
  };

  const handleBack = () => {
    setSelectedTeam(null);
    setEditForm(null);
    setEditingPlayerIdx(null);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const url = isTournament
        ? "/api/admin/competitions/tournament/team"
        : `/api/admin/competitions/league/${leagueId}/teams`;

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: editForm._id, updates: editForm }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!isTournament && data.team) {
          setSelectedTeam(data.team);
          setEditForm(JSON.parse(JSON.stringify(data.team)));
        }
        setMessage({ type: "success", text: "Roster updated!" });
        onTeamUpdate?.();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: err.error || "Save failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Save failed." });
    } finally {
      setSaving(false);
    }
  };

  const updatePlayer = (idx, field, value) => {
    setEditForm((prev) => {
      const players = [...prev.players];
      players[idx] = { ...players[idx], [field]: value };
      return { ...prev, players };
    });
  };

  const updateSupport = (idx, field, value) => {
    setEditForm((prev) => {
      const g = [...(prev.supportGuests || [])];
      g[idx] = { ...g[idx], [field]: value };
      return { ...prev, supportGuests: g };
    });
  };

  // ── Team selector ───────────────────────────────────────────────────────────
  if (!selectedTeam) {
    if (isTournament) {
      // Floating logo grid (tournament style)
      return (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 text-center">
            Select a team to edit players
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {teams.map((team, i) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.3, y: -10 }}
                onClick={() => selectTeam(team)}
                className="cursor-pointer group"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24">
                  {team.worldCupTeamLogo ? (
                    <Image
                      src={team.worldCupTeamLogo}
                      alt={team.worldCupTeam?.split(" (")[0] || team.teamName}
                      fill
                      className="object-contain opacity-60 group-hover:opacity-100 transition-opacity drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center text-2xl font-black text-gray-700 group-hover:text-blue-400 transition-colors">
                      {team.teamName?.[0]}
                    </div>
                  )}
                </div>
                <p className="text-[8px] font-bold text-gray-600 text-center mt-2 uppercase tracking-wider group-hover:text-blue-400 transition-colors">
                  {team.worldCupTeam?.split(" (")[0] || team.teamName}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    // Card grid (league style)
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2
          className="text-2xl font-black uppercase tracking-widest text-blue-400 mb-6"
          style={{ fontFamily: "Impact, sans-serif" }}
        >
          Select Team
        </h2>
        {teams.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="font-bold uppercase tracking-widest text-sm">
              No teams registered
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((team) => (
              <motion.button
                key={team._id}
                onClick={() => selectTeam(team)}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                className="bg-gray-900 rounded-3xl border border-gray-800 hover:border-blue-500/30 p-6 text-center cursor-pointer transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                  {team.logo ? (
                    <Image
                      src={team.logo}
                      alt={team.teamName}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-gray-600">
                      {team.teamName?.[0]}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">
                  {team.teamName}
                </h3>
                <p className="text-[9px] font-bold text-gray-600 uppercase">
                  {(team.players || []).length} players
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Tournament edit view ────────────────────────────────────────────────────
  if (isTournament) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-900 rounded-xl transition-all cursor-pointer"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-widest">
              {selectedTeam.worldCupTeam?.split(" (")[0]} —{" "}
              {selectedTeam.teamName}
            </h3>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">
              {editForm.players.length} Players ·{" "}
              {editForm.supportGuests?.length || 0} Staff
            </p>
          </div>
        </div>

        {message && (
          <p
            className={`mb-4 text-center text-[10px] font-black uppercase tracking-widest ${
              message.type === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Player grid */}
          <div>
            <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">
              Squad
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {editForm.players.map((player, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.04 }}
                  onClick={() => setEditingPlayerIdx(idx)}
                  className={`relative aspect-square bg-gray-900 border rounded-2xl p-3 flex flex-col items-center justify-center text-center group transition-all cursor-pointer ${
                    editingPlayerIdx === idx
                      ? "border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                      : "border-gray-800 hover:border-blue-500/30"
                  }`}
                >
                  <div className="relative w-16 h-16 rounded-full bg-gray-950 border border-gray-800 overflow-hidden mb-2">
                    {player.image ? (
                      <Image
                        src={player.image}
                        alt={player.name || "Player"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-end justify-center">
                        <div className="w-12 h-12 bg-gray-800 rounded-full opacity-50" />
                      </div>
                    )}
                  </div>
                  <h5 className="text-[9px] font-black uppercase text-white truncate w-full">
                    {player.name || "New Player"}
                  </h5>
                  <p className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">
                    {player.position}
                  </p>
                  {player.isReserve && (
                    <span className="absolute top-2 right-2 text-[6px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase">
                      SUB
                    </span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Support staff */}
            <h4 className="text-[9px] font-black text-purple-400 uppercase tracking-widest mt-8 mb-4">
              Support Staff
            </h4>
            {editForm.supportGuests?.map((staff, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 mb-3 bg-gray-900 rounded-xl p-3 border border-gray-800"
              >
                <div className="relative w-10 h-10 rounded-xl bg-gray-950 border border-gray-800 overflow-hidden flex-shrink-0">
                  {staff.image ? (
                    <Image
                      src={staff.image}
                      alt={staff.name || "Staff"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <FaUserTie
                      className="absolute inset-0 m-auto text-gray-700"
                      size={16}
                    />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input
                    value={staff.name || ""}
                    onChange={(e) => updateSupport(idx, "name", e.target.value)}
                    placeholder="Name"
                    className="bg-gray-950 border border-white/5 rounded-lg px-3 py-2 text-[9px] font-bold text-white"
                  />
                  <input
                    value={staff.role || ""}
                    onChange={(e) => updateSupport(idx, "role", e.target.value)}
                    placeholder="Role"
                    className="bg-gray-950 border border-white/5 rounded-lg px-3 py-2 text-[9px] font-bold text-white"
                  />
                  <input
                    value={staff.image || ""}
                    onChange={(e) =>
                      updateSupport(idx, "image", e.target.value)
                    }
                    placeholder="Image URL"
                    className="bg-gray-950 border border-white/5 rounded-lg px-3 py-2 text-[8px] font-bold text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Player detail editor */}
          <div>
            <AnimatePresence mode="wait">
              {editingPlayerIdx !== null &&
                editForm.players[editingPlayerIdx] && (
                  <motion.div
                    key={editingPlayerIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden"
                  >
                    {/* Player image */}
                    <div className="relative w-full aspect-square bg-gray-950 overflow-hidden">
                      {editForm.players[editingPlayerIdx].image ? (
                        <Image
                          src={editForm.players[editingPlayerIdx].image}
                          alt={
                            editForm.players[editingPlayerIdx].name || "Player"
                          }
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-40 bg-gray-900 rounded-[60px_60px_20px_20px] opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">
                          #{editingPlayerIdx + 1} ·{" "}
                          {editForm.players[editingPlayerIdx].isReserve
                            ? "SUBSTITUTE"
                            : "STARTER"}
                        </p>
                        <h3 className="text-2xl font-black uppercase text-white tracking-wider">
                          {editForm.players[editingPlayerIdx].name || "Unnamed"}
                        </h3>
                      </div>
                    </div>

                    {/* Edit fields */}
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest">
                          Player Name
                        </label>
                        <input
                          value={editForm.players[editingPlayerIdx].name || ""}
                          onChange={(e) =>
                            updatePlayer(
                              editingPlayerIdx,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full bg-gray-950 border border-white/5 rounded-xl px-5 py-3 text-xs font-bold text-white focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest">
                            Position
                          </label>
                          <select
                            value={
                              editForm.players[editingPlayerIdx].position ||
                              "MID"
                            }
                            onChange={(e) =>
                              updatePlayer(
                                editingPlayerIdx,
                                "position",
                                e.target.value,
                              )
                            }
                            className="w-full bg-gray-950 border border-white/5 rounded-xl px-5 py-3 text-[11px] font-bold text-white cursor-pointer"
                          >
                            <option value="GK">Goalkeeper</option>
                            <option value="DEF">Defender</option>
                            <option value="MID">Midfielder</option>
                            <option value="FWD">Forward</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block tracking-widest">
                            Image URL
                          </label>
                          <input
                            value={
                              editForm.players[editingPlayerIdx].image || ""
                            }
                            onChange={(e) =>
                              updatePlayer(
                                editingPlayerIdx,
                                "image",
                                e.target.value,
                              )
                            }
                            placeholder="https://..."
                            className="w-full bg-gray-950 border border-white/5 rounded-xl px-5 py-3 text-xs font-bold text-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20">
                        <input
                          type="checkbox"
                          checked={
                            editForm.players[editingPlayerIdx].isReserve ||
                            false
                          }
                          onChange={(e) =>
                            updatePlayer(
                              editingPlayerIdx,
                              "isReserve",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          Reserve / Substitute
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {editingPlayerIdx === null && (
              <div className="flex items-center justify-center h-64 text-center">
                <p className="text-gray-700 text-[10px] font-bold uppercase tracking-widest">
                  Click a player card to edit
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {saving ? <FaSync className="animate-spin" /> : <FaSave />}
            {saving ? "SAVING…" : "SAVE ROSTER CHANGES"}
          </motion.button>
        </div>
      </div>
    );
  }

  // ── League edit view ────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-colors cursor-pointer"
      >
        <FaChevronLeft size={10} /> All Teams
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Player list */}
        <div>
          <h3
            className="text-lg font-black uppercase tracking-widest text-white mb-4"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            {selectedTeam.teamName} <span className="text-blue-400">Squad</span>
          </h3>

          <div className="space-y-3">
            {(editForm?.players || []).map((player, idx) => (
              <div
                key={idx}
                className={`bg-gray-900 border rounded-2xl p-4 flex gap-4 items-center ${
                  player.isReserve ? "border-yellow-500/20" : "border-gray-800"
                }`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
                  {player.image ? (
                    <Image
                      src={player.image}
                      alt={player.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {player.isReserve ? (
                        <FaIdBadge className="text-yellow-600" size={18} />
                      ) : (
                        <FaFutbol className="text-gray-700" size={18} />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    value={player.name || ""}
                    onChange={(e) => updatePlayer(idx, "name", e.target.value)}
                    placeholder="Player name"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none col-span-2"
                  />
                  <select
                    value={player.position || "MID"}
                    onChange={(e) =>
                      updatePlayer(idx, "position", e.target.value)
                    }
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {POSITIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <input
                    value={player.image || ""}
                    onChange={(e) => updatePlayer(idx, "image", e.target.value)}
                    placeholder="Photo URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[9px] text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <span
                  className={`text-[8px] font-black uppercase ${
                    player.isReserve ? "text-yellow-500" : "text-blue-500"
                  }`}
                >
                  {player.isReserve ? "RES" : `#${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Manager + Support + Save */}
        <div className="space-y-4">
          {/* Manager card */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaUserTie size={10} /> Manager
            </h4>
            <div className="space-y-3">
              <input
                value={editForm?.managerName || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, managerName: e.target.value })
                }
                placeholder="Manager name"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:border-green-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={editForm?.managerPhone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, managerPhone: e.target.value })
                  }
                  placeholder="Phone"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white"
                />
                <input
                  value={editForm?.managerEmail || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, managerEmail: e.target.value })
                  }
                  placeholder="Email"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-600 uppercase font-bold mb-1 block">
                  Status
                </label>
                <select
                  value={editForm?.status || "pending"}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="disqualified">Disqualified</option>
                </select>
              </div>
            </div>
          </div>

          {/* Support Staff */}
          {(editForm?.supportGuests || []).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">
                Support Staff
              </h4>
              {editForm.supportGuests.map((g, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    value={g.name || ""}
                    onChange={(e) => updateSupport(idx, "name", e.target.value)}
                    placeholder="Name"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[10px] text-white"
                  />
                  <input
                    value={g.role || ""}
                    onChange={(e) => updateSupport(idx, "role", e.target.value)}
                    placeholder="Role"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[10px] text-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_15px_40px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <FaSync className="animate-spin" /> : <FaSave />}
            {saving ? "Saving…" : "Save Changes"}
          </motion.button>

          {message && (
            <p
              className={`text-center text-[10px] font-black uppercase tracking-widest ${
                message.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
