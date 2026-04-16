"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaTrophy,
  FaArrowRight,
  FaBolt,
  FaStar,
  FaCalendarAlt,
  FaUsers,
  FaGlobe,
  FaFutbol,
} from "react-icons/fa";
import useSSE from "@/hooks/useSSE";

/* ── Compact PL-style standings row ── */
function StandingRow({ team, rank, animate }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
      initial={animate ? { opacity: 0, x: -20 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.06 }}
    >
      <span className="w-4 text-[10px] font-black text-gray-600 text-right">
        {rank}
      </span>
      {team.worldCupTeamLogo ? (
        <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
          <Image
            src={team.worldCupTeamLogo}
            alt={team.teamName}
            fill
            className="object-cover"
            sizes="24px"
          />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-[8px] font-black text-gray-500 shrink-0">
          {team.teamName?.[0]}
        </div>
      )}
      <span className="flex-1 text-[11px] font-bold text-white truncate">
        {team.teamName}
      </span>
      <div className="flex gap-3 text-[10px] font-black tabular-nums">
        <span className="text-gray-500 w-4 text-center">
          {team.standings?.mp ?? 0}
        </span>
        <span className="text-gray-500 w-4 text-center">
          {team.standings?.w ?? 0}
        </span>
        <span className="text-gray-500 w-4 text-center">
          {team.standings?.d ?? 0}
        </span>
        <span className="text-gray-500 w-4 text-center">
          {team.standings?.l ?? 0}
        </span>
        <span className="text-green-400 w-5 text-center">
          {team.standings?.pts ?? 0}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Live score ticker item ── */
function LiveFixture({ fixture }) {
  const isLive = fixture.status === "live";
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
      style={{
        background: isLive ? "rgba(34,197,94,0.06)" : "rgba(17,24,39,0.6)",
        borderColor: isLive ? "rgba(34,197,94,0.3)" : "rgba(55,65,81,0.5)",
      }}
      animate={
        isLive
          ? {
              boxShadow: [
                "0 0 0px rgba(34,197,94,0)",
                "0 0 20px rgba(34,197,94,0.2)",
                "0 0 0px rgba(34,197,94,0)",
              ],
            }
          : {}
      }
      transition={{ duration: 2, repeat: Infinity }}
    >
      {isLive && (
        <motion.div
          className="w-2 h-2 rounded-full bg-red-500 shrink-0"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      <span className="text-[11px] font-bold text-white truncate flex-1">
        {fixture.homeTeamName}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-lg font-black text-white tabular-nums">
          {fixture.homeScore ?? (isLive ? 0 : "–")}
        </span>
        <span className="text-gray-600 text-xs font-bold">vs</span>
        <span className="text-lg font-black text-white tabular-nums">
          {fixture.awayScore ?? (isLive ? 0 : "–")}
        </span>
      </div>
      <span className="text-[11px] font-bold text-white truncate flex-1 text-right">
        {fixture.awayTeamName}
      </span>
    </motion.div>
  );
}

/* ── Main showcase component ── */
export default function TournamentShowcase() {
  const [teams, setTeams] = useState([]);
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [tab, setTab] = useState("standings"); // 'standings' | 'fixtures'
  const [loaded, setLoaded] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetch("/api/tournament")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.teams) {
          setTeams(data.teams.slice(0, 8)); // top 8 by points
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));

    fetch("/api/fixtures/tournament?status=live&limit=4")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.fixtures?.length) setLiveFixtures(data.fixtures);
      })
      .catch(() => {});
  }, []);

  // Live updates via SSE
  useSSE("/api/sse/tournament", (data) => {
    if (data.type === "standings-update" && data.teams) {
      setTeams(data.teams.slice(0, 8));
    }
    if (data.type === "fixture-update" && data.fixture) {
      if (data.fixture.status === "live") {
        setLiveFixtures((prev) => {
          const exists = prev.find((f) => f._id === data.fixture._id);
          return exists
            ? prev.map((f) => (f._id === data.fixture._id ? data.fixture : f))
            : [data.fixture, ...prev].slice(0, 4);
        });
      }
      if (data.fixture.status === "completed") {
        setLiveFixtures((prev) =>
          prev.filter((f) => f._id !== data.fixture._id),
        );
      }
    }
  });

  const hasLive = liveFixtures.length > 0;
  const topTeams = [...teams].sort(
    (a, b) => (b.standings?.pts ?? 0) - (a.standings?.pts ?? 0),
  );

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #0f172a 0%, #020617 50%, #0f172a 100%)",
      }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(234,179,8,0.04) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 left-0 w-100 h-100 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {hasLive && (
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black tracking-widest uppercase mb-3"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Live
                Matches in Progress
              </motion.div>
            )}
            <h2
              className="font-black uppercase leading-none mb-2"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontFamily: "Impact, Arial Black, sans-serif",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #4ade80 40%, #eab308 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              World Cup 5s
            </h2>
            <p className="text-gray-500 text-sm font-semibold">
              5s Arena World Cup · 48 Teams · 8 Groups · May 2026
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {[
              { icon: FaUsers, label: "Teams", value: teams.length || "48" },
              { icon: FaGlobe, label: "Nations", value: "48" },
              { icon: FaCalendarAlt, label: "Match Days", value: "6" },
              { icon: FaTrophy, label: "Prize Pool", value: "R50K" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <Icon className="mx-auto text-green-500/60 mb-1" size={14} />
                  <div className="text-lg font-black text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Main content: standings + info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Live panel (standings or fixtures) */}
          <motion.div
            className="rounded-3xl overflow-hidden border border-gray-800/60"
            style={{
              background: "rgba(9,9,11,0.8)",
              backdropFilter: "blur(20px)",
            }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800/60">
              <div className="flex gap-1">
                {["standings", ...(hasLive ? ["fixtures"] : [])].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      tab === t
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {t === "fixtures" && hasLive ? (
                      <span className="flex items-center gap-1.5">
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-red-400"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                        Live
                      </span>
                    ) : t === "standings" ? (
                      "Standings"
                    ) : (
                      t
                    )}
                  </button>
                ))}
              </div>
              <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">
                {tab === "standings" ? "Top Teams" : "In Progress"}
              </span>
            </div>

            {/* Column headers for standings */}
            {tab === "standings" && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-900">
                <span className="w-4" />
                <span className="w-6" />
                <span className="flex-1 text-[9px] font-black text-gray-700 uppercase tracking-widest">
                  Team
                </span>
                <div className="flex gap-3 text-[9px] font-black text-gray-700 uppercase">
                  <span className="w-4 text-center">MP</span>
                  <span className="w-4 text-center">W</span>
                  <span className="w-4 text-center">D</span>
                  <span className="w-4 text-center">L</span>
                  <span className="w-5 text-center text-green-600">P</span>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-3">
              <AnimatePresence mode="wait">
                {tab === "standings" ? (
                  <motion.div
                    key="standings"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {loaded ? (
                      topTeams.length > 0 ? (
                        topTeams.map((team, i) => (
                          <StandingRow
                            key={team._id}
                            team={team}
                            rank={i + 1}
                            animate
                          />
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FaTrophy className="mx-auto text-yellow-600/30 text-4xl mb-3" />
                          <p className="text-gray-700 text-xs font-bold uppercase tracking-widest">
                            Registration Open
                          </p>
                          <p className="text-gray-800 text-[10px] mt-1">
                            Be the first to secure your nation
                          </p>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2 py-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="h-8 rounded-xl bg-gray-900/60 animate-pulse"
                            style={{ opacity: 1 - i * 0.15 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="fixtures"
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {liveFixtures.map((f) => (
                      <LiveFixture key={f._id} fixture={f} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer CTA */}
            <div className="px-5 pb-5">
              <Link href="/tournament">
                <motion.div
                  className="flex items-center justify-between px-5 py-3 rounded-2xl bg-gray-900 border border-gray-800 hover:border-green-500/30 transition-all cursor-pointer group"
                  whileHover={{ x: 4 }}
                >
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                    View Full Tournament
                  </span>
                  <FaArrowRight
                    className="text-gray-700 group-hover:text-green-500 transition-colors"
                    size={12}
                  />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Right: Registration CTA + features */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {/* Main CTA card */}
            <div
              className="relative rounded-3xl overflow-hidden border border-green-500/20 p-7 flex-1"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(234,179,8,0.05) 100%)",
              }}
            >
              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(120deg, transparent 30%, rgba(234,179,8,0.05) 50%, transparent 70%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              />

              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black tracking-widest uppercase mb-4"
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(234,179,8,0)",
                    "0 0 20px rgba(234,179,8,0.3)",
                    "0 0 0px rgba(234,179,8,0)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaStar size={9} /> Registrations Open
              </motion.div>

              <h3
                className="font-black uppercase text-white mb-2 leading-tight"
                style={{
                  fontSize: "clamp(1.4rem, 3vw, 2rem)",
                  fontFamily: "Impact, Arial Black, sans-serif",
                }}
              >
                Secure Your
                <br />
                <span className="text-green-400">Nation Now</span>
              </h3>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                48 nations. One champion. Choose your World Cup team and
                register your squad before the deadline.
              </p>

              <div className="space-y-2 mb-6">
                {[
                  {
                    icon: FaBolt,
                    color: "#22c55e",
                    text: "Tournament starts 29 May 2026",
                  },
                  {
                    icon: FaCalendarAlt,
                    color: "#3b82f6",
                    text: "Deadline: 1 week before start",
                  },
                  {
                    icon: FaTrophy,
                    color: "#eab308",
                    text: "ZAR 3,000 entry · Prize pool TBA",
                  },
                  {
                    icon: FaFutbol,
                    color: "#a855f7",
                    text: "UEFA group format · 20-min matches",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-3">
                      <Icon
                        size={12}
                        style={{ color: item.color, flexShrink: 0 }}
                      />
                      <span className="text-gray-400 text-xs">{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <Link href="/tournament">
                <motion.div
                  className="flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-sm cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #15803d, #22c55e)",
                    boxShadow: "0 0 30px rgba(34,197,94,0.4)",
                  }}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 50px rgba(34,197,94,0.6)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(34,197,94,0.3)",
                      "0 0 40px rgba(34,197,94,0.6)",
                      "0 0 20px rgba(34,197,94,0.3)",
                    ],
                  }}
                  transition={{
                    boxShadow: { duration: 2.5, repeat: Infinity },
                  }}
                >
                  <FaTrophy size={14} /> Register Your Team{" "}
                  <FaArrowRight size={11} />
                </motion.div>
              </Link>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  href: "/rules-of-the-game",
                  label: "Rules of the Game",
                  icon: FaFutbol,
                  color: "#22c55e",
                },
                {
                  href: "/fixtures",
                  label: "View Fixtures",
                  icon: FaCalendarAlt,
                  color: "#3b82f6",
                },
                {
                  href: "/leagues",
                  label: "Competitions",
                  icon: FaTrophy,
                  color: "#eab308",
                },
                {
                  href: "/tournament/manager",
                  label: "Manager Hub",
                  icon: FaUsers,
                  color: "#a855f7",
                },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className="flex items-center gap-2.5 p-4 rounded-2xl border border-gray-800 cursor-pointer group"
                      style={{ background: "rgba(9,9,11,0.6)" }}
                      whileHover={{
                        borderColor: `${link.color}40`,
                        background: `${link.color}08`,
                        y: -2,
                      }}
                      transition={{ duration: 0.15, type: "tween" }}
                    >
                      <Icon size={12} style={{ color: link.color }} />
                      <span className="text-[11px] font-bold text-gray-500 group-hover:text-white transition-colors uppercase tracking-wider leading-tight">
                        {link.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
