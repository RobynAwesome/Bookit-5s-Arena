'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaFutbol, FaArrowLeft, FaPlus, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const STATUS_STYLES = {
  active: 'bg-green-900/40 text-green-400 border-green-700/50',
  upcoming: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  completed: 'bg-gray-800 text-gray-500 border-gray-700/50',
  cancelled: 'bg-red-900/40 text-red-500 border-red-700/50',
};

export default function AdminLeagueHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session.user.activeRole !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    fetch('/api/leagues')
      .then((r) => r.json())
      .then((d) => setLeagues(d.leagues || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/competitions')}
            className="p-2.5 hover:bg-gray-900 rounded-xl transition-all border border-transparent hover:border-gray-800"
          >
            <FaArrowLeft className="text-gray-400" />
          </button>
          <h2
            className="font-black uppercase tracking-widest text-sm text-blue-400"
            style={{ fontFamily: 'Impact, sans-serif' }}
          >
            Weekly Leagues
          </h2>
        </div>
        <button
          onClick={() => router.push('/admin/competitions/league/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 transition-all"
        >
          <FaPlus size={10} /> New League
        </button>
      </div>

      <div className="pt-36 pb-16 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1
            className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter"
            style={{ fontFamily: 'Impact, sans-serif' }}
          >
            League <span className="text-blue-400">Control</span>
          </h1>
          <div className="h-1 w-16 bg-blue-500 mt-3 rounded-full" />
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-3">
            {leagues.length} Active League{leagues.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-900 rounded-3xl border border-gray-800 animate-pulse" />
            ))}
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-center py-24">
            <FaFutbol className="text-gray-700 text-5xl mx-auto mb-4" />
            <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">No leagues found</p>
            <p className="text-gray-700 text-xs mt-2">Create your first weekly league to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league, i) => (
              <motion.button
                key={league._id}
                onClick={() => router.push(`/admin/competitions/league/${league._id}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.02, y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="group text-left h-full bg-gray-900 rounded-3xl border border-gray-800 hover:border-blue-500/30 p-6 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaFutbol className="text-blue-400" size={20} />
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_STYLES[league.status] || STATUS_STYLES.upcoming}`}
                  >
                    {league.status}
                  </span>
                </div>

                <h3
                  className="text-lg font-black uppercase tracking-tight text-white mb-1"
                  style={{ fontFamily: 'Impact, sans-serif' }}
                >
                  {league.name}
                </h3>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                  {league.format}
                </p>

                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <FaUsers size={10} />
                    <span className="text-[10px] font-bold">{league.maxTeams} max teams</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FaCalendarAlt size={10} />
                    <span className="text-[10px] font-bold">
                      {league.startDate ? new Date(league.startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                    Open Control Panel →
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
