'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  FaTrophy, FaUsers, FaChartLine, FaRobot,
  FaEdit, FaSave, FaSignOutAlt, FaFutbol,
  FaGift, FaShareAlt, FaCopy, FaCheck, FaStar, FaFire, FaLock,
} from 'react-icons/fa';
import useSSE from '@/hooks/useSSE';

import { WORLD_CUP_TEAMS, teamImage } from '@/lib/worldCupTeams';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

export default function TournamentManagerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('squad'); // squad, stats, ai, rewards
  const [copiedTag, setCopiedTag] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Temporary state for editing
  const [editForm, setEditForm] = useState(null);

  // AI Chat state
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your AI Co-Coach. Need tactical advice or opponent analysis?" }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // SSE for live standings/fixture updates
  useSSE('/api/sse/tournament', (data) => {
    if (data.type === 'standings-update' || data.type === 'fixture-update') {
      // Re-fetch team data on updates
      fetch('/api/tournament/my-team')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d?.team) { setTeam(d.team); if (!editMode) setEditForm(JSON.parse(JSON.stringify(d.team))); } })
        .catch(() => {});
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetch('/api/tournament/my-team')
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(data => {
          setTeam(data.team);
          setEditForm(JSON.parse(JSON.stringify(data.team)));
        })
        .catch(() => {
          setTeam(null);
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/tournament/my-team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: editForm.teamName,
          players: editForm.players,
          supportGuests: editForm.supportGuests,
          worldCupTeam: editForm.worldCupTeam,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
        setEditForm(JSON.parse(JSON.stringify(data.team)));
        setEditMode(false);
      }
    } catch {
      // save failed silently — user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleAIChat = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = inputMsg;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputMsg('');

    try {
      const context = team
        ? `Manager context: Team "${team.teamName}", representing "${team.worldCupTeam}", ${team.players?.length || 0} players registered.`
        : '';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `${context}\n\nManager question: ${userMsg}` }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response || data.answer || 'I can help with tactics, squad selection, and tournament strategy.',
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Unable to reach AI Co-Coach right now. Try again shortly.',
      }]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <FaFutbol className="text-green-500 animate-spin text-4xl mb-4" />
        <p className="text-green-400 font-bold uppercase tracking-widest text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
        <FaTrophy className="text-gray-600 text-6xl mb-6" />
        <h1 className="text-2xl font-black uppercase text-white mb-2" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
          No Team Found
        </h1>
        <p className="text-gray-400 mb-6 max-w-md">You haven&apos;t registered a team for the 5s Arena World Cup yet.</p>
        <button 
          onClick={() => router.push('/tournament')}
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm"
        >
          Register Now
        </button>
      </div>
    );
  }

  const selectedWC = WORLD_CUP_TEAMS.find(t => editForm.worldCupTeam.includes(t.name)) || WORLD_CUP_TEAMS[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-gray-900 border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none">
            {teamImage(selectedWC) ? (
              <Image src={teamImage(selectedWC)} alt={selectedWC.name || 'World Cup team'} fill className="object-cover mask-gradient-left" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl font-black text-gray-600">
                {selectedWC.name?.[0]}
              </div>
            )}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-green-900/40 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest rounded-md">
                {team.status === 'approved' ? 'Registration Approved' : 'Pending Approval'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-1" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              {team.teamName}
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <FaUsers className="text-gray-500" /> Manager: <span className="text-white font-bold">{team.managerName}</span>
            </p>
          </div>
          
          <div className="relative z-10 flex gap-3">
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl text-sm font-bold transition-all"
              >
                <FaEdit /> Edit Squad
              </button>
            ) : (
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button 
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-red-400 hover:text-red-300 text-sm font-bold transition-all"
            >
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'squad', label: 'Squad Management', icon: FaUsers },
            { id: 'stats', label: 'Live Stats & Fixtures', icon: FaChartLine },
            { id: 'ai', label: 'AI Co-Coach', icon: FaRobot },
            { id: 'rewards', label: 'Rewards & Challenges', icon: FaGift },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                  : 'text-gray-400 hover:bg-gray-800/50'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* ─── SQUAD MANAGEMENT ─── */}
            {activeTab === 'squad' && (
              <motion.div
                key="squad"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Left Column: World Cup Team & Support Staff */}
                <div className="space-y-6">
                  {/* World Cup Team */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                      <FaTrophy className="text-yellow-500" /> Selected Nation
                    </h3>
                    
                    {!editMode ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 relative flex-shrink-0 bg-gray-800 flex items-center justify-center">
                          {teamImage(selectedWC) ? (
                            <Image src={teamImage(selectedWC)} alt={selectedWC.name} fill className="object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-gray-500">{selectedWC.name?.[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-black uppercase text-xl text-white">{selectedWC.name}</p>
                          <p className="text-sm text-gray-400">{selectedWC.player}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {WORLD_CUP_TEAMS.map(wc => {
                          const val = `${wc.name} (${wc.player})`;
                          const isSelected = editForm.worldCupTeam === val;
                          return (
                            <button
                              key={wc.name}
                              onClick={() => setEditForm({...editForm, worldCupTeam: val})}
                              className={`p-2 rounded-lg border text-left text-xs ${isSelected ? 'border-green-500 bg-green-900/30 text-white font-bold' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}
                            >
                              {wc.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Support Guests */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 flex justify-between items-center">
                      <span>Support Staff (Max 3)</span>
                    </h3>
                    
                    <div className="space-y-3">
                      {editForm.supportGuests.map((guest, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            value={guest.name}
                            onChange={(e) => {
                              const newGuests = [...editForm.supportGuests];
                              newGuests[i].name = e.target.value;
                              setEditForm({...editForm, supportGuests: newGuests});
                            }}
                            disabled={!editMode}
                            placeholder="Full Name"
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 disabled:border-transparent outline-none focus:border-green-500"
                          />
                          <input 
                            value={guest.role}
                            onChange={(e) => {
                              const newGuests = [...editForm.supportGuests];
                              newGuests[i].role = e.target.value;
                              setEditForm({...editForm, supportGuests: newGuests});
                            }}
                            disabled={!editMode}
                            placeholder="Role (e.g. Coach)"
                            className="w-1/3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-70 disabled:border-transparent outline-none focus:border-green-500"
                          />
                        </div>
                      ))}
                      
                      {editMode && editForm.supportGuests.length < 3 && (
                        <button 
                          onClick={() => setEditForm({...editForm, supportGuests: [...editForm.supportGuests, {name: '', role: ''}]})}
                          className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-400 uppercase tracking-widest font-bold"
                        >
                          + Add Support Staff
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Players List */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <FaFutbol className="text-green-500" /> Playing Squad
                    </h3>
                    <div className="flex gap-3 text-xs font-bold">
                      <span className="text-green-400">Starters: {editForm.players.filter(p => !p.isReserve).length}/5</span>
                      <span className="text-gray-400">Reserves: {editForm.players.filter(p => p.isReserve).length}/3</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="flex gap-2 px-3 pb-2 border-b border-gray-800 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      <div className="w-8">No.</div>
                      <div className="flex-1">Player Name</div>
                      <div className="w-24">Position</div>
                      <div className="w-20 text-center">Status</div>
                    </div>

                    {editForm.players.map((player, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <div className={`w-8 text-center text-xs font-bold ${player.isReserve ? 'text-gray-600' : 'text-green-500'}`}>
                          {i + 1}
                        </div>
                        <input 
                          value={player.name}
                          onChange={(e) => {
                            const newPlayers = [...editForm.players];
                            newPlayers[i].name = e.target.value;
                            setEditForm({...editForm, players: newPlayers});
                          }}
                          disabled={!editMode}
                          placeholder="Player Name"
                          className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-80 disabled:bg-transparent outline-none focus:border-green-500"
                        />
                        <select
                          value={player.position}
                          onChange={(e) => {
                            const newPlayers = [...editForm.players];
                            newPlayers[i].position = e.target.value;
                            setEditForm({...editForm, players: newPlayers});
                          }}
                          disabled={!editMode}
                          className="w-24 bg-gray-800/50 border border-gray-700/50 rounded-lg px-2 py-2 text-xs text-gray-300 disabled:opacity-80 disabled:bg-transparent outline-none focus:border-green-500 disabled:appearance-none cursor-pointer"
                        >
                          {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                        <select
                          value={player.isReserve ? 'reserve' : 'starter'}
                          onChange={(e) => {
                            const newPlayers = [...editForm.players];
                            newPlayers[i].isReserve = e.target.value === 'reserve';
                            setEditForm({...editForm, players: newPlayers});
                          }}
                          disabled={!editMode}
                          className={`w-24 bg-transparent border-0 rounded-lg py-2 text-xs font-bold font-mono tracking-widest text-center outline-none disabled:appearance-none cursor-pointer ${player.isReserve ? 'text-gray-500' : 'text-green-400'}`}
                        >
                          <option value="starter">STARTER</option>
                          <option value="reserve">RESERVE</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  {editMode && editForm.players.length < 8 && (
                    <button 
                      onClick={() => setEditForm({...editForm, players: [...editForm.players, {name: '', position: 'MID', isReserve: true}]})}
                      className="mt-6 w-full py-3 border border-dashed border-gray-600 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-400 uppercase tracking-widest font-bold"
                    >
                      + Add Player to Squad
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── LIVE STATS & FIXTURES ─── */}
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-12 bg-gray-900 border border-gray-800 rounded-2xl text-center"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-blue-900/30 border border-blue-500/50 flex items-center justify-center">
                  <FaChartLine size={30} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-black uppercase mb-3" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  Tournament Not Started
                </h2>
                <p className="text-gray-400 max-w-md">
                  Live scores, group standings, and knockout brackets will appear here once the 5s Arena World Cup kicks off on May 26, 2026.
                </p>
              </motion.div>
            )}

            {/* ─── AI CO-COACH ─── */}
            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl h-[500px] flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gray-800/80 p-4 border-b border-gray-700 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/50 flex items-center justify-center">
                    <FaRobot className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Tactical AI Assistant</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Powered by 5s Arena Tech</p>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'ai' 
                          ? 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700' 
                          : 'bg-green-600/20 text-green-100 rounded-tr-none border border-green-500/30'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                  <form onSubmit={handleAIChat} className="flex gap-3">
                    <input 
                      value={inputMsg}
                      onChange={e => setInputMsg(e.target.value)}
                      placeholder="Ask for formation advice, opponent analysis..."
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                    />
                    <button 
                      type="submit"
                      disabled={!inputMsg.trim()}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* ─── REWARDS & CHALLENGES ─── */}
            {activeTab === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header Banner */}
                <div className="relative bg-gradient-to-r from-yellow-900/40 via-orange-900/30 to-yellow-900/40 border border-yellow-500/30 rounded-2xl p-6 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 50%, rgba(234,179,8,0.12) 0%, transparent 60%)' }} />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(234,179,8,0.3)] flex-shrink-0">🏅</div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-1">Social Media Rewards Programme</p>
                      <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide leading-tight mb-1" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                        Earn Points. Go Viral. Win Big.
                      </h2>
                      <p className="text-gray-400 text-xs leading-relaxed">Complete challenges on Facebook, TikTok, Instagram & X. Use the official hashtags, tag us, and rack up your leaderboard points.</p>
                    </div>
                    <div className="text-center bg-yellow-900/30 border border-yellow-500/30 rounded-xl px-5 py-3">
                      <p className="text-[9px] text-yellow-600 uppercase tracking-widest font-bold">Your Points</p>
                      <p className="text-3xl font-black text-yellow-400" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>—</p>
                      <p className="text-[9px] text-yellow-600 uppercase tracking-widest">Coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Official Hashtags Copy Panel */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaFire className="text-orange-400" /> Official Tournament Tags
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { tag: '#5sArenaWC26', desc: 'Main tournament' },
                      { tag: '#Bookit5sArena', desc: 'Platform tag' },
                      { tag: '#5sArenaCapeTown', desc: 'Location' },
                      { tag: '#HelllenicFC5s', desc: 'Venue' },
                      { tag: '#5sSideWorldCup', desc: 'Format' },
                      { tag: '#MilnertonFootball', desc: 'Community' },
                      { tag: `#Team${team?.teamName?.replace(/\s/g, '') || 'YourTeam'}`, desc: 'Your team' },
                      { tag: `#${team?.worldCupTeam?.split(' ')[0] || 'YourNation'}WC26`, desc: 'Your nation' },
                    ].map(({ tag, desc }) => (
                      <button
                        key={tag}
                        onClick={() => {
                          navigator.clipboard.writeText(tag);
                          setCopiedTag(tag);
                          setTimeout(() => setCopiedTag(null), 2000);
                        }}
                        className="group flex items-start gap-2 p-3 bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-green-500/50 rounded-xl text-left transition-all"
                      >
                        <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${copiedTag === tag ? 'bg-green-500' : 'bg-gray-700 group-hover:bg-gray-600'}`}>
                          {copiedTag === tag ? <FaCheck size={9} className="text-white" /> : <FaCopy size={9} className="text-gray-400" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-green-400 leading-none">{tag}</p>
                          <p className="text-[9px] text-gray-600 mt-0.5 uppercase tracking-wider">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Challenges Grid */}
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FaStar className="text-yellow-400" /> Active Challenges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        platform: 'tiktok',
                        icon: '🎵',
                        color: '#ff0050',
                        border: 'border-pink-800/50',
                        glow: 'hover:border-pink-500/50',
                        bg: 'bg-pink-900/10',
                        pts: 100,
                        title: 'TikTok Hype Video',
                        desc: `Post a pre-match hype video of your squad. Use #5sArenaWC26 and tag @bookit5sarena. Show us your team spirit!`,
                        how: 'Post on TikTok → Use hashtag → Tag @bookit5sarena',
                        shareUrl: `https://www.tiktok.com/`,
                        sharePlatform: 'TikTok',
                        shareText: `Ready for the 5s Arena World Cup 🏆⚽ My squad is going all the way! #5sArenaWC26 #Bookit5sArena #5sSideWorldCup`,
                      },
                      {
                        platform: 'facebook',
                        icon: '📘',
                        color: '#1877F2',
                        border: 'border-blue-800/50',
                        glow: 'hover:border-blue-500/50',
                        bg: 'bg-blue-900/10',
                        pts: 50,
                        title: 'Facebook Match Day Post',
                        desc: `Share your match result on Facebook. Tag the page and use the team hashtag. Every result posted earns points!`,
                        how: 'Post result on Facebook → Tag @Bookit5sArena → Use hashtags',
                        shareUrl: `https://www.facebook.com/sharer/sharer.php?u=https://fivesarena.com&quote=`,
                        sharePlatform: 'Facebook',
                        shareText: `Just played in the 5s Arena World Cup! #5sArenaWC26 #Bookit5sArena 🏆⚽`,
                      },
                      {
                        platform: 'instagram',
                        icon: '📸',
                        color: '#E1306C',
                        border: 'border-pink-800/50',
                        glow: 'hover:border-pink-500/50',
                        bg: 'bg-pink-900/10',
                        pts: 75,
                        title: 'Instagram Squad Photo',
                        desc: `Post your squad photo on Instagram stories or feed. Tag 3 teammates + use the arena hashtag. Repost our stories for bonus points!`,
                        how: 'Post on Instagram → Tag teammates + @bookit5sarena → Use #5sArenaWC26',
                        shareUrl: `https://www.instagram.com/`,
                        sharePlatform: 'Instagram',
                        shareText: `Playing in the #5sArenaWC26 World Cup 🏆 @bookit5sarena #Bookit5sArena #5sSideWorldCup`,
                      },
                      {
                        platform: 'x',
                        icon: '✖',
                        color: '#000000',
                        border: 'border-gray-700/50',
                        glow: 'hover:border-gray-500/50',
                        bg: 'bg-gray-900/30',
                        pts: 30,
                        title: 'X / Twitter Match Thread',
                        desc: `Live-tweet your match on X. Every post with the official hashtag during match time earns arena points!`,
                        how: 'Tweet during match → Use #5sArenaWC26 → Reply to @bookit5sarena',
                        shareUrl: `https://twitter.com/intent/tweet?text=`,
                        sharePlatform: 'X',
                        shareText: `Playing in the #5sArenaWC26 World Cup! @bookit5sarena #Bookit5sArena #5sSideWorldCup`,
                      },
                      {
                        platform: 'whatsapp',
                        icon: '💬',
                        color: '#25D366',
                        border: 'border-green-800/50',
                        glow: 'hover:border-green-500/50',
                        bg: 'bg-green-900/10',
                        pts: 20,
                        title: 'WhatsApp Invite Challenge',
                        desc: `Share the tournament link on WhatsApp groups with 20+ members. Invite friends to register or spectate. More registrations = more points!`,
                        how: 'Share link on WhatsApp → Group must have 20+ members → Use referral link',
                        shareUrl: `https://wa.me/?text=`,
                        sharePlatform: 'WhatsApp',
                        shareText: `Join us at the 5s Arena World Cup! Register your team at fivesarena.com 🏆⚽ #5sArenaWC26`,
                      },
                      {
                        platform: 'locked',
                        icon: '🔒',
                        color: '#6b7280',
                        border: 'border-gray-800',
                        glow: '',
                        bg: 'bg-gray-900/20',
                        pts: 250,
                        title: 'Championship Viral Challenge',
                        desc: `Unlocks after 3 match wins. Post a 30-second victory celebration video with full team. Must go viral (500+ views) to claim points!`,
                        how: 'Win 3 matches → Post viral video → 500+ views required',
                        locked: true,
                      },
                    ].map((challenge, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={`relative ${challenge.bg} border ${challenge.border} ${challenge.glow} rounded-2xl p-5 transition-all ${challenge.locked ? 'opacity-60' : ''}`}
                      >
                        {challenge.locked && (
                          <div className="absolute inset-0 bg-gray-950/60 rounded-2xl flex items-center justify-center z-10">
                            <div className="text-center">
                              <FaLock size={24} className="text-gray-600 mx-auto mb-2" />
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Win 3 matches to unlock</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl leading-none">{challenge.icon}</span>
                            <div>
                              <p className="text-sm font-black text-white uppercase tracking-wide">{challenge.title}</p>
                              <p className="text-[9px] text-gray-600 uppercase tracking-widest capitalize">{challenge.platform}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-black" style={{ color: challenge.color, fontFamily: 'Impact, Arial Black, sans-serif' }}>{challenge.pts}</p>
                            <p className="text-[9px] text-gray-600 uppercase tracking-widest">pts</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-3">{challenge.desc}</p>
                        <div className="bg-gray-900/60 rounded-lg px-3 py-2 mb-3">
                          <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">How to earn:</p>
                          <p className="text-[10px] text-gray-300 font-bold">{challenge.how}</p>
                        </div>
                        {!challenge.locked && challenge.shareUrl && (
                          <a
                            href={`${challenge.shareUrl}${encodeURIComponent(challenge.shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all"
                            style={{ background: challenge.color, opacity: 0.9 }}
                          >
                            <FaShareAlt size={11} /> Share on {challenge.sharePlatform}
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard teaser */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                  <FaTrophy size={28} className="text-yellow-500 mx-auto mb-3" />
                  <h3 className="text-base font-black uppercase text-white mb-1" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Rewards Leaderboard</h3>
                  <p className="text-gray-400 text-xs max-w-md mx-auto">
                    The social media points leaderboard goes live once the tournament kicks off on <strong className="text-white">26 May 2026</strong>.
                    Top earners win exclusive prizes and merch!
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
