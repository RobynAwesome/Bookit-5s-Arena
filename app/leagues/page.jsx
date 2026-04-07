"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// import Link from 'next/link';
import {
  FaTrophy,
  FaFutbol,
  FaBolt,
  FaArrowRight,
  FaGlobe,
  FaUsers,
  FaCreditCard,
  FaCalendarAlt,
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaChevronRight,
  FaCheckCircle,
  FaLock,
  FaStar,
} from "react-icons/fa";

/* ── Floating particle ── */
function FloatingParticle({ index }) {
  const seed1 = Math.sin(index * 127.1) * 43758.5453;
  const seed2 = Math.cos(index * 311.7) * 43758.5453;
  const x = (seed1 - Math.floor(seed1)) * 100;
  const y = (seed2 - Math.floor(seed2)) * 100;
  const size = 2 + (seed1 - Math.floor(seed1)) * 4;
  const dur = 8 + (seed2 - Math.floor(seed2)) * 12;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background:
          index % 3 === 0 ? "#22c55e" : index % 3 === 1 ? "#eab308" : "#6366f1",
        opacity: 0.3,
      }}
      animate={{ y: [0, -25, 0], opacity: [0.15, 0.45, 0.15] }}
      transition={{
        duration: dur,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.25,
      }}
    />
  );
}

const TOURNAMENT_STEPS = [
  {
    icon: FaGlobe,
    color: "#3b82f6",
    step: "01",
    title: "Choose Your Nation",
    desc: "Pick from 48 World Cup nations. First come, first served — nations are exclusive.",
  },
  {
    icon: FaUsers,
    color: "#22c55e",
    step: "02",
    title: "Build Your Squad",
    desc: "Register 6–10 players, a manager, and up to 3 support staff members.",
  },
  {
    icon: FaCreditCard,
    color: "#a855f7",
    step: "03",
    title: "Pay Entry Fee",
    desc: "ZAR 3,000 per team. Secure your spot with a confirmed payment.",
  },
  {
    icon: FaCalendarAlt,
    color: "#f97316",
    step: "04",
    title: "Receive Your Fixtures",
    desc: "Get your group draw and match schedule via WhatsApp, email, or SMS.",
  },
  {
    icon: FaTrophy,
    color: "#eab308",
    step: "05",
    title: "Compete for Glory",
    desc: "Win your group · Advance through knockouts · Lift the World Cup 5s trophy.",
  },
];

function TournamentJourney({ onEnter }) {
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    // Animate steps in one by one
    let i = 0;
    const interval = setInterval(() => {
      setActiveStep(i);
      i++;
      if (i >= TOURNAMENT_STEPS.length) clearInterval(interval);
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-2xl"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black tracking-widest uppercase mb-4"
          animate={{
            boxShadow: [
              "0 0 10px rgba(234,179,8,0.2)",
              "0 0 25px rgba(234,179,8,0.5)",
              "0 0 10px rgba(234,179,8,0.2)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <FaTrophy size={10} /> World Cup 5s · May 2026
        </motion.div>
        <h2
          className="font-black uppercase leading-none mb-2"
          style={{
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontFamily: "Impact, Arial Black, sans-serif",
            background:
              "linear-gradient(135deg, #ffffff 0%, #4ade80 40%, #eab308 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Your Tournament Journey
        </h2>
        <p className="text-gray-500 text-sm">
          5 steps to compete in the World Cup 5s
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {TOURNAMENT_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isVisible = i <= activeStep;
          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -30 }}
              animate={
                isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }
              }
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-sm"
              style={{
                background: isVisible
                  ? `${step.color}08`
                  : "rgba(17,24,39,0.4)",
                borderColor: isVisible
                  ? `${step.color}30`
                  : "rgba(55,65,81,0.4)",
              }}
              whileHover={
                isVisible
                  ? {
                      borderColor: `${step.color}60`,
                      background: `${step.color}12`,
                      x: 4,
                      transition: { duration: 0.15, type: "tween" },
                    }
                  : {}
              }
            >
              {/* Step number */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
                style={{
                  background: isVisible
                    ? `${step.color}20`
                    : "rgba(31,41,55,0.6)",
                  color: isVisible ? step.color : "#4b5563",
                  border: `1px solid ${isVisible ? step.color + "40" : "rgba(55,65,81,0.4)"}`,
                }}
              >
                {step.step}
              </div>
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isVisible ? `${step.color}15` : "transparent",
                }}
              >
                <Icon
                  size={16}
                  style={{ color: isVisible ? step.color : "#4b5563" }}
                />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-black uppercase text-sm tracking-wider"
                  style={{ color: isVisible ? "#fff" : "#4b5563" }}
                >
                  {step.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: isVisible ? "#9ca3af" : "#374151" }}
                >
                  {step.desc}
                </p>
              </div>
              {/* Check */}
              <AnimatePresence>
                {isVisible && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <FaCheckCircle size={16} style={{ color: step.color }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* CTAs */}
      <AnimatePresence>
        {activeStep >= TOURNAMENT_STEPS.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              onClick={onEnter}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #15803d, #22c55e)",
                boxShadow: "0 0 40px rgba(34,197,94,0.5)",
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 60px rgba(34,197,94,0.7)",
              }}
              whileTap={{ scale: 0.97 }}
              animate={{
                boxShadow: [
                  "0 0 30px rgba(34,197,94,0.4)",
                  "0 0 50px rgba(34,197,94,0.7)",
                  "0 0 30px rgba(34,197,94,0.4)",
                ],
              }}
              transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
            >
              <FaTrophy size={16} /> Enter the Tournament{" "}
              <FaArrowRight size={12} />
            </motion.button>
            <motion.button
              onClick={() => window.history.back()}
              className="px-6 py-4 rounded-2xl border border-gray-700 text-gray-400 font-bold uppercase tracking-widest text-xs cursor-pointer hover:border-gray-600 hover:text-gray-300 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Back
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LeaguesPage() {
  const [mounted, setMounted] = useState(true); // Set true by default, or use a layout effect if needed
  const [view, setView] = useState("welcome"); // 'welcome' | 'journey' | 'competitions'

  // useEffect(() => { setMounted(true); }, []); // Not needed unless you have SSR hydration issues

  const handleChooseTournament = () => setView("journey");
  const handleChooseCompetitions = () => setView("competitions");
  const handleEnterTournament = () => {
    window.location.href = "/tournament";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background particles — client-only to avoid hydration mismatch */}
      {mounted &&
        Array.from({ length: 30 }).map((_, i) => (
          <FloatingParticle key={i} index={i} />
        ))}

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-gray-950 via-transparent to-gray-950 pointer-events-none" />

      {/* ── WELCOME MODAL ── */}
      <AnimatePresence>
        {view === "welcome" && (
          <motion.div
            key="welcome"
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
            <motion.div
              className="relative z-10 w-full max-w-3xl"
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Modal card */}
              <div
                className="relative rounded-3xl overflow-hidden border border-gray-700/60 shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
                style={{
                  background:
                    "linear-gradient(160deg, #0f172a 0%, #111827 50%, #0c1220 100%)",
                }}
              >
                {/* Top glow bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #22c55e, #eab308, #22c55e)",
                  }}
                />

                {/* Inner grid lines (subtle) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="relative p-8 sm:p-10">
                  {/* Header */}
                  <div className="text-center mb-10">
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 mx-auto"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(34,197,94,0.15))",
                        border: "2px solid rgba(234,179,8,0.3)",
                        boxShadow: "0 0 40px rgba(234,179,8,0.2)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(234,179,8,0.2)",
                          "0 0 50px rgba(234,179,8,0.5)",
                          "0 0 20px rgba(234,179,8,0.2)",
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <FaTrophy size={32} style={{ color: "#eab308" }} />
                    </motion.div>
                    <motion.h2
                      className="font-black uppercase mb-2"
                      style={{
                        fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
                        fontFamily: "Impact, Arial Black, sans-serif",
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #4ade80 50%, #eab308 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Welcome to Competitions
                    </motion.h2>
                    <motion.p
                      className="text-gray-500 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      Select your arena
                    </motion.p>
                  </div>

                  {/* Two choice cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* COMPETITIONS (Coming Soon) */}
                    <motion.button
                      onClick={handleChooseCompetitions}
                      className="relative rounded-2xl p-6 text-left cursor-pointer overflow-hidden group border"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(99,102,241,0.06) 100%)",
                        borderColor: "rgba(6,182,212,0.2)",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{
                        borderColor: "rgba(6,182,212,0.6)",
                        background:
                          "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(99,102,241,0.1) 100%)",
                        y: -4,
                        transition: { duration: 0.2, type: "tween" },
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Coming soon badge */}
                      <motion.div
                        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171",
                        }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Coming Soon
                      </motion.div>

                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                        style={{
                          background: "rgba(6,182,212,0.1)",
                          border: "1px solid rgba(6,182,212,0.2)",
                        }}
                      >
                        <FaFutbol size={22} style={{ color: "#06b6d4" }} />
                      </div>
                      <h3
                        className="font-black uppercase tracking-wider text-lg text-white mb-1"
                        style={{
                          fontFamily: "Impact, Arial Black, sans-serif",
                        }}
                      >
                        Competitions
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        Weekly 5-a-side leagues. All skill levels. Monday
                        nights, Wednesday socials, Saturday mornings.
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                        <FaLock size={10} /> Season 1 Opening Soon
                      </div>
                    </motion.button>

                    {/* TOURNAMENT (Open) */}
                    <motion.button
                      onClick={handleChooseTournament}
                      className="relative rounded-2xl p-6 text-left cursor-pointer overflow-hidden group border"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(234,179,8,0.08) 100%)",
                        borderColor: "rgba(34,197,94,0.3)",
                        boxShadow: "0 0 30px rgba(34,197,94,0.1)",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{
                        borderColor: "rgba(34,197,94,0.7)",
                        background:
                          "linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(234,179,8,0.14) 100%)",
                        boxShadow: "0 0 50px rgba(34,197,94,0.25)",
                        y: -4,
                        transition: { duration: 0.2, type: "tween" },
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Pulsing OPEN badge */}
                      <motion.div
                        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                        style={{
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.4)",
                          color: "#4ade80",
                        }}
                        animate={{
                          boxShadow: [
                            "0 0 6px rgba(34,197,94,0.3)",
                            "0 0 16px rgba(34,197,94,0.6)",
                            "0 0 6px rgba(34,197,94,0.3)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-green-400"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        Open Now
                      </motion.div>

                      {/* Animated glow shimmer */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(120deg, transparent 30%, rgba(234,179,8,0.06) 50%, transparent 70%)",
                        }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      />

                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative"
                        style={{
                          background: "rgba(234,179,8,0.12)",
                          border: "1px solid rgba(234,179,8,0.3)",
                        }}
                      >
                        <FaTrophy size={22} style={{ color: "#eab308" }} />
                      </div>
                      <h3
                        className="font-black uppercase tracking-wider text-lg text-white mb-1"
                        style={{
                          fontFamily: "Impact, Arial Black, sans-serif",
                        }}
                      >
                        World Cup 5s
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        48-team tournament. Represent your nation. World Cup
                        group format. Cash prizes + glory.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <FaBolt size={9} style={{ color: "#22c55e" }} /> 26
                          May 2026
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <FaStar size={9} style={{ color: "#eab308" }} /> ZAR
                          3,000/team
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                        View steps to register <FaChevronRight size={10} />
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOURNAMENT JOURNEY ── */}
      <AnimatePresence>
        {view === "journey" && (
          <motion.div
            key="journey"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-lg" />
            <div className="relative z-10 w-full max-w-2xl py-8">
              <div
                className="relative rounded-3xl overflow-hidden border border-gray-700/60 shadow-[0_40px_120px_rgba(0,0,0,0.8)]"
                style={{
                  background:
                    "linear-gradient(160deg, #0f172a 0%, #111827 50%, #0c1220 100%)",
                }}
              >
                <div
                  className="h-1 w-full"
                  style={{
                    background:
                      "linear-gradient(90deg, #22c55e, #eab308, #22c55e)",
                  }}
                />
                <div className="p-8">
                  <TournamentJourney onEnter={handleEnterTournament} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMPETITIONS COMING SOON (main page content) ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <AnimatePresence mode="wait">
          {view === "competitions" && (
            <motion.div
              key="coming-soon"
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-red-950/40 border border-red-700/40 mb-8"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full bg-red-500"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
                  Season 1 · Coming Soon
                </span>
              </motion.div>

              <motion.h1
                className="font-black uppercase mb-6 leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 12vw, 8rem)",
                  fontFamily: "Impact, Arial Black, sans-serif",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #06b6d4 50%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                COMING
                <br />
                SOON
              </motion.h1>

              <p className="text-gray-500 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                Compete with the best in Cape Town. Weekly 5-a-side competitions
                for every skill level. Monday nights, Wednesday socials,
                Saturday mornings — your pitch, your team, your glory.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                  {
                    icon: "🏆",
                    title: "Competitive Play",
                    desc: "Weekly matches & standings",
                  },
                  {
                    icon: "📊",
                    title: "Live Standings",
                    desc: "Real-time standings tables",
                  },
                  {
                    icon: "⚡",
                    title: "All Levels",
                    desc: "Social to competitive",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    className="px-5 py-6 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.15 }}
                    whileHover={{
                      borderColor: "rgba(34,197,94,0.4)",
                      y: -4,
                      transition: { duration: 0.2, type: "tween" },
                    }}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <p className="text-white font-bold text-sm mb-1">
                      {item.title}
                    </p>
                    <p className="text-gray-500 text-xs">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={handleChooseTournament}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-sm cursor-pointer"
                  style={{ boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 50px rgba(34,197,94,0.6)",
                    transition: { duration: 0.2, type: "tween" },
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTrophy size={16} /> Join the Tournament Instead{" "}
                  <FaArrowRight size={12} />
                </motion.button>
                <motion.a
                  href="https://wa.me/27637820245?text=Hi%2C%20I%27m%20interested%20in%20joining%20a%20competition%20at%205s%20Arena!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 text-xs font-bold uppercase tracking-widest hover:border-green-700 hover:text-white transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaWhatsapp className="text-green-400" /> Get Notified When We
                  Launch
                </motion.a>
              </div>

              <div className="mt-12 flex items-center justify-center gap-4">
                <span className="text-gray-700 text-xs uppercase tracking-widest">
                  Follow us
                </span>
                {[
                  {
                    icon: FaInstagram,
                    href: "https://instagram.com/fivesarena",
                    color: "#e1306c",
                  },
                  {
                    icon: FaTiktok,
                    href: "https://tiktok.com/@fivesarena",
                    color: "#fff",
                  },
                  {
                    icon: FaWhatsapp,
                    href: "https://wa.me/27637820245",
                    color: "#25d366",
                  },
                ].map((s) => (
                  <motion.a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"
                    whileHover={{
                      scale: 1.2,
                      y: -2,
                      transition: { duration: 0.15, type: "tween" },
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <s.icon style={{ color: s.color }} size={14} />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
