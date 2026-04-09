"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ManagerNavbar from "@/components/manager/ManagerNavbar";
import {
  FaUserShield,
  FaTrophy,
  FaCalendarCheck,
  FaGift,
  FaUsersCog,
  FaExclamationTriangle,
  FaFutbol,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import useSSE from "@/hooks/useSSE";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [fixtures, setFixtures] = useState([]);

  const fetchTeamData = async () => {
    try {
      const res = await fetch("/api/tournament/my-team");
      if (res.ok) {
        const data = await res.json();
        setTeam(data.team);
      }
    } catch {}
    setLoading(false);
  };

  // Real-time connection indicator
  const { connected } = useSSE("/api/sse/tournament", (data) => {
    if (data.type === "fixture-update" || data.type === "standings-update") {
      fetchTeamData();
    }
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      if (session?.user?.activeRole !== "manager") {
        router.replace("/");
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTeamData();
      }
    }
  }, [status, session, router]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-blue-500 gap-4">
        <FaUserShield size={40} className="animate-pulse" />
        <p className="tracking-widest font-black uppercase text-sm">
          Validating Manager Access...
        </p>
      </div>
    );
  }

  const isConfirmed = team?.paymentStatus === "confirmed";

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      <ManagerNavbar session={session} connected={connected} />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Animated page title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">
            5s Arena World Cup 2026
          </p>
          <h1
            className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            MANAGER <span className="text-blue-400">HQ</span>
          </h1>
          <div className="h-1 w-16 bg-blue-500 mx-auto mt-4 rounded-full" />
        </motion.div>

        {/* Security notice */}
        <div className="mb-8 bg-blue-900/10 border border-blue-700/20 rounded-2xl p-4 flex items-start gap-4">
          <FaShieldAlt className="text-blue-500 shrink-0 mt-0.5" size={16} />
          <div>
            <h3 className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-1">
              Manager Role — Restricted Environment
            </h3>
            <p className="text-xs text-blue-400/70 leading-relaxed">
              You have access to your squad and fixtures only. Admin functions
              (standings editing, draw generation, score entry) are reserved for
              competition admins.
            </p>
          </div>
        </div>

        {/* No team registered yet — show CTA */}
        {!team && (
          <div className="mb-8 p-8 rounded-3xl border border-blue-500/20 bg-blue-900/10 text-center">
            <FaTrophy className="text-blue-400 mx-auto mb-4" size={40} />
            <h2
              className="text-xl font-black uppercase tracking-tight mb-2"
              style={{ fontFamily: "Impact, sans-serif" }}
            >
              No Team Registered Yet
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              Register your team for the World Cup tournament to manage your squad,
              view fixtures, and track standings from this dashboard.
            </p>
            <a
              href="/tournament"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all"
            >
              <FaTrophy size={14} /> Register Your Team
            </a>
          </div>
        )}

        {/* Team status banner */}
        {team && (
          <div
            className={`mb-8 p-5 rounded-3xl border flex items-center gap-5 ${
              isConfirmed
                ? "bg-green-900/10 border-green-500/20"
                : "bg-yellow-900/10 border-yellow-500/20"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isConfirmed ? "bg-green-900/30" : "bg-yellow-900/30"
              }`}
            >
              {isConfirmed ? (
                <FaCheckCircle className="text-green-400" size={22} />
              ) : (
                <FaHourglassHalf className="text-yellow-500" size={22} />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 text-gray-500">
                Active Registration
              </p>
              <h2
                className="text-xl font-black uppercase tracking-tight"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                {team.teamName}
                {team.worldCupTeam && (
                  <span className="text-blue-400 ml-2">
                    — {team.worldCupTeam.split(" (")[0]}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">
                {isConfirmed
                  ? "Confirmed & Active"
                  : "Awaiting payment confirmation"}
                {team.groupLetter && ` · Group ${team.groupLetter}`}
              </p>
            </div>
          </div>
        )}

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Squad Editing — ALLOWED */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-green-500/20 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-green-500/10 transition-all" />
            <div className="flex items-start justify-between mb-4">
              <FaUsersCog className="text-green-500 text-3xl" />
              <span className="text-[8px] font-black uppercase text-green-600 tracking-widest bg-green-900/20 border border-green-800/30 px-2 py-0.5 rounded-full">
                Allowed
              </span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest mb-2">
              Squad
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Edit player names, positions, and photos for your registered team.
            </p>
            <Link
              href="/manager/squad"
              className="inline-flex items-center justify-center w-full py-3 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              Manage Squad
            </Link>
          </motion.div>

          {/* Competitions — READ ONLY */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/20 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-all" />
            <div className="flex items-start justify-between mb-4">
              <FaTrophy className="text-blue-500 text-3xl" />
              <span className="text-[8px] font-black uppercase text-blue-600 tracking-widest bg-blue-900/20 border border-blue-800/30 px-2 py-0.5 rounded-full">
                Read-Only
              </span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest mb-2">
              Standings
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              View live tournament standings and league tables (read-only).
            </p>
            <Link
              href="/tournament/bracket"
              className="inline-flex items-center justify-center w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              View Standings
            </Link>
          </motion.div>

          {/* Fixtures — READ ONLY */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-orange-500/20 transition-all"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-orange-500/10 transition-all" />
            <div className="flex items-start justify-between mb-4">
              <FaCalendarCheck className="text-orange-500 text-3xl" />
              <span className="text-[8px] font-black uppercase text-orange-600 tracking-widest bg-orange-900/20 border border-orange-800/30 px-2 py-0.5 rounded-full">
                Read-Only
              </span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest mb-2">
              Fixtures
            </h2>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Check your upcoming match-ups, opponent info, and schedule.
            </p>
            <Link
              href="/manager/fixtures"
              className="inline-flex items-center justify-center w-full py-3 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/20 text-orange-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
            >
              View Fixtures
            </Link>
          </motion.div>

          {/* Profile — BLOCKED features only */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-700/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex items-start justify-between mb-4">
              <FaGift className="text-gray-600 text-3xl" />
              <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest bg-gray-800 border border-gray-700/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FaLock size={7} /> Locked
              </span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-widest mb-2 text-gray-600">
              Rewards
            </h2>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Loyalty rewards and profile management coming soon.
            </p>
            <button
              disabled
              className="inline-flex items-center justify-center w-full py-3 bg-gray-800/50 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed"
            >
              <FaLock className="mr-2" size={10} /> Coming Soon
            </button>
          </motion.div>
        </div>

        {/* Admin-only notice */}
        <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center gap-3">
          <FaLock className="text-red-800 shrink-0" size={14} />
          <p className="text-[10px] text-gray-600 leading-relaxed">
            <span className="text-gray-500 font-bold">
              Admin-only functions
            </span>{" "}
            — Score entry, standings editing, draw generation, and team approval
            are controlled by competition administrators only.
          </p>
        </div>
      </main>
    </div>
  );
}
