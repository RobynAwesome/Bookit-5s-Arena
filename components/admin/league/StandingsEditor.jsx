'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaSync, FaSave, FaCalculator } from 'react-icons/fa';

export default function LeagueStandingsEditor({ leagueId }) {
  const [data, setData] = useState({ groups: {}, ungrouped: [] });
  const [edited, setEdited] = useState({});
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState({});

  const fetchStandings = useCallback(async () => {
    if (!leagueId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/competitions/league/${leagueId}/standings`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        // Seed edited state
        const seed = {};
        Object.entries(json.groups || {}).forEach(([g, teams]) => {
          seed[g] = teams.map((t) => ({ ...t }));
        });
        if (json.ungrouped?.length) {
          seed['__all__'] = json.ungrouped.map((t) => ({ ...t }));
        }
        setEdited(seed);
      }
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  const updateCell = (key, idx, field, value) => {
    setEdited((prev) => {
      const next = { ...prev };
      next[key] = next[key].map((t, i) =>
        i === idx ? { ...t, [field]: value === '' ? '' : Number(value) } : t
      );
      return next;
    });
  };

  const autoGD = (key, idx) => {
    setEdited((prev) => {
      const next = { ...prev };
      next[key] = next[key].map((t, i) =>
        i === idx ? { ...t, gd: (t.gf || 0) - (t.ga || 0) } : t
      );
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

      const res = await fetch(`/api/admin/competitions/league/${leagueId}/standings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupLetter: groupLetter !== '__all__' ? groupLetter : undefined, teams }),
      });

      if (res.ok) {
        setMessages((p) => ({ ...p, [key]: { type: 'success', text: 'Saved!' } }));
        setTimeout(() => setMessages((p) => ({ ...p, [key]: null })), 2500);
        fetchStandings();
      } else {
        const err = await res.json();
        setMessages((p) => ({ ...p, [key]: { type: 'error', text: err.error || 'Failed' } }));
      }
    } finally {
      setSaving(null);
    }
  };

  const renderTable = (key, label, teams) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <span className="text-blue-400 font-black text-[10px]">{label}</span>
          </div>
          <h3
            className="text-sm font-black uppercase tracking-widest text-white"
            style={{ fontFamily: 'Impact, sans-serif' }}
          >
            {key === '__all__' ? 'League Table' : `Group ${label}`}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {messages[key] && (
            <span
              className={`text-[9px] font-black uppercase tracking-widest ${messages[key].type === 'success' ? 'text-green-400' : 'text-red-400'}`}
            >
              {messages[key].text}
            </span>
          )}
          <motion.button
            onClick={() => saveGroup(key, key)}
            disabled={saving === key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all cursor-pointer"
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
            <tr className="text-gray-600 uppercase tracking-widest">
              <th className="px-4 py-2 text-left w-6">#</th>
              <th className="px-4 py-2 text-left">Team</th>
              {['MP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'].map((h) => (
                <th key={h} className="px-2 py-2 text-center w-10">{h}</th>
              ))}
              <th className="px-2 py-2 w-6" />
            </tr>
          </thead>
          <tbody>
            {(edited[key] || teams).map((team, idx) => (
              <tr
                key={team._id}
                className={`border-t border-gray-800/50 hover:bg-gray-800/20 transition-colors ${idx < 2 ? 'border-l-2 border-l-blue-500' : ''}`}
              >
                <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {team.logo ? (
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image src={team.logo} alt={team.teamName} fill className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-[8px] font-black text-gray-500">
                        {team.teamName?.[0]}
                      </div>
                    )}
                    <span className="text-white truncate max-w-[100px]">{team.teamName}</span>
                  </div>
                </td>
                {['mp', 'w', 'd', 'l', 'gf', 'ga', 'gd', 'pts'].map((field) => (
                  <td key={field} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      value={(edited[key]?.[idx]?.[field] ?? '') === '' ? '' : (edited[key]?.[idx]?.[field] ?? 0)}
                      onChange={(e) => updateCell(key, idx, field, e.target.value)}
                      className={`w-9 text-center bg-gray-800/60 border rounded-lg py-1 text-[10px] text-white outline-none focus:border-blue-500 transition-colors ${field === 'pts' ? 'border-blue-500/30 font-black' : 'border-transparent hover:border-gray-700'}`}
                    />
                  </td>
                ))}
                <td className="px-1 py-1 text-center">
                  <button
                    onClick={() => autoGD(key, idx)}
                    title="Auto-calculate GD"
                    className="w-6 h-6 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <FaCalculator size={8} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <FaSync className="text-blue-500 animate-spin text-2xl" />
      </div>
    );
  }

  const hasGroups = Object.keys(data.groups || {}).length > 0;
  const hasUngrouped = (data.ungrouped || []).length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-black uppercase tracking-widest text-blue-400"
          style={{ fontFamily: 'Impact, sans-serif' }}
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

      {!hasGroups && !hasUngrouped && (
        <div className="text-center py-16 text-gray-600">
          <p className="font-bold uppercase tracking-widest text-sm">No teams registered yet</p>
        </div>
      )}

      {hasUngrouped && (
        <div className="mb-8">
          {renderTable('__all__', 'All', data.ungrouped)}
        </div>
      )}

      {hasGroups && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(data.groups).sort().map(([g, teams]) =>
            renderTable(g, g, teams)
          )}
        </div>
      )}
    </div>
  );
}
