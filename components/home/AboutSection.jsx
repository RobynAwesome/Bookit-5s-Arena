"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import {
  FaMapMarkerAlt,
  FaClock,
  FaParking,
  FaMusic,
  FaUtensils,
  FaBolt,
  FaDirections,
} from "react-icons/fa";

// Dynamic import — Leaflet requires browser DOM, cannot SSR
const VenueMap = dynamic(() => import("@/components/VenueMap"), { ssr: false });

/* ── Venue amenity items ── */
const AMENITIES = [
  { icon: FaBolt, label: "Floodlit Pitches", color: "#facc15" },
  { icon: FaUtensils, label: "Bar & Restaurant", color: "#f97316" },
  { icon: FaMusic, label: "Sound System", color: "#a855f7" },
  { icon: FaParking, label: "Secure Parking", color: "#3b82f6" },
];

/* ── Opening hours ── */
const HOURS = [
  { day: "Mon – Fri", time: "10:00 – 22:00" },
  { day: "Saturday", time: "10:00 – 22:00" },
  { day: "Sunday", time: "10:00 – 22:00" },
];

export default function AboutSection({ courtsCount = 4 }) {
  const stats = [
    { val: `${courtsCount}+`, label: "Courts" },
    { val: "12h", label: "Daily" },
    { val: "R400", label: "From / hr" },
  ];

  return (
    <section
      id="about"
      className="py-20 bg-gray-950 text-white overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-green-400 font-bold tracking-widest uppercase text-sm mb-4">
              About Us
            </p>
            <h2
              className="font-black uppercase leading-tight mb-6"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontFamily: "Impact, Arial Black, sans-serif",
              }}
            >
              WHAT IS
              <br />
              <span className="text-green-400">5S ARENA?</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              5s Arena is played on state-of-the-art, all-weather, floodlit,
              synthetic grass facilities in the heart of Milnerton, Cape Town.
              We have a bar &amp; restaurant, sound system and secure parking on
              site.
            </p>
            <p className="text-gray-400 leading-relaxed mb-10">
              Small pitches, urban locations, short game times and manageable
              team sizes make 5-a-side the most accessible and exciting format
              of the beautiful game. Whether you&apos;re booking a casual
              kick-about, a competitive tournament, or a corporate team day — 5s
              Arena has you covered.
            </p>

            <div className="flex gap-10">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
                >
                  <div
                    className="font-black text-3xl text-green-400"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    {s.val}
                  </div>
                  <div className="text-gray-500 text-xs uppercase tracking-widest mt-1">
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Animated Venue Showcase Card (replaces Google Maps) */}
          <motion.div
            className="rounded-2xl border border-green-900/60 overflow-hidden bg-linear-to-br from-gray-900 via-gray-900 to-green-950/40 relative"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              borderColor: "rgba(74,222,128,0.5)",
              transition: { duration: 0.3, type: "tween" },
            }}
          >
            {/* Decorative background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />

            {/* Header with animated pin */}
            <div className="relative px-6 pt-6 pb-4 border-b border-green-900/40">
              <div className="flex items-start gap-4">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-green-600/20 border border-green-700/40 flex items-center justify-center shrink-0"
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaMapMarkerAlt className="text-green-400 text-xl" />
                </motion.div>
                <div>
                  <h3
                    className="text-white font-black text-lg uppercase tracking-widest"
                    style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                  >
                    Hellenic Football Club
                  </h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Pringle Rd, Milnerton · Cape Town 7441
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Western Cape, South Africa 🇿🇦
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="relative overflow-hidden" style={{ height: "220px" }}>
              <VenueMap />
            </div>

            {/* Amenities Grid */}
            <div className="px-6 py-5 border-b border-green-900/30">
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-3">
                Amenities
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AMENITIES.map((a, i) => (
                  <motion.div
                    key={a.label}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-800/60 border border-gray-700/40"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: 0.4 + i * 0.08,
                      ease: "easeOut",
                    }}
                    whileHover={{
                      borderColor: `${a.color}50`,
                      backgroundColor: `${a.color}08`,
                      x: 4,
                      transition: { duration: 0.2, type: "tween" },
                    }}
                  >
                    <a.icon style={{ color: a.color }} size={14} />
                    <span className="text-gray-300 text-xs font-semibold">
                      {a.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="px-6 py-5 border-b border-green-900/30">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <FaClock className="text-emerald-400" size={12} />
                </motion.div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                  Opening Hours
                </p>
                <motion.span
                  className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-900/40 text-green-400 border border-green-700/40"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Open Now
                </motion.span>
              </div>
              <div className="space-y-2">
                {HOURS.map((h) => (
                  <div
                    key={h.day}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-400 text-xs font-medium">
                      {h.day}
                    </span>
                    <span className="text-white text-xs font-bold tabular-nums">
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-xs font-bold uppercase tracking-widest">
                  All-Weather · Synthetic Turf
                </span>
              </div>
              <motion.a
                href="https://maps.google.com/?q=Hellenic+Football+Club,+Pringle+Rd,+Milnerton,+Cape+Town"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600/20 border border-green-700/50 text-green-400 text-xs font-bold uppercase tracking-widest hover:bg-green-600/30 transition-colors shrink-0"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.15, type: "tween" },
                }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDirections size={12} /> Directions
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
