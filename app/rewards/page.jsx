"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFutbol,
  FaClock,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaTrophy,
  FaStar,
  FaArrowRight,
  FaLock,
  FaUserPlus,
  FaFire,
  FaGift,
  FaChartLine,
  FaShareAlt,
  FaCopy,
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaUser,
  FaUsers,
  FaGlobeAfrica,
  FaCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import InfoTooltip from "@/components/InfoTooltip";
import AnimatedTitle from "@/components/AnimatedTitle";

const RARITY_STYLES = {
  common: {
    border: "border-gray-700",
    glow: "",
    badge: "bg-gray-800 text-gray-400",
    label: "Common",
  },
  uncommon: {
    border: "border-green-700/60",
    glow: "shadow-[0_0_12px_rgba(34,197,94,0.2)]",
    badge: "bg-green-900/40 text-green-400",
    label: "Uncommon",
  },
  rare: {
    border: "border-blue-700/60",
    glow: "shadow-[0_0_12px_rgba(96,165,250,0.2)]",
    badge: "bg-blue-900/40 text-blue-400",
    label: "Rare",
  },
  epic: {
    border: "border-purple-700/60",
    glow: "shadow-[0_0_14px_rgba(167,139,250,0.25)]",
    badge: "bg-purple-900/40 text-purple-400",
    label: "Epic",
  },
  legendary: {
    border: "border-yellow-600/60",
    glow: "shadow-[0_0_18px_rgba(245,158,11,0.3)]",
    badge: "bg-yellow-900/40 text-yellow-400",
    label: "Legendary",
  },
};

const TIER_COLORS = {
  Bronze: {
    from: "#92400e",
    to: "#d97706",
    text: "text-amber-500",
    bg: "bg-amber-900/20",
    border: "border-amber-700/40",
  },
  Silver: {
    from: "#475569",
    to: "#94a3b8",
    text: "text-slate-300",
    bg: "bg-slate-800/40",
    border: "border-slate-600/40",
  },
  Gold: {
    from: "#92400e",
    to: "#f59e0b",
    text: "text-yellow-400",
    bg: "bg-yellow-900/20",
    border: "border-yellow-700/40",
  },
  Diamond: {
    from: "#1e40af",
    to: "#60a5fa",
    text: "text-blue-400",
    bg: "bg-blue-900/20",
    border: "border-blue-700/40",
  },
};

function StatCard({ icon, label, value, color, delay, tooltip }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center cursor-default"
    >
      <div className={`text-3xl mb-2 ${color}`}>{icon}</div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
        {label}
        {tooltip && <InfoTooltip text={tooltip} position="bottom" size={11} />}
      </p>
    </motion.div>
  );
}

// ── Confetti Celebration Component — drops emojis + coloured shapes ──
function ConfettiCelebration({ active, onComplete, emoji }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) return;
    const colors = [
      "#22c55e",
      "#f59e0b",
      "#3b82f6",
      "#a855f7",
      "#ef4444",
      "#06b6d4",
      "#f97316",
      "#ec4899",
    ];
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.8,
      duration: 2.5 + Math.random() * 2.5,
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape:
        Math.random() > 0.6 ? "emoji" : Math.random() > 0.5 ? "circle" : "rect",
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -30, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "110vh",
            x: `${p.x + (Math.random() - 0.5) * 30}vw`, // eslint-disable-line react-hooks/purity
            opacity: [1, 1, 0.8, 0],
            rotate: p.rotation + 720,
            scale: [1, 1.3, 0.8, 0.3],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeOut" }}
          className="absolute"
          style={
            p.shape === "emoji"
              ? { fontSize: 16 + Math.random() * 16, lineHeight: 1 } // eslint-disable-line react-hooks/purity
              : {
                  width: p.size,
                  height: p.shape === "rect" ? p.size * 0.6 : p.size,
                  backgroundColor: p.color,
                  borderRadius: p.shape === "circle" ? "50%" : "2px",
                }
          }
        >
          {p.shape === "emoji" ? emoji || "🏆" : null}
        </motion.div>
      ))}
    </div>
  );
}

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [referralData, setReferralData] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebratedAchievement, setCelebratedAchievement] = useState(null);

  // Fetch referral data when the referrals tab is active
  useEffect(() => {
    if (activeTab !== "referrals" || status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReferralLoading(true);
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => {
        setReferralData(d);
        setReferralLoading(false);
      })
      .catch(() => setReferralLoading(false));
  }, [activeTab, status]);

  useEffect(() => {
    if (status === "unauthenticated") return;
    if (status === "authenticated") {
      fetch("/api/rewards")
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setLoading(false);
          // Check for newly unlocked achievements (compare with localStorage)
          if (typeof window !== "undefined") {
            const prev = JSON.parse(
              localStorage.getItem("rewards_unlocked") || "[]",
            );
            const current = d.achievements
              .filter((a) => a.unlocked)
              .map((a) => a.id);
            const newlyUnlocked = current.filter((id) => !prev.includes(id));
            if (newlyUnlocked.length > 0) {
              const achievement = d.achievements.find(
                (a) => a.id === newlyUnlocked[0],
              );
              setCelebratedAchievement(achievement);
              setShowConfetti(true);
            }
            localStorage.setItem("rewards_unlocked", JSON.stringify(current));
          }
        });
    }
  }, [status]);

  // Unauthenticated — show teaser page
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-950 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="inline-flex items-center justify-center w-24 h-24 rounded-full border-2 border-yellow-500 mb-6 shadow-[0_0_40px_rgba(245,158,11,0.3)]"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
              }}
            >
              <FaTrophy className="text-4xl text-yellow-400" />
            </div>
            <h1
              className="text-4xl font-black uppercase tracking-widest text-white mb-3"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              5S Rewards
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              Earn points, unlock achievements, climb tiers and claim exclusive
              perks every time you step on the pitch.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { icon: "🥉", label: "Bronze", desc: "Starting tier" },
                { icon: "🥈", label: "Silver", desc: "5 bookings" },
                { icon: "🥇", label: "Gold", desc: "10 bookings" },
                { icon: "💎", label: "Diamond", desc: "20 bookings" },
              ].map((t, i) => (
                <motion.div
                  key={t.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-1">{t.icon}</div>
                  <p className="text-white font-bold text-sm">{t.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{t.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                  boxShadow: "0 0 25px rgba(34,197,94,0.4)",
                }}
              >
                <FaUserPlus size={14} /> Join &amp; Start Earning
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all"
              >
                Already a member? Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-yellow-400 animate-pulse font-semibold">
            Loading your rewards...
          </p>
        </div>
      </div>
    );
  }

  const tier = data.tier;
  const tierStyle = TIER_COLORS[tier.name] || TIER_COLORS.Bronze;
  const progressPct = tier.nextAt
    ? Math.min((data.totalBookings / tier.nextAt) * 100, 100)
    : 100;
  const bookingsUntilNext = tier.nextAt
    ? Math.max(tier.nextAt - data.totalBookings, 0)
    : 0;

  // Role-based UI logic
  const role = data.role || "user";
  const isManager = role === "manager";
  const isUser = role === "user";

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaChartLine size={11} /> },
    {
      id: "achievements",
      label: isManager ? "Manager Achievements" : "Achievements",
      icon: <FaTrophy size={11} />,
    },
    { id: "history", label: "My Bookings", icon: <FaFutbol size={11} /> },
    {
      id: "perks",
      label: isManager ? "Manager Perks" : "Perks",
      icon: <FaGift size={11} />,
    },
    { id: "referrals", label: "Referrals", icon: <FaShareAlt size={11} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-10 px-4">
      {/* Confetti celebration */}
      <ConfettiCelebration
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
        emoji={celebratedAchievement?.icon}
      />

      {/* Achievement celebration modal */}
      <AnimatePresence>
        {celebratedAchievement && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setCelebratedAchievement(null)}
            />
            <motion.div
              className="relative bg-gray-900 border-2 border-yellow-600/60 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
              initial={{ scale: 0.5, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 40 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              style={{ boxShadow: "0 0 60px rgba(245,158,11,0.3)" }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {celebratedAchievement.icon}
              </motion.div>
              <h3
                className="text-xl font-black uppercase tracking-widest text-yellow-400 mb-1"
                style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
              >
                Achievement Unlocked!
              </h3>
              <p className="text-white font-bold text-lg mb-1">
                {celebratedAchievement.name}
              </p>
              <p className="text-gray-400 text-sm mb-1">
                {celebratedAchievement.desc}
              </p>
              {celebratedAchievement.unlockedCourt && (
                <p className="text-[10px] text-gray-500 mt-2">
                  <FaMapMarkerAlt
                    className="inline mr-1 text-green-500"
                    size={9}
                  />
                  {celebratedAchievement.unlockedCourt}
                  {celebratedAchievement.unlockedAt && (
                    <>
                      {" "}
                      &middot;{" "}
                      <FaCalendarAlt
                        className="inline mx-0.5 text-green-500"
                        size={9}
                      />
                      {new Date(
                        celebratedAchievement.unlockedAt,
                      ).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </>
                  )}
                </p>
              )}
              <span
                className={`inline-block mt-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${RARITY_STYLES[celebratedAchievement.rarity]?.badge || ""}`}
              >
                {RARITY_STYLES[celebratedAchievement.rarity]?.label}
              </span>
              <motion.button
                onClick={() => setCelebratedAchievement(null)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-white cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #92400e 0%, #f59e0b 100%)",
                  boxShadow: "0 0 20px rgba(245,158,11,0.3)",
                }}
              >
                Awesome!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Animated Title ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatedTitle
            text={[
              { text: "5S ", highlight: false },
              { text: "Rewards", highlight: true },
            ]}
            subtitle="Earn points, unlock achievements and climb the ranks"
            icon={<FaTrophy />}
            size="lg"
            align="left"
          />
        </motion.div>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`rounded-2xl border p-6 sm:p-8 relative overflow-hidden ${tierStyle.bg} ${tierStyle.border}`}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(ellipse at top right, ${tier.color} 0%, transparent 60%)`,
            }}
          />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                className="text-5xl"
              >
                {tier.icon}
              </motion.div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5 flex items-center gap-1">
                  Current Tier{" "}
                  <InfoTooltip
                    text="Tiers: Bronze (0+) → Silver (5 bookings) → Gold (10) → Diamond (20). Higher tiers unlock better perks and priority booking."
                    position="right"
                  />
                </p>
                <h1
                  className={`text-3xl font-black uppercase tracking-widest ${tierStyle.text}`}
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  {tier.name}
                </h1>
                <p className="text-gray-400 text-sm mt-0.5">
                  {session?.user?.name?.split(" ")[0]}&apos;s Membership
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-gray-500 text-xs uppercase tracking-widest flex items-center justify-end gap-1">
                Arena Points{" "}
                <InfoTooltip
                  text="Earn 100 points per confirmed booking + 50 points per hour played. Points determine your tier and unlock exclusive perks."
                  position="left"
                />
              </p>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`text-4xl font-black ${tierStyle.text}`}
              >
                {data.points.toLocaleString()}
              </motion.p>
              <p className="text-gray-600 text-xs">pts earned</p>
            </div>
          </div>

          {/* Tier progress bar */}
          {tier.next && (
            <div className="relative mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  {tier.name}
                </span>
                <span className="text-xs font-bold text-gray-300">
                  {bookingsUntilNext > 0
                    ? `${bookingsUntilNext} booking${bookingsUntilNext !== 1 ? "s" : ""} to ${tier.next}`
                    : `${tier.next} unlocked!`}
                </span>
                <span
                  className={`text-xs uppercase tracking-widest ${tierStyle.text}`}
                >
                  {tier.next}
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{
                    duration: 1.2,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${tier.color}, ${TIER_COLORS[tier.next]?.to || "#22c55e"})`,
                  }}
                />
              </div>
              <p className="text-gray-600 text-xs mt-1.5 text-center">
                {data.totalBookings} / {tier.nextAt} confirmed bookings
              </p>
            </div>
          )}
          {!tier.next && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-center py-2 px-4 rounded-xl bg-blue-900/30 border border-blue-700/50 text-blue-300 text-sm font-bold"
            >
              💎 Maximum Tier Achieved — You are a 5S Legend!
            </motion.div>
          )}
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-1 bg-gray-900 border border-gray-800 rounded-2xl p-1.5"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-green-700 text-white shadow-[0_0_12px_rgba(34,197,94,0.4)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  icon={<FaFutbol />}
                  label="Courts Booked"
                  value={data.totalBookings}
                  color="text-green-400"
                  delay={0}
                  tooltip="Total confirmed bookings"
                />
                <StatCard
                  icon={<FaClock />}
                  label="Hours Played"
                  value={`${data.totalHours}h`}
                  color="text-blue-400"
                  delay={0.07}
                  tooltip="Total hours on the pitch"
                />
                <StatCard
                  icon={<FaMoneyBillWave />}
                  label="Total Spent"
                  value={`R${data.totalSpent.toLocaleString()}`}
                  color="text-yellow-400"
                  delay={0.14}
                  tooltip="Total confirmed spend"
                />
                <StatCard
                  icon={<FaMapMarkerAlt />}
                  label="Courts Visited"
                  value={data.courtsVisited}
                  color="text-purple-400"
                  delay={0.21}
                  tooltip="Unique courts booked"
                />
              </div>

              {/* Achievement preview */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    <FaTrophy className="text-yellow-400" /> Achievements
                  </h3>
                  <button
                    onClick={() => setActiveTab("achievements")}
                    className="text-xs text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                  >
                    View All <FaArrowRight size={9} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(data.unlockedCount / data.achievements.length) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full bg-linear-to-r from-yellow-600 to-yellow-400"
                    />
                  </div>
                  <span className="text-xs text-gray-400 font-bold shrink-0">
                    {data.unlockedCount}/{data.achievements.length}
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {data.achievements.map((a) => {
                    // Highlight social for manager, interface for user
                    const isSocial = [
                      "shared_social",
                      "referred_teams",
                      "hosted_tournament",
                    ].includes(a.id);
                    const isInterface = [
                      "booked_via_app",
                      "customized_profile",
                      "scavenger_hunt",
                    ].includes(a.id);
                    let highlight = false;
                    if (isManager && isSocial) highlight = true;
                    if (isUser && isInterface) highlight = true;
                    return (
                      <motion.div
                        key={a.id}
                        whileHover={{
                          scale: 1.15,
                          transition: { duration: 0.15 },
                        }}
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${
                          a.unlocked
                            ? `${RARITY_STYLES[a.rarity].border} ${RARITY_STYLES[a.rarity].glow} bg-gray-800` +
                              (highlight ? " ring-4 ring-green-500/60" : "")
                            : "border-gray-800 bg-gray-900/50 grayscale opacity-30"
                        }`}
                        title={`${a.name}: ${a.desc}`}
                      >
                        {a.unlocked ? a.icon : "🔒"}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Tip card */}
              {tier.next && bookingsUntilNext <= 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-900/20 border border-green-700/50 rounded-2xl p-4 flex items-start gap-3"
                >
                  <FaFire className="text-orange-400 text-xl mt-0.5 shrink-0 animate-pulse" />
                  <div>
                    <p className="text-white font-bold text-sm">
                      You&apos;re so close!
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Just {bookingsUntilNext} more booking
                      {bookingsUntilNext !== 1 ? "s" : ""} and you&apos;ll reach{" "}
                      <span className={tierStyle.text}>{tier.next}</span> tier —
                      unlock exclusive benefits!
                    </p>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-green-400 hover:text-green-300 font-bold transition-colors"
                    >
                      Book a court now <FaArrowRight size={9} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── ACHIEVEMENTS TAB ── */}
          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.achievements.map((a, i) => {
                  const rs = RARITY_STYLES[a.rarity];
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                      whileHover={
                        a.unlocked
                          ? { y: -3, transition: { duration: 0.2 } }
                          : {}
                      }
                      onClick={() => {
                        if (a.unlocked) {
                          setCelebratedAchievement(a);
                          setShowConfetti(true);
                        }
                      }}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        a.unlocked
                          ? `bg-gray-900 ${rs.border} ${rs.glow} cursor-pointer`
                          : "bg-gray-900/40 border-gray-800 opacity-50 grayscale"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${a.unlocked ? "bg-gray-800" : "bg-gray-900"} border border-gray-700`}
                      >
                        {a.unlocked ? a.icon : "🔒"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-bold text-sm">
                            {a.name}
                          </p>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${rs.badge}`}
                          >
                            {rs.label}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs">{a.desc}</p>
                        {a.unlocked && (
                          <div className="mt-1 space-y-0.5">
                            <p className="text-green-400 text-[10px] font-bold">
                              ✓ Unlocked
                            </p>
                            {(a.unlockedCourt || a.unlockedAt) && (
                              <p className="text-[9px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                                {a.unlockedCourt && (
                                  <span className="flex items-center gap-0.5">
                                    <FaMapMarkerAlt
                                      size={8}
                                      className="text-green-600"
                                    />
                                    {a.unlockedCourt}
                                  </span>
                                )}
                                {a.unlockedAt && (
                                  <span className="flex items-center gap-0.5">
                                    <FaCalendarAlt
                                      size={8}
                                      className="text-green-600"
                                    />
                                    {new Date(a.unlockedAt).toLocaleDateString(
                                      "en-ZA",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                        {!a.unlocked && (
                          <p className="text-gray-600 text-[10px] mt-1">
                            Keep booking to unlock
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              {data.recent.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                  <FaFutbol className="text-4xl text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 font-semibold">No bookings yet</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 mt-4 py-3 px-6 rounded-xl text-sm font-black text-white uppercase tracking-widest hover:scale-105 transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                    }}
                  >
                    Book Your First Court
                  </Link>
                </div>
              ) : (
                <>
                  {data.recent.map((b, i) => (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.4 }}
                      whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center justify-between hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-900/30 border border-green-800/50 flex items-center justify-center shrink-0">
                          <FaFutbol className="text-green-400 text-sm" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">
                            {b.courtName}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {b.date} · {b.start_time} · {b.duration}h
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-green-400 font-black text-sm">
                          R{b.total_price}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            b.status === "confirmed"
                              ? "bg-green-900/40 text-green-400"
                              : b.status === "cancelled"
                                ? "bg-red-900/40 text-red-400"
                                : "bg-yellow-900/40 text-yellow-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  <Link
                    href="/bookings"
                    className="block text-center text-xs text-green-400 hover:text-green-300 transition-colors py-2"
                  >
                    View all bookings →
                  </Link>
                </>
              )}
            </motion.div>
          )}

          {/* ── PERKS TAB ── */}
          {activeTab === "perks" && (
            <motion.div
              key="perks"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              {[
                {
                  tier: "All Members",
                  color: tierStyle,
                  perks: [
                    {
                      icon: "📅",
                      title: "Online Booking",
                      desc: "Reserve courts 24/7 from anywhere",
                      active: true,
                    },
                    {
                      icon: "📧",
                      title: "Booking Confirmations",
                      desc: "Instant email confirmations for every booking",
                      active: true,
                    },
                    {
                      icon: "📍",
                      title: "Pay at Venue",
                      desc: "Reserve now and pay cash or card on arrival",
                      active: true,
                    },
                  ],
                },
                {
                  tier: "Silver & Above",
                  color: TIER_COLORS.Silver,
                  locked: data.totalBookings < 5,
                  perks: [
                    {
                      icon: "⚡",
                      title: "Priority Booking",
                      desc: "Book up to 7 days in advance (vs 3 days standard)",
                      active: data.totalBookings >= 5,
                    },
                    {
                      icon: "🎁",
                      title: "Member Discounts",
                      desc: "5% off on bookings of 2+ hours",
                      active: data.totalBookings >= 5,
                    },
                  ],
                },
                {
                  tier: "Gold & Above",
                  color: TIER_COLORS.Gold,
                  locked: data.totalBookings < 10,
                  perks: [
                    {
                      icon: "🥇",
                      title: "Gold Booking Window",
                      desc: "14-day advance booking window",
                      active: data.totalBookings >= 10,
                    },
                    {
                      icon: "💰",
                      title: "Loyalty Discount",
                      desc: "10% off all bookings",
                      active: data.totalBookings >= 10,
                    },
                    {
                      icon: "🎉",
                      title: "Birthday Surprise",
                      desc: "Special offer on your birthday month",
                      active: data.totalBookings >= 10,
                    },
                  ],
                },
                {
                  tier: "Diamond",
                  color: TIER_COLORS.Diamond,
                  locked: data.totalBookings < 20,
                  perks: [
                    {
                      icon: "💎",
                      title: "VIP Status",
                      desc: "Your name on the Wall of Legends",
                      active: data.totalBookings >= 20,
                    },
                    {
                      icon: "🆓",
                      title: "Free Hour",
                      desc: "One complimentary hour per month",
                      active: data.totalBookings >= 20,
                    },
                    {
                      icon: "📞",
                      title: "Dedicated Line",
                      desc: "Direct WhatsApp line for bookings",
                      active: data.totalBookings >= 20,
                    },
                  ],
                },
              ].map((section, si) => (
                <motion.div
                  key={section.tier}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: si * 0.08 }}
                  className={`bg-gray-900 border rounded-2xl overflow-hidden ${section.color.border || "border-gray-800"}`}
                >
                  <div
                    className={`px-5 py-3 border-b border-gray-800 flex items-center justify-between ${section.color.bg || "bg-gray-800/30"}`}
                  >
                    <h3
                      className={`text-sm font-black uppercase tracking-widest ${section.color.text || "text-white"}`}
                    >
                      {section.tier}
                    </h3>
                    {section.locked && (
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <FaLock size={9} />{" "}
                        {data.totalBookings < 5
                          ? "5"
                          : data.totalBookings < 10
                            ? "10"
                            : "20"}{" "}
                        bookings to unlock
                        <InfoTooltip
                          text="Keep booking courts to reach this tier. Every confirmed booking counts toward your total."
                          position="left"
                          size={11}
                        />
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-gray-800">
                    {section.perks.map((perk) => (
                      <div
                        key={perk.title}
                        className={`flex items-start gap-3 px-5 py-3.5 ${!perk.active ? "opacity-40" : ""}`}
                      >
                        <span className="text-xl shrink-0 mt-0.5">
                          {perk.icon}
                        </span>
                        <div>
                          <p className="text-white text-sm font-semibold">
                            {perk.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {perk.desc}
                          </p>
                        </div>
                        {perk.active && (
                          <span className="ml-auto text-green-400 text-xs font-bold shrink-0">
                            ✓ Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

              <motion.a
                href="https://wa.me/27637820245?text=Hi%20I%27m%20a%20rewards%20member%20and%20want%20to%20enquire%20about%20my%20perks"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 25px rgba(34,197,94,0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-black text-white uppercase tracking-widest"
                style={{
                  background:
                    "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                }}
              >
                WhatsApp to Redeem Perks
              </motion.a>
            </motion.div>
          )}

          {/* ── REFERRALS TAB ── */}
          {activeTab === "referrals" && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              {referralLoading || !referralData ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-green-400 animate-pulse font-semibold text-sm">
                    Loading referral data...
                  </p>
                </div>
              ) : (
                <>
                  {/* Your Referral Code */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center"
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-center gap-1">
                      <FaShareAlt className="text-green-400" /> Your Referral
                      Code
                    </p>
                    <div className="inline-flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl px-6 py-4 mb-4">
                      <span className="text-3xl font-black text-green-400 tracking-[0.3em] font-mono">
                        {referralData.referralCode}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            referralData.referralCode,
                          );
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className={`p-2 rounded-lg transition-all ${copied ? "bg-green-700 text-white" : "bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600"}`}
                        title="Copy code"
                      >
                        {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs">
                      Share this code with friends. When they register, you both
                      earn rewards!
                    </p>
                  </motion.div>

                  {/* Share Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.07 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                  >
                    <a
                      href={`https://wa.me/?text=Join%20me%20at%205s%20Arena%20and%20earn%20rewards!%20Use%20my%20code%20${referralData.referralCode}%20when%20you%20register:%20${encodeURIComponent(referralData.shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-800/30 border border-green-700/50 text-green-400 text-xs font-bold uppercase tracking-widest hover:bg-green-800/50 transition-all"
                    >
                      <FaWhatsapp size={16} /> WhatsApp
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=Join%20me%20at%205s%20Arena%20and%20earn%20rewards!%20Use%20my%20code%20${referralData.referralCode}&url=${encodeURIComponent(referralData.shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-800/30 border border-blue-700/50 text-blue-400 text-xs font-bold uppercase tracking-widest hover:bg-blue-800/50 transition-all"
                    >
                      <FaTwitter size={16} /> Twitter
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralData.shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-900/30 border border-blue-800/50 text-blue-300 text-xs font-bold uppercase tracking-widest hover:bg-blue-900/50 transition-all"
                    >
                      <FaFacebook size={16} /> Facebook
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralData.shareUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                        copiedLink
                          ? "bg-green-800/50 border border-green-600/60 text-green-300"
                          : "bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      {copiedLink ? (
                        <>
                          <FaCheck size={14} /> Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy size={14} /> Copy Link
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* 5-Stage Referral Chain Visual */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.14 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                  >
                    <h3
                      className="text-sm font-black uppercase tracking-widest text-white mb-1 flex items-center gap-2"
                      style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                    >
                      <FaUsers className="text-green-400" /> 5-Stage Referral
                      Chain
                    </h3>
                    <p className="text-gray-500 text-xs mb-5">
                      Earn points when your referrals invite others — up to 5
                      levels deep!
                    </p>

                    <div className="space-y-3">
                      {[
                        {
                          level: 1,
                          label: "Direct Invite",
                          points: 200,
                          icon: <FaUser className="text-green-400" />,
                          color: "green",
                        },
                        {
                          level: 2,
                          label: "Invite's Invite",
                          points: 100,
                          icon: <FaUsers className="text-emerald-400" />,
                          color: "emerald",
                        },
                        {
                          level: 3,
                          label: "Level 3",
                          points: 50,
                          icon: <FaUsers className="text-teal-400" />,
                          color: "teal",
                        },
                        {
                          level: 4,
                          label: "Level 4",
                          points: 25,
                          icon: <FaGlobeAfrica className="text-cyan-400" />,
                          color: "cyan",
                        },
                        {
                          level: 5,
                          label: "Level 5",
                          points: 10,
                          icon: <FaGlobeAfrica className="text-sky-400" />,
                          color: "sky",
                        },
                      ].map((lvl, i) => {
                        const chainAtLevel = referralData.chain.filter(
                          (c) => c.level === lvl.level,
                        );
                        return (
                          <motion.div
                            key={lvl.level}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.2 + i * 0.08,
                              duration: 0.4,
                            }}
                            className="flex items-center gap-3"
                          >
                            {/* Level indicator */}
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-lg">
                              {lvl.icon}
                            </div>
                            {/* Bar */}
                            <div className="flex-1 bg-gray-800 rounded-xl p-3 flex items-center justify-between border border-gray-700/50">
                              <div>
                                <p className="text-white text-sm font-bold">
                                  {lvl.label}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  {chainAtLevel.length}{" "}
                                  {chainAtLevel.length === 1
                                    ? "person"
                                    : "people"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-green-400 font-black text-sm">
                                  +{lvl.points} pts
                                </p>
                                <p className="text-gray-600 text-[10px]">
                                  per referral
                                </p>
                              </div>
                            </div>
                            {/* Connector line */}
                            {i < 4 && (
                              <div className="absolute left-9 w-0.5 h-3 bg-gray-700 hidden" />
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Trickle-down visual */}
                    <div className="mt-5 pt-4 border-t border-gray-800 text-center">
                      <p className="text-gray-500 text-xs">
                        When someone you invite brings a friend, you earn{" "}
                        <span className="text-green-400 font-bold">
                          100 pts
                        </span>
                        . Their friend invites someone? You earn{" "}
                        <span className="text-green-400 font-bold">50 pts</span>
                        , and so on!
                      </p>
                    </div>
                  </motion.div>

                  {/* Referral Stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.21 }}
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <StatCard
                        icon={<FaStar />}
                        label="Referral Points"
                        value={referralData.referralPoints.toLocaleString()}
                        color="text-green-400"
                        delay={0}
                        tooltip="Total points earned from referrals"
                      />
                      <StatCard
                        icon={<FaUserPlus />}
                        label="Direct Referrals"
                        value={referralData.directReferrals}
                        color="text-blue-400"
                        delay={0.07}
                        tooltip="People who used your code directly"
                      />
                      <StatCard
                        icon={<FaUsers />}
                        label="Total Chain"
                        value={referralData.totalChainSize}
                        color="text-purple-400"
                        delay={0.14}
                        tooltip="Everyone in your referral network across all levels"
                      />
                    </div>
                  </motion.div>

                  {/* Recent Referrals */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.28 }}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5"
                  >
                    <h3
                      className="text-sm font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2"
                      style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                    >
                      <FaChartLine className="text-green-400" /> Recent
                      Referrals
                    </h3>
                    {referralData.chain.length === 0 ? (
                      <div className="text-center py-8">
                        <FaShareAlt className="text-3xl text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 font-semibold text-sm">
                          No referrals yet
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          Share your code to start earning points!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {referralData.chain.slice(0, 10).map((entry, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.3 + i * 0.05,
                              duration: 0.35,
                            }}
                            className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-800/50 border border-gray-700/30 hover:border-gray-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs text-gray-400 font-bold shrink-0">
                                {entry.name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="text-white text-sm font-semibold">
                                  {entry.name}
                                </p>
                                <p className="text-gray-500 text-xs">
                                  Level {entry.level}
                                </p>
                              </div>
                            </div>
                            <span className="text-green-400 font-bold text-sm">
                              +{entry.pointsEarned} pts
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
