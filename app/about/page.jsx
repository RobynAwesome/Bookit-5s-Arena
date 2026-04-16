"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaTrophy,
  FaFutbol,
  FaUsers,
  FaCalendarAlt,
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaArrowRight,
  FaHeart,
} from "react-icons/fa";
import AboutSection from "@/components/home/AboutSection";

const TEAM = [
  {
    name: "Kholofelo Robyn Rababalela",
    role: "Lead Developer",
    desc: "Full-stack developer behind the Bookit 5s Arena platform. Robyn specializes in building high-performance, real-time web applications with a focus on immersive UX and robust backend systems. Her expertise in the Next.js ecosystem ensures that every booking and match update is delivered with lightning-fast low latency.",
    linkedin: "https://linkedin.com",
  },
  {
    name: "Mashoto Bayne Rababalela",
    role: "Founder",
    desc: "Founder and visionary behind 5s Arena at Hellenic Football Club. With a deep passion for grassroots sports, Mashoto is dedicated to creating professional-grade environments for community athletes. His mission is to bridge the gap between amateur play and professional competition through world-class facilities and high-stakes tournaments.",
    linkedin: "https://linkedin.com",
  },
];

const STATS = [
  { val: "4+", label: "Floodlit Courts", icon: FaFutbol, color: "#22c55e" },
  { val: "48", label: "Tournament Teams", icon: FaTrophy, color: "#eab308" },
  { val: "12h", label: "Open Daily", icon: FaCalendarAlt, color: "#3b82f6" },
  { val: "∞", label: "Good Times", icon: FaHeart, color: "#f97316" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, transparent 65%)",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Animated Brand Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-36 h-36 mb-4 animate-bounce-slow">
              <img
                src="/images/logo.png"
                alt="Bookit 5s Arena Logo"
                className="w-full h-full object-contain rounded-full"
                style={{ animation: "spin 8s linear infinite" }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-green-400 font-black uppercase tracking-[0.3em] text-xs mb-4"
            >
              Hellenic Football Club · Milnerton · Cape Town
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-black uppercase tracking-tight leading-none mb-6"
              style={{
                fontSize: "clamp(3rem, 8vw, 5.5rem)",
                fontFamily: "Impact, Arial Black, sans-serif",
              }}
            >
              About <span className="text-green-500">5s Arena</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Cape Town&apos;s premier five-a-side football experience. Book a
              court, compete in tournaments, and be part of the most
              electrifying football community in Milnerton.
            </motion.p>
          </div>
        </div>
      </section>
      {/* ── Stats ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center"
            >
              <s.icon
                size={20}
                style={{ color: s.color }}
                className="mx-auto mb-3"
              />
              <p
                className="text-3xl font-black"
                style={{
                  color: s.color,
                  fontFamily: "Impact, Arial Black, sans-serif",
                }}
              >
                {s.val}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Venue Info (reuse existing component) ── */}
      <AboutSection />

      {/* ── Contact ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-green-400 font-black uppercase tracking-widest text-xs mb-2">
            Get In Touch
          </p>
          <h2
            className="text-3xl font-black uppercase"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Contact Us
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: FaPhone,
              label: "Call Us",
              value: "+27 63 782 0245",
              href: "tel:+27637820245",
              color: "#22c55e",
            },
            {
              icon: FaEnvelope,
              label: "Email",
              value: "fivearena@gmail.com",
              href: "mailto:fivearena@gmail.com",
              color: "#3b82f6",
            },
            {
              icon: FaWhatsapp,
              label: "WhatsApp",
              value: "Message Us",
              href: "https://wa.me/27637820245",
              color: "#25D366",
            },
          ].map((c) => (
            <motion.a
              key={c.label}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={
                c.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              whileHover={{ y: -4 }}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: `${c.color}22`,
                  border: `1px solid ${c.color}44`,
                }}
              >
                <c.icon size={20} style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  {c.label}
                </p>
                <p className="text-white font-bold text-sm mt-0.5">{c.value}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-6 bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-4">
          <FaMapMarkerAlt
            size={20}
            className="text-green-400 shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
              Address
            </p>
            <p className="text-white font-semibold">
              Hellenic Football Club, Milnerton, Cape Town, 7441
            </p>
            <a
              href="https://maps.google.com/?q=Hellenic+Football+Club+Milnerton+Cape+Town"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-xs font-bold uppercase tracking-widest mt-2 inline-flex items-center gap-1.5 transition-colors"
            >
              Get Directions <FaArrowRight size={10} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <p className="text-green-400 font-black uppercase tracking-widest text-xs mb-2">
            The People Behind It
          </p>
          <h2
            className="text-3xl font-black uppercase"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Our Team
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-900/30 border-2 border-green-500/40 flex items-center justify-center">
                <FaUsers size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  {member.name}
                </h3>
                <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {member.desc}
                </p>
              </div>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors"
              >
                <FaLinkedin /> Connect on LinkedIn
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-linear-to-r from-green-900/30 via-gray-900 to-green-900/30 border border-green-500/20 rounded-3xl p-10 text-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/3 to-transparent -skew-x-12"
            animate={{ translateX: ["-100%", "200%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <FaTrophy size={32} className="text-yellow-500 mx-auto mb-4" />
          <h2
            className="text-2xl md:text-3xl font-black uppercase mb-3"
            style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
          >
            Ready to Play?
          </h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            Book a court, join the tournament, or just come watch the action. 5s
            Arena is where Cape Town plays.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/courts"
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.35)]"
            >
              Book a Court
            </Link>
            <Link
              href="/tournament"
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-widest text-sm rounded-xl border border-gray-700 transition-all"
            >
              Join Tournament
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
