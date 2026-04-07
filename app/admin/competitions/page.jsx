'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { FaTrophy, FaFutbol } from 'react-icons/fa';

export default function AdminCompetitionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session.user.activeRole !== 'admin') router.push('/');
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-10 md:mb-16"
      >
        <h1
          className="text-4xl md:text-7xl font-black uppercase text-white tracking-tighter"
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          Competition <span className="text-green-500">Hub</span>
        </h1>
        <div className="h-1 w-20 md:w-24 bg-green-500 mx-auto mt-4 rounded-full" />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-w-5xl w-full z-10 px-4 md:px-0">
        {/* Tournament */}
        <motion.button
          onClick={() => router.push('/admin/competitions/tournament')}
          whileHover={{ scale: 1.02, y: -10 }}
          className="group relative h-64 md:h-80 rounded-[30px] md:rounded-[40px] overflow-hidden border border-green-500/20 bg-gray-900 shadow-2xl transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-black/90 to-black z-0" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-10 text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <FaTrophy size={40} className="text-yellow-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-2">
              Tournament
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Real-Time Standings & Roster Control
            </p>
          </div>
        </motion.button>

        {/* Weekly Leagues */}
        <motion.button
          onClick={() => router.push('/admin/competitions/league')}
          whileHover={{ scale: 1.02, y: -10 }}
          className="group relative h-64 md:h-80 rounded-[30px] md:rounded-[40px] overflow-hidden border border-blue-500/20 bg-gray-900 shadow-2xl transition-all cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black/90 to-black z-0" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-10 text-center">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <FaFutbol size={40} className="text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-2">
              Weekly Leagues
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
              Ongoing Season Management
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
