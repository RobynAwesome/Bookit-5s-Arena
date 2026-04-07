'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  FaUserTie, FaFutbol, FaTimes, FaSave, FaSync,
  FaChevronLeft, FaIdBadge,
} from 'react-icons/fa';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

export default function LeaguePlayerEditor({ leagueId, teams, onTeamUpdate }) {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const selectTeam = (team) => {
    setSelectedTeam(team);
    setEditForm(JSON.parse(JSON.stringify(team)));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/competitions/league/${leagueId}/teams`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: editForm._id, updates: editForm }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTeam(data.team);
        setEditForm(JSON.parse(JSON.stringify(data.team)));
        setMessage({ type: 'success', text: 'Saved!' });
        onTeamUpdate?.();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed' });
      }
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

  // Team list view
  if (!selectedTeam) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h2
          className="text-2xl font-black uppercase tracking-widest text-blue-400 mb-6"
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          Select Team
        </h2>

        {teams.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="font-bold uppercase tracking-widest text-sm">No teams registered</p>
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
                    <Image src={team.logo} alt={team.teamName} width={64} height={64} className="object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-gray-600">{team.teamName?.[0]}</span>
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

  // Team edit view
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setSelectedTeam(null)}
        className="flex items-center gap-2 text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-colors cursor-pointer"
      >
        <FaChevronLeft size={10} /> All Teams
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Player list */}
        <div>
          <h3
            className="text-lg font-black uppercase tracking-widest text-white mb-4"
            style={{ fontFamily: 'Impact, sans-serif' }}
          >
            {selectedTeam.teamName} <span className="text-blue-400">Squad</span>
          </h3>

          <div className="space-y-3">
            {(editForm?.players || []).map((player, idx) => (
              <div
                key={idx}
                className={`bg-gray-900 border rounded-2xl p-4 flex gap-4 items-center ${player.isReserve ? 'border-yellow-500/20' : 'border-gray-800'}`}
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800 border border-gray-700 flex-shrink-0">
                  {player.image ? (
                    <Image src={player.image} alt={player.name} fill className="object-cover" />
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
                    value={player.name || ''}
                    onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                    placeholder="Player name"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none col-span-2"
                  />
                  <select
                    value={player.position || 'MID'}
                    onChange={(e) => updatePlayer(idx, 'position', e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input
                    value={player.image || ''}
                    onChange={(e) => updatePlayer(idx, 'image', e.target.value)}
                    placeholder="Photo URL"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[9px] text-white focus:border-blue-500 outline-none"
                  />
                </div>
                <span className={`text-[8px] font-black uppercase ${player.isReserve ? 'text-yellow-500' : 'text-blue-500'}`}>
                  {player.isReserve ? 'RES' : `#${idx + 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Manager + Support */}
        <div className="space-y-4">
          {/* Manager */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5">
            <h4 className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaUserTie size={10} /> Manager
            </h4>
            <div className="space-y-3">
              <input
                value={editForm?.managerName || ''}
                onChange={(e) => setEditForm({ ...editForm, managerName: e.target.value })}
                placeholder="Manager name"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:border-green-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={editForm?.managerPhone || ''}
                  onChange={(e) => setEditForm({ ...editForm, managerPhone: e.target.value })}
                  placeholder="Phone"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white"
                />
                <input
                  value={editForm?.managerEmail || ''}
                  onChange={(e) => setEditForm({ ...editForm, managerEmail: e.target.value })}
                  placeholder="Email"
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-600 uppercase font-bold mb-1 block">Status</label>
                <select
                  value={editForm?.status || 'pending'}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                    value={g.name || ''}
                    onChange={(e) => updateSupport(idx, 'name', e.target.value)}
                    placeholder="Name"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[10px] text-white"
                  />
                  <input
                    value={g.role || ''}
                    onChange={(e) => updateSupport(idx, 'role', e.target.value)}
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
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>

          {message && (
            <p className={`text-center text-[10px] font-black uppercase tracking-widest ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
