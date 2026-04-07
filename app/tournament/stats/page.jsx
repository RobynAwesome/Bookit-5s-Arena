"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaTrophy,
  FaUsers,
  FaFutbol,
  FaCalendarAlt,
  FaChartBar,
  FaArrowRight,
  FaChevronDown,
} from "react-icons/fa";
import Link from "next/link";

const STAT_CARDS = [
  {
    label: "Teams Registered",
    icon: FaUsers,
    color: "#22c55e",
    key: "registeredCount",
  },
  { label: "Total Slots", icon: FaTrophy, color: "#eab308", key: "totalSlots" },
  { label: "Groups", icon: FaChartBar, color: "#3b82f6", value: 8 },
  { label: "Teams per Group", icon: FaFutbol, color: "#a855f7", value: 6 },
];

export default function TournamentStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournament")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const deadline = data?.deadline ? new Date(data.deadline) : null;
  const now = new Date();
  const daysUntilDeadline = deadline
    ? Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="py-20 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FaChartBar className="mx-auto text-green-400 mb-4" size={36} />
          <h1
            className="font-black uppercase tracking-widest mb-3"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            TOURNAMENT <span className="text-green-400">STATS</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Live registration stats and tournament information for the 5s Arena
            World Cup 2026.
          </p>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map((card, i) => {
            const Icon = card.icon;
            const value = card.value || (data ? data[card.key] : "—");
            return (
              <motion.div
                key={card.label}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Icon
                  size={20}
                  style={{ color: card.color }}
                  className="mx-auto mb-2"
                />
                <p
                  className="text-3xl font-black mb-1"
                  style={{
                    fontFamily: "Impact, Arial Black, sans-serif",
                    color: card.color,
                  }}
                >
                  {loading ? "..." : value}
                </p>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  {card.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Deadline Countdown */}
      {daysUntilDeadline !== null && (
        <section className="max-w-4xl mx-auto px-6 pb-12">
          <motion.div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <FaCalendarAlt className="mx-auto text-yellow-400 mb-3" size={24} />
            <h3
              className="font-black uppercase tracking-widest text-xl mb-2"
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              Registration {data?.isOpen ? "Closes In" : "Closed"}
            </h3>
            {data?.isOpen ? (
              <>
                <p
                  className="text-5xl font-black text-green-400 mb-2"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  {daysUntilDeadline}{" "}
                  <span className="text-xl text-gray-500">DAYS</span>
                </p>
                <p className="text-gray-500 text-sm">
                  Deadline:{" "}
                  {deadline?.toLocaleDateString("en-ZA", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </>
            ) : (
              <p className="text-red-400 text-lg font-bold">
                Registration has closed. Good luck to all teams!
              </p>
            )}
          </motion.div>
        </section>
      )}

      {/* Capacity Bar */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Tournament Capacity
            </span>
            <span className="text-xs font-bold text-green-400">
              {loading ? "..." : `${data?.registeredCount || 0}/48 teams`}
            </span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #22c55e, #16a34a)" }}
              initial={{ width: 0 }}
              animate={{
                width: loading
                  ? "0%"
                  : `${((data?.registeredCount || 0) / 48) * 100}%`,
              }}
              transition={{ duration: 1, delay: 0.8 }}
            />
          </div>
        </motion.div>
      </section>

      {/* Tournament Format Info */}
      <section className="max-w-4xl mx-auto px-6 pb-12">
        <motion.div
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
            Tournament Format
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-400">
            {[
              ["Format", "8 groups of 6 teams (old UEFA CL style)"],
              ["Group Stage", "Round-robin (15 matches per group)"],
              ["Advancement", "Top 2 per group advance"],
              ["Knockout", "R16 → Quarter-Finals → Semi-Finals → Final"],
              ["Match Duration", "20 minutes per match"],
              ["Dates", "May 26–31, 2026"],
              ["Venue", "Hellenic Football Club, Milnerton"],
              ["Total Matches", "120 group + 15 knockout = 135 matches"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start gap-2">
                <FaFutbol size={10} className="text-green-500 mt-1 shrink-0" />
                <div>
                  <span className="text-white font-bold">{label}: </span>
                  <span>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-20 text-center">
        <Link href="/tournament">
          <motion.button
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-sm cursor-pointer"
            style={{ boxShadow: "0 0 25px rgba(34,197,94,0.4)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaTrophy size={16} /> Register Your Team <FaArrowRight size={12} />
          </motion.button>
        </Link>
      </section>
    </div>
  );
}
