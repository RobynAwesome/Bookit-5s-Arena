"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  FaFutbol,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaArrowRight,
  FaUserPlus,
  FaCheck,
  FaTh,
  FaCircle,
  FaSquare,
  FaPlay,
  FaInstagram,
  FaWhatsapp,
  FaTrophy,
  FaBirthdayCake,
  FaBuilding,
  FaStar,
} from "react-icons/fa";
import AnimatedTitle from "@/components/AnimatedTitle";

// ─── Constants ────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER = "27637820245";

const statusStyles = {
  confirmed: "bg-green-900/40 text-green-400 border border-green-800/60",
  pending: "bg-yellow-900/40 text-yellow-400 border border-yellow-800/60",
  cancelled: "bg-red-900/40 text-red-400 border border-red-800/60",
};

const VIEW_MODES = [
  { key: "grid", label: "Grid", icon: <FaTh size={12} /> },
  { key: "bubble", label: "Bubble", icon: <FaCircle size={12} /> },
  { key: "square", label: "Square", icon: <FaSquare size={12} /> },
  { key: "tiktok", label: "TikTok", icon: <FaPlay size={12} /> },
  { key: "instagram", label: "Instagram", icon: <FaInstagram size={12} /> },
  { key: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp size={12} /> },
];

const TABS = [
  {
    key: "courts",
    label: "BOOK COURT",
    subtitle: "Reserve a pitch",
    icon: "⚽",
    color: "green",
    glow: "rgba(34,197,94,0.5)",
    border: "rgba(34,197,94,0.6)",
    bg: "from-green-900/30 to-green-950/10",
  },
  {
    key: "events",
    label: "BOOK EVENT",
    subtitle: "Plan your event",
    icon: "📅",
    color: "amber",
    glow: "rgba(245,158,11,0.5)",
    border: "rgba(245,158,11,0.6)",
    bg: "from-amber-900/30 to-amber-950/10",
  },
  {
    key: "mybookings",
    label: "MY BOOKINGS",
    subtitle: "Your reservations",
    icon: "🏆",
    color: "blue",
    glow: "rgba(59,130,246,0.5)",
    border: "rgba(59,130,246,0.6)",
    bg: "from-blue-900/30 to-blue-950/10",
  },
];

const EVENT_CARDS = [
  {
    emoji: "🎂",
    name: "Kids Birthday",
    gradient: "from-pink-600 to-rose-700",
    glow: "rgba(244,63,94,0.4)",
    features: [
      "Up to 15 kids",
      "2hrs court time",
      "1 dedicated coach",
      "Equipment + bibs provided",
    ],
    waText: "Hi! I'd like to book a Kids Birthday at 5s Arena.",
  },
  {
    emoji: "⭐",
    name: "Premium Birthday",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.4)",
    features: [
      "Up to 30 kids",
      "2hrs court time",
      "2 coaches + trophies",
      "Dedicated party area",
    ],
    waText: "Hi! I'd like to book a Premium Birthday at 5s Arena.",
  },
  {
    emoji: "🏢",
    name: "Corporate Team Building",
    gradient: "from-blue-500 to-indigo-600",
    glow: "rgba(59,130,246,0.4)",
    features: [
      "Up to 20 players",
      "3hrs total, 2 courts",
      "Referee + bibs",
      "Tournament format",
    ],
    waText: "Hi! I'd like to book a Corporate Team Building event at 5s Arena.",
  },
  {
    emoji: "🏆",
    name: "Social Tournament",
    gradient: "from-green-500 to-emerald-600",
    glow: "rgba(34,197,94,0.4)",
    features: [
      "Per team entry",
      "League format",
      "Prizes for winners",
      "Referee included",
    ],
    waText: "Hi! I'd like to book a Social Tournament at 5s Arena.",
  },
];

// ─── Magnetic Tab Button ──────────────────────────────────────────────────────

function TabButton({ tab, isActive, onClick, tabIndex: tIdx, activeIndex }) {
  const ref = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-30, 30], [6, -6]);
  const rotateY = useTransform(mouseX, [-60, 60], [-6, 6]);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const colorMap = {
    green: {
      active: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.5)",
    },
    amber: {
      active: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.5)",
    },
    blue: {
      active: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.5)",
    },
  };
  const c = colorMap[tab.color];

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 800 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex-1 cursor-pointer outline-none select-none"
    >
      {/* Active background pill with layoutId */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${c.bg} 0%, transparent 100%)`,
            border: `1px solid ${c.border}`,
            boxShadow: `0 0 30px ${tab.glow}, inset 0 0 20px ${c.bg}`,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      {/* Shimmer sweep on active tab */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
          initial={false}
        >
          <motion.div
            className="absolute top-0 bottom-0 w-16 skew-x-[-20deg]"
            style={{
              background: `linear-gradient(90deg, transparent, ${c.bg}, transparent)`,
            }}
            animate={{ left: ["-20%", "120%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center py-4 px-3 gap-1">
        <motion.span
          className="text-2xl"
          animate={{ scale: isActive ? 1.2 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {tab.icon}
        </motion.span>
        <span
          className="text-[11px] sm:text-xs font-black uppercase tracking-widest leading-tight"
          style={{
            fontFamily: "Impact, Arial Black, sans-serif",
            color: isActive ? c.active : "#6b7280",
          }}
        >
          {tab.label}
        </span>
        <span className="text-[9px] text-gray-600 hidden sm:block">
          {tab.subtitle}
        </span>
      </div>
    </motion.button>
  );
}

// ─── Court Card (Tab 1) ───────────────────────────────────────────────────────

function CourtBookCard({ court, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ scale: 1.05, y: -4 }}
    >
      <Link
        href={`/courts/${court._id}`}
        className="group block relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] transition-all duration-300"
      >
        <div className="relative h-44 overflow-hidden">
          {court.image ? (
            <motion.img
              src={`/images/courts/${court.image}`}
              alt={court.name}
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-500"
              animate={{ scale: [1, 1.04, 1] }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "loop",
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <FaFutbol className="text-green-400/30 text-5xl" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <h3
              className="text-white font-black text-base uppercase tracking-wider drop-shadow"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              {court.name}
            </h3>
          </div>
          <div className="absolute top-3 right-3 bg-green-600/90 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
            R{court.price_per_hour}/hr
          </div>
        </div>
        <div className="p-4">
          <Link href="/bookings">
            <motion.span
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                boxShadow: "0 0 15px rgba(34,197,94,0.4)",
              }}
            >
              BOOK NOW <FaArrowRight size={9} />
            </motion.span>
          </Link>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Court Skeleton ───────────────────────────────────────────────────────────

function CourtSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-3/4" />
        <div className="h-8 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

// ─── Event Card (Tab 2) ───────────────────────────────────────────────────────

function EventBookCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ y: -8 }}
      className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 group cursor-pointer"
      style={{ "--glow": card.glow }}
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `0 0 40px ${card.glow}`, borderRadius: "1rem" }}
      />

      {/* Header gradient */}
      <div
        className={`relative h-28 bg-gradient-to-br ${card.gradient} flex items-center justify-center overflow-hidden`}
      >
        <motion.span
          className="text-5xl"
          animate={{ scale: [1, 1.08, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {card.emoji}
        </motion.span>
        {/* Shimmer */}
        <motion.div
          className="absolute top-0 bottom-0 w-20 skew-x-[-15deg] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
          }}
          animate={{ left: ["-30%", "130%"] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      </div>

      <div className="p-5">
        <h3
          className="text-white font-black text-lg uppercase tracking-wider mb-3"
          style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
        >
          {card.name}
        </h3>
        <ul className="space-y-2 mb-5">
          {card.features.map((feat, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-gray-400 text-sm"
            >
              <FaCheck className="text-green-400 flex-shrink-0" size={10} />
              {feat}
            </li>
          ))}
        </ul>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(card.waText)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <motion.span
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
              boxShadow: "0 0 15px rgba(34,197,94,0.35)",
              display: "flex",
            }}
          >
            <FaWhatsapp size={12} /> WhatsApp Us
          </motion.span>
        </a>
      </div>
    </motion.div>
  );
}

// ─── My Bookings Tab Content ──────────────────────────────────────────────────

function MyBookingsTab({
  bookings,
  loading,
  error,
  authStatus,
  viewMode,
  setViewMode,
  handleCancel,
  showTutorial,
  setShowTutorial,
  neverShowAgain,
  setNeverShowAgain,
}) {
  const dismissTutorial = () => {
    setShowTutorial(false);
    if (neverShowAgain) {
      localStorage.setItem("bookings_tutorial_dismissed", "true");
    }
  };

  return (
    <motion.div
      key="mybookings-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h2
          className="text-3xl font-black uppercase text-white mb-1"
          style={{
            fontFamily: "Impact, Arial Black, sans-serif",
            textShadow: "0 0 30px rgba(59,130,246,0.4)",
          }}
        >
          🏆 MY BOOKINGS
        </h2>
        <p className="text-gray-500 text-sm">Manage your court reservations</p>
      </div>

      {/* View Mode Toggles */}
      {bookings.length > 0 && (
        <motion.div
          className="flex flex-wrap items-center gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mr-1">
            View:
          </span>
          {VIEW_MODES.map((vm) => (
            <motion.button
              key={vm.key}
              onClick={() => setViewMode(vm.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                viewMode === vm.key
                  ? "bg-blue-900/40 text-blue-400 border border-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                  : "bg-gray-900 text-gray-500 border border-gray-800 hover:border-gray-700 hover:text-gray-400"
              }`}
            >
              {vm.icon} {vm.label}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Unauthenticated prompt */}
      {authStatus === "unauthenticated" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center shadow-xl mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/30 border border-green-800/50 mb-6">
            <FaUserPlus className="text-3xl text-green-400" />
          </div>
          <h2
            className="text-2xl font-black uppercase tracking-widest text-white mb-2"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Register to View Bookings
          </h2>
          <p className="text-gray-400 text-sm mb-2 max-w-sm mx-auto">
            Create a free account to book courts, track your reservations, and
            unlock member benefits.
          </p>
          <ul className="text-gray-500 text-xs mb-8 space-y-1">
            <li>⚽ Book and reserve courts online</li>
            <li>📅 Full booking history &amp; management</li>
            <li>🏆 Loyalty rewards &amp; member perks</li>
            <li>🔔 Booking reminders &amp; confirmations</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 py-3 px-7 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                boxShadow: "0 0 20px rgba(34,197,94,0.35)",
              }}
            >
              <FaUserPlus size={13} /> Create Free Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 py-3 px-7 rounded-xl text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 hover:border-gray-600 hover:text-white transition-all"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-20 text-blue-400 animate-pulse text-lg">
          Loading your bookings...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800 border border-gray-700 mb-6">
            <FaFutbol className="text-4xl text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg font-semibold mb-2">
            No bookings yet
          </p>
          <p className="text-gray-600 text-sm mb-8">
            Ready to hit the pitch? Book a court now.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-black text-white uppercase tracking-widest transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
              boxShadow: "0 0 20px rgba(34,197,94,0.35)",
            }}
          >
            Browse Courts <FaArrowRight size={11} />
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* ═══ GRID VIEW ═══ */}
          {viewMode === "grid" && (
            <motion.div
              key="grid"
              className="space-y-4"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              {bookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4 },
                    },
                  }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-lg hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {booking.court?.image && (
                      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-700">
                        <Image
                          src={`/images/courts/${booking.court.image}`}
                          alt={booking.court.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white">
                        {booking.court?.name ?? "Court"}
                      </h3>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <FaCalendarAlt className="text-green-500" size={11} />
                        {new Date(booking.date).toLocaleDateString("en-ZA", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center gap-2">
                        <FaClock className="text-green-500" size={11} />
                        {booking.start_time} · {booking.duration} hour
                        {booking.duration > 1 ? "s" : ""}
                      </p>
                      <p className="text-sm font-bold text-green-400">
                        R{booking.total_price}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${statusStyles[booking.status] ?? statusStyles.pending}`}
                    >
                      {booking.status}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/bookings/${booking._id}`}
                        className="text-xs px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center gap-1"
                      >
                        View <FaArrowRight size={9} />
                      </Link>
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="text-xs px-3 py-2 bg-red-950 border border-red-900 rounded-xl text-red-400 hover:bg-red-900/50 hover:border-red-700 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <FaTrash size={9} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ═══ BUBBLE VIEW ═══ */}
          {viewMode === "bubble" && (
            <motion.div
              key="bubble"
              className="flex flex-wrap justify-center gap-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.08,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  className="relative w-40 h-40 rounded-full bg-gray-900 border-2 border-gray-800 flex flex-col items-center justify-center text-center shadow-xl hover:border-green-700 transition-colors cursor-pointer group"
                >
                  <div
                    className={`absolute inset-0 rounded-full border-3 ${
                      booking.status === "confirmed"
                        ? "border-green-500/40"
                        : booking.status === "cancelled"
                          ? "border-red-500/40"
                          : "border-yellow-500/40"
                    }`}
                  />
                  <FaFutbol className="text-green-500 mb-1" size={16} />
                  <p className="text-[11px] font-bold text-white leading-tight px-3 truncate w-full">
                    {booking.court?.name ?? "Court"}
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {booking.start_time}
                  </p>
                  <p className="text-[9px] text-green-400 font-bold">
                    R{booking.total_price}
                  </p>
                  <span
                    className={`absolute -bottom-1 px-2 py-0.5 rounded-full text-[8px] font-bold capitalize ${statusStyles[booking.status] ?? statusStyles.pending}`}
                  >
                    {booking.status}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/bookings/${booking._id}`}
                      className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700"
                    >
                      <FaArrowRight size={10} />
                    </Link>
                    {booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="p-2 bg-red-900 rounded-full text-red-400 hover:bg-red-800 cursor-pointer"
                      >
                        <FaTrash size={10} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ═══ SQUARE VIEW ═══ */}
          {viewMode === "square" && (
            <motion.div
              key="square"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="relative aspect-square bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group shadow-lg hover:border-gray-700 transition-colors"
                >
                  {booking.court?.image ? (
                    <Image
                      src={`/images/courts/${booking.court.image}`}
                      alt={booking.court.name}
                      fill
                      className="object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-gray-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-bold capitalize mb-1.5 ${statusStyles[booking.status] ?? statusStyles.pending}`}
                    >
                      {booking.status}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight truncate">
                      {booking.court?.name ?? "Court"}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      {new Date(booking.date).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {booking.start_time}
                    </p>
                    <p className="text-[10px] font-bold text-green-400">
                      R{booking.total_price}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/bookings/${booking._id}`}
                      className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-white hover:bg-black/80"
                    >
                      <FaArrowRight size={9} />
                    </Link>
                    {booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="p-1.5 bg-black/60 backdrop-blur rounded-lg text-red-400 hover:bg-black/80 cursor-pointer"
                      >
                        <FaTrash size={9} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ═══ TIKTOK VIEW ═══ */}
          {viewMode === "tiktok" && (
            <motion.div
              key="tiktok"
              className="max-w-sm mx-auto space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 120,
                  }}
                  className="relative rounded-3xl overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl"
                  style={{ aspectRatio: "9/16", maxHeight: 480 }}
                >
                  {booking.court?.image ? (
                    <Image
                      src={`/images/courts/${booking.court.image}`}
                      alt={booking.court.name}
                      fill
                      className="object-cover opacity-30"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-green-950 to-gray-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold capitalize mb-3 ${statusStyles[booking.status] ?? statusStyles.pending}`}
                    >
                      {booking.status}
                    </span>
                    <h3
                      className="text-xl font-black text-white uppercase tracking-wider mb-2"
                      style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                    >
                      {booking.court?.name ?? "Court"}
                    </h3>
                    <p className="text-sm text-gray-300 flex items-center gap-2 mb-1">
                      <FaCalendarAlt size={12} className="text-green-400" />
                      {new Date(booking.date).toLocaleDateString("en-ZA", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-sm text-gray-300 flex items-center gap-2 mb-2">
                      <FaClock size={12} className="text-green-400" />
                      {booking.start_time} · {booking.duration}h
                    </p>
                    <p className="text-lg font-black text-green-400 mb-4">
                      R{booking.total_price}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/bookings/${booking._id}`}
                        className="flex-1 text-center text-xs px-4 py-2.5 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                      >
                        View
                      </Link>
                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="px-4 py-2.5 bg-red-600/20 backdrop-blur border border-red-500/30 rounded-xl text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-600/30 transition-all cursor-pointer"
                        >
                          <FaTrash size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="absolute right-3 bottom-48 flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                        <FaFutbol className="text-white" size={16} />
                      </div>
                      <span className="text-[8px] text-white mt-1 font-bold">
                        COURT
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                        <FaClock className="text-white" size={16} />
                      </div>
                      <span className="text-[8px] text-white mt-1 font-bold">
                        {booking.duration}H
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ═══ INSTAGRAM VIEW ═══ */}
          {viewMode === "instagram" && (
            <motion.div
              key="instagram"
              className="max-w-lg mx-auto space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                      <FaFutbol size={12} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">
                        {booking.court?.name ?? "Court"}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {new Date(booking.date).toLocaleDateString("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[8px] font-bold capitalize ${statusStyles[booking.status] ?? statusStyles.pending}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="relative aspect-square bg-gray-800">
                    {booking.court?.image ? (
                      <Image
                        src={`/images/courts/${booking.court.image}`}
                        alt={booking.court.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-gray-900 flex items-center justify-center">
                        <FaFutbol size={48} className="text-gray-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-800">
                    <Link
                      href={`/bookings/${booking._id}`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <FaArrowRight size={16} />
                    </Link>
                    {booking.status !== "cancelled" && (
                      <button
                        onClick={() => handleCancel(booking._id)}
                        className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                    <div className="flex-1" />
                    <span className="text-sm font-black text-green-400">
                      R{booking.total_price}
                    </span>
                  </div>
                  <div className="px-4 pb-3">
                    <p className="text-xs text-gray-400">
                      <span className="font-bold text-white mr-1">
                        {booking.court?.name ?? "Court"}
                      </span>
                      {booking.start_time} · {booking.duration} hour
                      {booking.duration > 1 ? "s" : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ═══ WHATSAPP VIEW ═══ */}
          {viewMode === "whatsapp" && (
            <motion.div
              key="whatsapp"
              className="max-w-lg mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-green-800 rounded-t-2xl px-4 py-3 flex items-center gap-3 border-b border-green-700">
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center">
                  <FaFutbol size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    5s Arena Bookings
                  </p>
                  <p className="text-[10px] text-green-200">
                    {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className="bg-[#0b141a] p-4 space-y-3 min-h-[200px] rounded-b-2xl"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              >
                {bookings.map((booking, i) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="max-w-[85%] bg-[#005c4b] rounded-2xl rounded-tl-md p-3 shadow-lg relative"
                  >
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-[#005c4b] border-l-[8px] border-l-transparent" />
                    <div className="flex items-start gap-3">
                      {booking.court?.image && (
                        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-green-700/50">
                          <Image
                            src={`/images/courts/${booking.court.image}`}
                            alt={booking.court.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">
                          {booking.court?.name ?? "Court"}
                        </p>
                        <p className="text-[11px] text-green-100/80 mt-0.5">
                          {new Date(booking.date).toLocaleDateString("en-ZA", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          · {booking.start_time}
                        </p>
                        <p className="text-[11px] text-green-100/80">
                          {booking.duration} hour
                          {booking.duration > 1 ? "s" : ""} ·{" "}
                          <span className="font-bold text-green-300">
                            R{booking.total_price}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-700/30">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-bold capitalize ${statusStyles[booking.status] ?? statusStyles.pending}`}
                      >
                        {booking.status}
                      </span>
                      <div className="flex gap-1.5">
                        <Link
                          href={`/bookings/${booking._id}`}
                          className="text-[9px] text-green-200 hover:text-white font-bold uppercase tracking-wider"
                        >
                          View →
                        </Link>
                        {booking.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="text-[9px] text-red-300 hover:text-red-200 font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-right text-[8px] text-green-300/50 mt-1">
                      {new Date(booking.date).toLocaleTimeString("en-ZA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Tutorial Popup */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={dismissTutorial}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-900/30 border border-green-800/50 mb-3">
                  <FaTh className="text-green-400 text-xl" />
                </div>
                <h3
                  className="text-lg font-black uppercase tracking-widest text-white"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  View Modes
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Switch how your bookings are displayed
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {VIEW_MODES.map((vm) => (
                  <div
                    key={vm.key}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center"
                  >
                    <div className="text-green-400 mb-1 flex justify-center">
                      {vm.icon}
                    </div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {vm.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 text-center mb-4">
                Use the view toggles above your bookings to switch between Grid,
                Bubble, Square, TikTok, Instagram, and WhatsApp styles.
              </p>
              <label className="flex items-center gap-2 items-center mb-4 cursor-pointer justify-center">
                <input
                  type="checkbox"
                  checked={neverShowAgain}
                  onChange={(e) => setNeverShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500"
                />
                <span className="text-[11px] text-gray-400">
                  Never show this again
                </span>
              </label>
              <motion.button
                onClick={dismissTutorial}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-white cursor-pointer transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                  boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                }}
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const BookingsPage = () => {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(2);
  const [prevTab, setPrevTab] = useState(2);

  // My Bookings state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showTutorial, setShowTutorial] = useState(false);
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  // Courts state
  const [courts, setCourts] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(true);

  // Tutorial on first visit
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("bookings_tutorial_dismissed");
      if (!dismissed) setShowTutorial(true);
    }
  }, []);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch {
      setError("Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch courts
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const res = await fetch("/api/courts");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCourts(data);
      } catch {
        // silently fail — show empty state
      } finally {
        setCourtsLoading(false);
      }
    };
    fetchCourts();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
    } else {
      alert("Failed to cancel booking. Please try again.");
    }
  };

  const handleTabChange = (idx) => {
    // BOOK COURT → navigate to homepage courts section
    if (idx === 0) {
      router.push("/");
      return;
    }
    // BOOK EVENT → navigate to events page
    if (idx === 1) {
      router.push("/events");
      return;
    }
    // MY BOOKINGS → show inline
    setPrevTab(activeTab);
    setActiveTab(idx);
  };

  // Directional slide: going right = slide from right, going left = slide from left
  const direction = activeTab >= prevTab ? 1 : -1;

  const tabVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative pt-12 pb-6 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px] opacity-20"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{
              background:
                "radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)",
            }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <AnimatedTitle
            text={[
              { text: "Book ", highlight: false },
              { text: "Your Experience", highlight: true },
            ]}
            subtitle="Choose what you'd like to book today"
            icon={<FaCalendarAlt />}
            size="xl"
            align="center"
          />
        </motion.div>
      </div>

      {/* Tab Bar */}
      <div
        className="sticky top-0 z-30 px-4 pb-4 pt-2"
        style={{
          background: "rgba(3,7,18,0.92)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 bg-gray-900/80 border border-gray-800 rounded-2xl p-2">
            {TABS.map((tab, idx) => (
              <TabButton
                key={tab.key}
                tab={tab}
                isActive={activeTab === idx}
                onClick={() => handleTabChange(idx)}
                tabIndex={idx}
                activeIndex={activeTab}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ═══ TAB 1: BOOK COURT ═══ */}
          {activeTab === 0 && (
            <motion.div
              key="courts"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              {/* Header */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2
                  className="text-3xl font-black uppercase text-white mb-1"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    textShadow: "0 0 30px rgba(34,197,94,0.5)",
                  }}
                >
                  🏟️ CHOOSE YOUR COURT
                </h2>
                <p className="text-gray-500 text-sm">
                  Select a court to view availability and book online
                </p>
              </motion.div>

              {/* Courts grid */}
              {courtsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                  <CourtSkeleton />
                  <CourtSkeleton />
                  <CourtSkeleton />
                  <CourtSkeleton />
                </div>
              ) : courts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  No courts available right now.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
                  {courts.map((court, i) => (
                    <CourtBookCard key={court._id} court={court} index={i} />
                  ))}
                </div>
              )}

              {/* View all link */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/">
                  <motion.span
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-white"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 0 30px rgba(34,197,94,0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background:
                        "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                      boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                      display: "inline-flex",
                    }}
                  >
                    <FaFutbol size={13} /> View All Courts{" "}
                    <FaArrowRight size={11} />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 2: BOOK EVENT ═══ */}
          {activeTab === 1 && (
            <motion.div
              key="events"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              {/* Header */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2
                  className="text-3xl font-black uppercase text-white mb-1"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    textShadow: "0 0 30px rgba(245,158,11,0.5)",
                  }}
                >
                  🎉 PLAN YOUR EVENT
                </h2>
                <p className="text-gray-500 text-sm">
                  Birthday parties, corporate events, tournaments — we do it all
                </p>
              </motion.div>

              {/* Event cards 2x2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {EVENT_CARDS.map((card, i) => (
                  <EventBookCard key={card.name} card={card} index={i} />
                ))}
              </div>

              {/* View events page link */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/events">
                  <motion.span
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-white"
                    whileHover={{
                      scale: 1.04,
                      boxShadow: "0 0 30px rgba(245,158,11,0.5)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background:
                        "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                      boxShadow: "0 0 20px rgba(245,158,11,0.3)",
                      display: "inline-flex",
                    }}
                  >
                    <FaCalendarAlt size={13} /> View Full Events Page{" "}
                    <FaArrowRight size={11} />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* ═══ TAB 3: MY BOOKINGS ═══ */}
          {activeTab === 2 && (
            <motion.div
              key="mybookings"
              custom={direction}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <MyBookingsTab
                bookings={bookings}
                loading={loading}
                error={error}
                authStatus={authStatus}
                viewMode={viewMode}
                setViewMode={setViewMode}
                handleCancel={handleCancel}
                showTutorial={showTutorial}
                setShowTutorial={setShowTutorial}
                neverShowAgain={neverShowAgain}
                setNeverShowAgain={setNeverShowAgain}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookingsPage;
