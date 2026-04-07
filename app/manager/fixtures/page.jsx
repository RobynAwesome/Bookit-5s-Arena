'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaCalendarCheck, FaSync,
} from 'react-icons/fa';
import useSSE from '@/hooks/useSSE';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import ManagerNavbar from '@/components/manager/ManagerNavbar';

const STATUS_CONFIG = {
  scheduled: { label: 'Upcoming', color: 'text-gray-400', dot: 'bg-gray-500' },
  live: { label: 'LIVE', color: 'text-green-400', dot: 'bg-green-500 animate-pulse' },
  completed: { label: 'Full Time', color: 'text-blue-400', dot: 'bg-blue-500' },
  postponed: { label: 'Postponed', color: 'text-yellow-500', dot: 'bg-yellow-500' },
};

export default function ManagerFixturesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const canViewFixtures = useFeatureAccess('manager.fixtures.view');
  const [fixtures, setFixtures] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/tournament/my-team');
      if (res.ok) {
        const data = await res.json();
        setMyTeam(data.team);
      }
    } catch {}
  };

  const fetchFixtures = async () => {
    try {
      const res = await fetch('/api/admin/competitions/tournament/fixtures');
      if (res.ok) {
        const data = await res.json();
        setFixtures(data.fixtures || []);
      }
    } catch {}
  };

  const fetchData = async () => {
    await Promise.all([fetchTeam(), fetchFixtures()]);
    setLoading(false);
  };

  const { connected } = useSSE('/api/sse/tournament', (data) => {
    if (data.type === 'fixture-update' || data.type === 'score-live') {
      fetchFixtures();
    }
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    else if (status === 'authenticated') {
      if (session?.user?.activeRole !== 'manager') {
        router.replace('/');
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
      }
    }
  }, [status, session]);

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">
        <FaSync className="animate-spin text-3xl" />
      </div>
    );
  }

  if (!canViewFixtures) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-bold uppercase tracking-widest text-sm">Feature Disabled</p>
          <p className="text-gray-500 text-xs">Fixtures view has been disabled for your account.</p>
        </div>
      </div>
    );
  }

  // Filter fixtures to ones involving my team
  const myFixtures = myTeam
    ? fixtures.filter(
        (f) =>
          f.homeTeam?._id === myTeam._id ||
          f.awayTeam?._id === myTeam._id
      )
    : fixtures;

  const upcoming = myFixtures.filter((f) => f.status === 'scheduled');
  const live = myFixtures.filter((f) => f.status === 'live');
  const completed = myFixtures.filter((f) => f.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ManagerNavbar session={session} connected={connected} />
      <div className="pt-24 pb-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">
            {myTeam ? myTeam.teamName : 'Manager Interface'}
            {myTeam?.groupLetter && ` · Group ${myTeam.groupLetter}`}
          </p>
          <h1
            className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter"
            style={{ fontFamily: 'Impact, sans-serif' }}
          >
            MATCH <span className="text-blue-400">FIXTURES</span>
          </h1>
          <div className="h-1 w-16 bg-blue-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Live matches */}
        {live.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-green-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Now
            </h2>
            <div className="space-y-3">
              {live.map((f) => <FixtureCard key={f._id} fixture={f} myTeamId={myTeam?._id} />)}
            </div>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-4">
              Upcoming
            </h2>
            <div className="space-y-3">
              {upcoming.map((f) => <FixtureCard key={f._id} fixture={f} myTeamId={myTeam?._id} />)}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-4">
              Results
            </h2>
            <div className="space-y-3">
              {completed.map((f) => <FixtureCard key={f._id} fixture={f} myTeamId={myTeam?._id} />)}
            </div>
          </div>
        )}

        {myFixtures.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <FaCalendarCheck className="text-5xl mx-auto mb-4 opacity-30" />
            <p className="font-bold uppercase tracking-widest text-sm">No fixtures yet</p>
            <p className="text-xs mt-2">Fixtures will appear here once the draw is generated by admin</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function FixtureCard({ fixture, myTeamId }) {
  const cfg = STATUS_CONFIG[fixture.status] || STATUS_CONFIG.scheduled;
  const isMyHome = fixture.homeTeam?._id === myTeamId;
  const isMyAway = fixture.awayTeam?._id === myTeamId;
  const isMyMatch = isMyHome || isMyAway;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900 rounded-2xl border p-4 flex items-center gap-4 transition-all ${
        isMyMatch ? 'border-blue-500/20' : 'border-gray-800'
      }`}
    >
      {/* Matchday */}
      <div className="w-10 text-center flex-shrink-0">
        <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest">MD</p>
        <p className="text-base font-black text-gray-500">{fixture.matchday}</p>
      </div>

      {/* Home */}
      <div className={`flex-1 text-right ${isMyHome ? 'text-blue-400' : 'text-white'}`}>
        <p className="text-xs font-black uppercase tracking-tight truncate">
          {fixture.homeTeam?.teamName || 'TBD'}
        </p>
        {fixture.homeTeam?.groupLetter && (
          <p className="text-[9px] text-gray-600 font-bold">Grp {fixture.homeTeam.groupLetter}</p>
        )}
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-center min-w-[64px]">
        {fixture.status === 'completed' || fixture.status === 'live' ? (
          <div className="flex items-center justify-center gap-1">
            <span className={`text-xl font-black ${isMyHome && fixture.homeScore > fixture.awayScore ? 'text-green-400' : isMyHome && fixture.homeScore < fixture.awayScore ? 'text-red-400' : 'text-white'}`}>
              {fixture.homeScore ?? 0}
            </span>
            <span className="text-gray-600 font-black">:</span>
            <span className={`text-xl font-black ${isMyAway && fixture.awayScore > fixture.homeScore ? 'text-green-400' : isMyAway && fixture.awayScore < fixture.homeScore ? 'text-red-400' : 'text-white'}`}>
              {fixture.awayScore ?? 0}
            </span>
          </div>
        ) : (
          <span className="text-gray-700 font-black text-sm">vs</span>
        )}
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-[8px] font-black uppercase tracking-widest ${cfg.color}`}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Away */}
      <div className={`flex-1 text-left ${isMyAway ? 'text-blue-400' : 'text-white'}`}>
        <p className="text-xs font-black uppercase tracking-tight truncate">
          {fixture.awayTeam?.teamName || 'TBD'}
        </p>
        {fixture.awayTeam?.groupLetter && (
          <p className="text-[9px] text-gray-600 font-bold">Grp {fixture.awayTeam.groupLetter}</p>
        )}
      </div>
    </motion.div>
  );
}
