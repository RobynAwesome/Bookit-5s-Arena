"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaTrophy,
  FaArrowRight,
  FaFutbol,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaPlay,
} from "react-icons/fa";

/* World Cup team logos */
const TEAMS = [
  { name: "Lionel Messi", logo: "/images/tournament/worldcup-logos/lionel-messi-team.jpg" },
  { name: "Cristiano Ronaldo", logo: "/images/tournament/worldcup-logos/cristiano-ronaldo-team.jpg" },
  { name: "Kylian Mbappé", logo: "/images/tournament/worldcup-logos/kylian-mbappe-team.jpg" },
  { name: "Vinicius Jr", logo: "/images/tournament/worldcup-logos/vinícius-jr-team.jpg" },
  { name: "Lamine Yamal", logo: "/images/tournament/worldcup-logos/lamine-yamal-team.jpg" },
  { name: "Harry Kane", logo: "/images/tournament/worldcup-logos/harry-kane-team.jpg" },
  { name: "Florian Wirtz", logo: "/images/tournament/worldcup-logos/florian-wirtz-team.jpg" },
  { name: "Son Heung-Min", logo: "/images/tournament/worldcup-logos/son-heung-min-team.jpg" },
  { name: "Mohamed Salah", logo: "/images/tournament/worldcup-logos/mohamed-salah-team.png" },
  { name: "Kevin De Bruyne", logo: "/images/tournament/worldcup-logos/kevin-de-bruyne-team.jpg" },
  { name: "Gianluigi Donnarumma", logo: "/images/tournament/worldcup-logos/gianluigi-donnarumma-team.jpg" },
  { name: "Robert Lewandowski", logo: "/images/tournament/worldcup-logos/robert-lewandowski-team.jpg" },
  { name: "Luka Modric", logo: "/images/tournament/worldcup-logos/luka-modric-team.png" },
  { name: "Achraf Hakimi", logo: "/images/tournament/worldcup-logos/achraf-hakimi-team.jpg" },
  { name: "Takefusa Kubo", logo: "/images/tournament/worldcup-logos/takefusa-kubo-team.jpg" },
  { name: "Riyad Mahrez", logo: "/images/tournament/worldcup-logos/riyad-mahrez-team.jpg" },
  { name: "Victor Osimhen", logo: "/images/tournament/worldcup-logos/victor-osimhen-team.png" },
  { name: "Percy Tau", logo: "/images/tournament/worldcup-logos/percy-tau-team.png" },
  { name: "Oswin Appollis", logo: "/images/tournament/worldcup-logos/oswin-appollis-team.jpg" },
  { name: "Peter Shalulile", logo: "/images/tournament/worldcup-logos/peter-shalulile-team.png" },
  { name: "Thomas Partey", logo: "/images/tournament/worldcup-logos/thomas-partey-team.png" },
  { name: "Yves Bissouma", logo: "/images/tournament/worldcup-logos/yves-bissouma-team.png" },
  { name: "Christian Pulisic", logo: "/images/tournament/worldcup-logos/christian-pulisic-team.png" },
  { name: "Jordan Pefok", logo: "/images/tournament/worldcup-logos/jordan-pefok-team.jpg" },
];

/* Floating football decorations */
const BALLS = [0, 1, 2, 3, 4];

export default function TournamentSection() {
  const [activeTeamIndex, setActiveTeamIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const railRef = useRef(null);
  const activeTeam = TEAMS[activeTeamIndex];

  useEffect(() => {
    if (isCarouselPaused) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveTeamIndex((current) => (current + 1) % TEAMS.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [isCarouselPaused]);

  useEffect(() => {
    const rail = railRef.current;
    const activeCard = rail?.querySelector(`[data-team-index="${activeTeamIndex}"]`);

    if (!rail || !activeCard) {
      return;
    }

    const cardOffset = activeCard.offsetLeft - rail.clientWidth / 2 + activeCard.clientWidth / 2;
    rail.scrollTo({
      left: Math.max(0, cardOffset),
      behavior: "smooth",
    });
  }, [activeTeamIndex]);

  return (
    <section className="relative overflow-hidden">
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <Image
          src="/images/tournament/backgrounds/homepage-background-banner.jpg"
          alt="Tournament Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Top fade from weather bar (black), centre shows image, bottom fade into courts */}
        <div className="absolute inset-0 bg-linear-to-b from-gray-950 via-gray-950/50 to-gray-950" />
        {/* Subtle green side vignettes */}
        <div className="absolute inset-0 bg-linear-to-r from-gray-950/60 via-transparent to-gray-950/60" />
        {/* Green atmospheric glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(34,197,94,0.12) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Floating Footballs ── */}
      {BALLS.map((i) => (
        <motion.div
          key={i}
          className="absolute text-green-500/10 pointer-events-none"
          style={{
            top: `${15 + i * 16}%`,
            left: i % 2 === 0 ? `${3 + i * 4}%` : "auto",
            right: i % 2 !== 0 ? `${3 + i * 4}%` : "auto",
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 360] }}
          transition={{
            y:      { duration: 3.5 + i * 0.8, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 9 + i * 2,     repeat: Infinity, ease: "linear" },
          }}
        >
          <FaFutbol size={22 + i * 6} />
        </motion.div>
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{
              boxShadow: [
                "0 0 0px rgba(34,197,94,0)",
                "0 0 24px rgba(34,197,94,0.4)",
                "0 0 0px rgba(34,197,94,0)",
              ],
            }}
            transition={{ boxShadow: { duration: 2.5, repeat: Infinity }, default: { duration: 0.6 } }}
          >
            <FaTrophy size={10} /> NEW — INAUGURAL TOURNAMENT
          </motion.div>
        </div>

        {/* Main headline */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            className="font-black uppercase leading-none mb-4"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 6rem)",
              fontFamily: "Impact, Arial Black, sans-serif",
            }}
          >
            <span className="text-white">5s ARENA </span>
            <motion.span
              className="text-green-400 inline-block"
              animate={{ textShadow: ["0 0 0px #4ade80", "0 0 40px #4ade80", "0 0 0px #4ade80"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              WORLD CUP
            </motion.span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
            Choose your nation. Build your squad. Compete for glory.
          </p>
        </motion.div>

        {/* ── Event info pills — bigger + more captivating ── */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          {/* Dates */}
          <motion.div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.06, borderColor: "rgba(74,222,128,0.5)", backgroundColor: "rgba(34,197,94,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaCalendarAlt className="text-green-400" size={18} />
            </motion.div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-none mb-0.5">Tournament Dates</p>
              <p className="text-white font-black text-base md:text-lg leading-none" style={{ fontFamily: "Impact, Arial Black, sans-serif" }}>
                MAY 26 – 31, 2026
              </p>
            </div>
          </motion.div>

          {/* Venue */}
          <motion.div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.06, borderColor: "rgba(74,222,128,0.5)", backgroundColor: "rgba(34,197,94,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaMapMarkerAlt className="text-green-400" size={18} />
            </motion.div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-none mb-0.5">Venue</p>
              <p className="text-white font-black text-base md:text-lg leading-none" style={{ fontFamily: "Impact, Arial Black, sans-serif" }}>
                HELLENIC FC · MILNERTON
              </p>
            </div>
          </motion.div>

          {/* Format */}
          <motion.div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.06, borderColor: "rgba(74,222,128,0.5)", backgroundColor: "rgba(34,197,94,0.1)" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FaUsers className="text-green-400" size={18} />
            </motion.div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold leading-none mb-0.5">Format</p>
              <p className="text-white font-black text-base md:text-lg leading-none" style={{ fontFamily: "Impact, Arial Black, sans-serif" }}>
                8 GROUPS × 6 TEAMS
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Interactive team rail */}
        <motion.div
          className="relative mb-14"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="mb-4 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
                Interactive Flag Carousel
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Tap any nation icon to spotlight it. The carousel now pauses on command so mobile,
                macOS, and touch users can browse without the rail drifting away.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveTeamIndex((current) => (current - 1 + TEAMS.length) % TEAMS.length)
                }
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-green-400/40 hover:bg-white/10"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsCarouselPaused((value) => !value)}
                className="inline-flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-green-300 transition hover:bg-green-500/20"
              >
                {isCarouselPaused ? <FaPlay size={12} /> : <FaPause size={12} />}
                {isCarouselPaused ? "Resume Wheel" : "Pause Wheel"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTeamIndex((current) => (current + 1) % TEAMS.length)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-green-400/40 hover:bg-white/10"
              >
                <FaChevronRight size={14} />
              </button>
            </div>
          </div>

          <div
            ref={railRef}
            className="flex snap-x gap-3 overflow-x-auto rounded-[28px] border border-white/10 bg-black/25 px-3 py-4 backdrop-blur-sm md:px-4"
          >
            {TEAMS.map((team, index) => (
              <motion.button
                key={team.name}
                type="button"
                data-team-index={index}
                onClick={() => {
                  setActiveTeamIndex(index);
                  setIsCarouselPaused(true);
                }}
                className={`group relative h-24 w-24 shrink-0 snap-center overflow-hidden rounded-2xl border bg-white shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition md:h-28 md:w-28 ${
                  activeTeamIndex === index
                    ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.35),0_14px_34px_rgba(0,0,0,0.35)]"
                    : "border-white/10"
                }`}
                whileHover={{
                  y: -6,
                  scale: 1.04,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
              >
                <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="112px" />
                <div
                  className={`absolute inset-0 bg-linear-to-t from-black/75 via-transparent to-transparent transition-opacity duration-300 ${
                    activeTeamIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
                <div
                  className={`absolute inset-x-0 bottom-0 p-2 transition-opacity duration-300 ${
                    activeTeamIndex === index ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span className="block text-center text-[9px] font-bold uppercase tracking-[0.15em] text-white leading-tight">
                    {team.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 rounded-[28px] border border-white/10 bg-black/25 p-4 backdrop-blur-sm md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative h-28 w-full overflow-hidden rounded-[24px] border border-white/10 bg-white md:h-32 md:w-32">
                <Image src={activeTeam.logo} alt={activeTeam.name} fill className="object-cover" sizes="128px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-green-400">
                  Spotlight
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">{activeTeam.name}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                  These icons can now be manually browsed, paused, and inspected instead of only
                  sliding past as a passive marquee.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── R50,000 Prize Banner — trophy LEFT, prize RIGHT ── */}
        <motion.div
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl"
          initial={{ opacity: 0, scale: 0.82, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, type: "spring", stiffness: 160, damping: 18 }}
          whileHover={{ scale: 1.015, boxShadow: "0 0 80px rgba(34,197,94,0.25)" }}
        >
          {/* Animated rainbow border */}
          <motion.div
            className="absolute inset-0 rounded-3xl"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777, #ea580c, #ca8a04, #16a34a, #7c3aed)" }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0.5 rounded-[22px] bg-gray-950" />

          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/6 to-transparent pointer-events-none rounded-3xl"
            animate={{ x: ["-120%", "220%"] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          />

          <div className="relative z-10 py-8 px-6 md:px-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 overflow-x-hidden">

            {/* ── TROPHY (LEFT) — heavy infinite animations ── */}
            <div className="flex flex-col items-center shrink-0 select-none w-full md:w-auto">
              {/* Outer glow ring */}
              <motion.div
                className="relative"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full"
                  style={{ background: "conic-gradient(from 0deg, #fde047, #fb923c, #f472b6, #a78bfa, #4ade80, #fde047)", filter: "blur(8px)", opacity: 0.6 }}
                />
              </motion.div>

              {/* Trophy emoji — float + wobble */}
              <motion.div
                className="text-6xl md:text-8xl relative z-10 select-none"
                animate={{
                  y:      [0, -14, 0],
                  rotate: [-6, 6, -6],
                  scale:  [1, 1.08, 1],
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                🏆
              </motion.div>

              {/* Pulsing glow under trophy */}
              <motion.div
                className="w-16 h-3 rounded-full mt-1"
                style={{ background: "radial-gradient(ellipse, rgba(253,224,71,0.5) 0%, transparent 70%)" }}
                animate={{ scaleX: [0.6, 1.1, 0.6], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.p
                className="text-[8px] font-black uppercase tracking-[0.2em] text-yellow-400/70 mt-2 text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                Grand Prize
              </motion.p>
            </div>

            {/* ── Prize amount + info (CENTRE) ── */}
            <div className="flex-1 min-w-0 w-full text-center md:text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-1">
                Champions of 5s Arena World Cup
              </p>
              <motion.p
                className="font-black leading-none mb-2"
                style={{
                  fontFamily: "Impact, Arial Black, sans-serif",
                  fontSize: "clamp(2.6rem, 8vw, 4.5rem)",
                  background: "linear-gradient(90deg, #fde047, #fb923c, #f472b6, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                animate={{ opacity: [0.8, 1, 0.8], filter: ["brightness(1)", "brightness(1.25)", "brightness(1)"] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              >
                R50,000.00
              </motion.p>
              <p className="text-gray-400 text-sm font-semibold mb-4">CASH PRIZE · TO BE WON</p>

              {/* Prize breakdown pill */}
              <div className="inline-flex max-w-full flex-col sm:flex-row items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-base">🥇</span>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Winner Takes All</span>
                <span className="text-xs font-black text-yellow-400">R50,000</span>
              </div>
            </div>

            {/* ── CTAs (RIGHT) ── */}
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <Link href="/tournament">
                <motion.button
                  className="flex w-full items-center justify-center gap-2 px-5 py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-widest text-sm text-center cursor-pointer md:w-auto"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif", boxShadow: "0 0 30px rgba(34,197,94,0.4)" }}
                  whileHover={{ scale: 1.07, boxShadow: "0 0 55px rgba(34,197,94,0.65)" }}
                  whileTap={{ scale: 0.94 }}
                  animate={{ boxShadow: ["0 0 20px rgba(34,197,94,0.3)", "0 0 40px rgba(34,197,94,0.5)", "0 0 20px rgba(34,197,94,0.3)"] }}
                  transition={{ boxShadow: { duration: 2, repeat: Infinity }, default: { type: "spring", stiffness: 350, damping: 20 } }}
                >
                  <FaFutbol size={14} /> REGISTER YOUR TEAM <FaArrowRight size={11} />
                </motion.button>
              </Link>
              <Link href="/rules-of-the-game">
                <motion.button
                  className="flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white font-bold uppercase tracking-widest text-xs text-center transition-all cursor-pointer"
                  whileHover={{ scale: 1.04, borderColor: "rgba(74,222,128,0.6)", color: "#fff" }}
                  whileTap={{ scale: 0.96 }}
                >
                  Read the Rules
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
