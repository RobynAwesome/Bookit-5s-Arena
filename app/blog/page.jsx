"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLayerGroup,
  FaTrophy,
  FaTools,
  FaPlay,
  FaCalendarAlt,
  FaUser,
  FaBolt,
  FaArrowRight,
  FaVideo,
  FaNewspaper,
} from "react-icons/fa";
import Link from "next/link";

// ── Categories & Series ──
const SERIES = [
  { id: "all", name: "All Intel", icon: FaLayerGroup, color: "text-white" },
  {
    id: "tournament",
    name: "Competition News",
    icon: FaTrophy,
    color: "text-yellow-400",
  },
  {
    id: "highlights",
    name: "Match Highlights",
    icon: FaVideo,
    color: "text-red-400",
  },
  { id: "tech", name: "Platform Tech", icon: FaTools, color: "text-cyan-400" },
  { id: "venue", name: "Arena Updates", icon: FaBolt, color: "text-green-400" },
];

const POSTS = [
  {
    id: 1,
    title: "How We Built the 5s Arena Platform",
    series: "tech",
    date: "14 April 2026",
    author: "Engineering",
    excerpt:
      "A deep dive into our Next.js 15, Framer Motion, and Tailwind CSS tech stack for the ultimate football booking experience.",
    link: "/blog/how-we-built-this",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    featured: true,
  },
  {
    id: 2,
    title: "World Cup 5s: Group Stage Draw Results",
    series: "tournament",
    date: "20 May 2026",
    author: "Admin",
    excerpt:
      "The pots have been emptied and the groups are set. Check out the 8 high-stakes groups for the upcoming World Cup.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "New LED Lighting Deployment Complete",
    series: "venue",
    date: "1 March 2026",
    author: "Management",
    excerpt:
      "We’ve just upgraded all 4 courts with ultra-bright 800W LED floodlights for perfect evening condition play.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Season Kickoff Highlights: Best Goals",
    series: "highlights",
    date: "25 February 2026",
    author: "Media Team",
    excerpt:
      "Watch the most clinical finishes and acrobatic saves from the 5s Arena 2026 Season opening night.",
    link: "#",
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800",
    isVideo: true,
  },
];

// ── Background Particle ──
function HubParticle({ idx }) {
  const [w, h, left, top, dur] = useMemo(
    () => [
      2 + (idx % 4),
      2 + ((idx * 3) % 4),
      (idx * 17) % 100,
      (idx * 29) % 100,
      5 + (idx % 5),
    ],
    [idx],
  );

  return (
    <motion.div
      className="absolute bg-green-500/20 rounded-full pointer-events-none"
      style={{ width: w, height: h, left: `${left}%`, top: `${top}%` }}
      animate={{ y: [0, -40, 0], opacity: [0.1, 0.4, 0.1] }}
      transition={{ duration: dur, repeat: Infinity, delay: idx * 0.2 }}
    />
  );
}

export default function BlogIndexPage() {
  const [activeSeries, setActiveSeries] = useState("all");

  // Only show posts with real links (not '#')
  const filteredPosts =
    activeSeries === "all"
      ? POSTS.filter((p) => p.link && p.link !== "#")
      : POSTS.filter(
          (p) => p.series === activeSeries && p.link && p.link !== "#",
        );

  const featuredPost = POSTS.find((p) => p.featured) || POSTS[0];

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-green-500 selection:text-black overflow-x-hidden">
      {/* ── SEO METADATA (HIDDEN BUT PRESENT) ── */}
      <title>News & Highlights | Bookit 5s Arena</title>
      <meta
        name="description"
        content="Stay updated with 5s Arena tournament results, player highlights, and venue news. The ultimate source for Cape Town 5-a-side football intel."
      />

      {/* ── DECORATIVE BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.08)_0%,transparent_50%)]" />
        {Array.from({ length: 20 }).map((_, i) => (
          <HubParticle key={i} idx={i} />
        ))}
      </div>

      <div className="relative z-10 pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── HEADER ── */}
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-950/30 border border-green-800/40 text-green-400 text-[10px] uppercase font-black tracking-widest mb-6"
          >
            <FaNewspaper className="text-xs" /> Official Intel Feed
          </motion.div>

          <h1
            className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            NEWS & <span className="text-green-500">HIGHLIGHTS</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            The beating heart of Bookit 5s Arena. Real-time tactical analysis,
            exclusive highlights, and competition breakthroughs.
          </p>
        </header>

        {/* ── FEATURED NEWS (Hero) ── */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden border border-gray-800 bg-gray-900 group shadow-2xl"
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: `url(${featuredPost.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col items-start max-w-3xl">
              <span className="px-3 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-4">
                Featured Report
              </span>
              <h2
                className="text-3xl md:text-5xl font-black uppercase tracking-widest text-white mb-4 group-hover:text-green-400 transition-colors leading-none"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                {featuredPost.title}
              </h2>
              <p className="text-gray-300 text-sm md:text-base mb-8 line-clamp-2">
                {featuredPost.excerpt}
              </p>
              <Link
                href={featuredPost.link}
                className="group/btn flex items-center gap-3 px-8 py-3 bg-white text-black hover:bg-green-500 hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl"
              >
                Access Full Intel{" "}
                <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Glass corner stat */}
            <div className="absolute top-8 right-8 backdrop-blur-md bg-white/5 border border-white/10 p-4 rounded-2xl">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                  Released
                </span>
                <span className="text-xs font-bold text-white uppercase">
                  {featuredPost.date}
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── INTELLIGENCE CATEGORIES (Filter) ── */}
        <section className="sticky top-24 z-30 mb-12 flex justify-center py-4">
          <div className="flex flex-wrap justify-center gap-3 p-2 bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl">
            {SERIES.map((series) => {
              const Icon = series.icon;
              const isActive = activeSeries === series.id;
              return (
                <button
                  key={series.id}
                  onClick={() => setActiveSeries(series.id)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-black shadow-xl scale-105"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon
                    className={`${isActive ? "text-black" : series.color}`}
                    size={14}
                  />{" "}
                  {series.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── DYNAMIC ARTICLES GRID ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredPosts
              .filter((p) => !p.featured || activeSeries !== "all")
              .map((post) => (
                <motion.div
                  layout
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  viewport={{ once: true }}
                  className="group relative flex flex-col bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden hover:border-green-500/30 transition-all shadow-xl"
                >
                  {/* Media Section */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${post.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />

                    {/* Video Play Icon if Highlights */}
                    {post.isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white"
                        >
                          <FaPlay className="text-2xl ml-1" />
                        </motion.div>
                      </div>
                    )}

                    {/* Category Tag */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-gray-900/80 backdrop-blur-md border border-gray-700 text-[9px] font-black uppercase tracking-wider rounded-lg text-gray-300">
                        {SERIES.find((s) => s.id === post.series)?.name}
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest transition-colors group-hover:text-green-500/60">
                        <FaCalendarAlt size={10} /> {post.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-800" />
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <FaUser size={10} /> {post.author}
                      </span>
                    </div>

                    <Link href={post.link}>
                      <h3
                        className="text-xl font-black uppercase tracking-widest text-white mb-4 group-hover:text-green-500 transition-colors leading-tight min-h-[3rem]"
                        style={{ fontFamily: "Impact, sans-serif" }}
                      >
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-400 line-clamp-2 mb-8 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto">
                      <Link
                        href={post.link}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-green-400 transition-colors bg-gray-800/50 hover:bg-green-500/10 px-4 py-2 rounded-xl border border-gray-700/50 group-hover:border-green-500/20"
                      >
                        Initialize Link{" "}
                        <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-transparent via-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-md rounded-[2.2rem] pointer-events-none" />
                </motion.div>
              ))}
          </AnimatePresence>
        </section>

        {/* ── FOOTER NEWSLETTER PREVIEW ── */}
        <section className="mt-20 py-20 bg-green-950/10 border border-green-900/20 rounded-[3rem] text-center px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
          <FaBolt className="text-4xl text-green-500 mx-auto mb-8 animate-pulse" />
          <h4
            className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-4"
            style={{ fontFamily: "Impact, sans-serif" }}
          >
            NEVER MISS A <span className="text-green-500">MOMENT</span>
          </h4>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-10">
            Join 2,500+ fans receiving weekly tactical breakdowns and arena
            scouting reports directly in their inbox.
          </p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Deploy email address"
              className="flex-1 bg-gray-900/80 border border-gray-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-green-500 outline-none transition-all placeholder:text-gray-600"
            />
            <button className="px-8 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-green-900/20">
              Join Ops
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
