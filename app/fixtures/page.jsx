"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaFutbol,
  FaBolt,
  FaTrophy,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaGlobeAfrica,
  FaNewspaper,
  FaPlay,
  FaExternalLinkAlt,
} from "react-icons/fa";
import AnimatedTitle from "@/components/AnimatedTitle";
import useSSE from "@/hooks/useSSE";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const STATUS_STYLE = {
  live: "bg-red-600/20 text-red-400 border-red-700/50",
  scheduled: "bg-blue-600/20 text-blue-400 border-blue-700/50",
  completed: "bg-gray-600/20 text-gray-400 border-gray-700/50",
  postponed: "bg-yellow-600/20 text-yellow-400 border-yellow-700/50",
};

const STATUS_LABEL = {
  live: "LIVE",
  scheduled: "Upcoming",
  completed: "FT",
  postponed: "PPD",
};

const ROUND_LABEL = {
  group: "Group Stage",
  league: "League",
  r16: "Round of 16",
  qf: "Quarter-Final",
  sf: "Semi-Final",
  final: "Final",
  "third-place": "3rd Place",
};

const EVENT_ICON = {
  goal: "⚽",
  "own-goal": "⚽ (OG)",
  "yellow-card": "🟨",
  "red-card": "🟥",
  substitution: "🔄",
};

/* ═══════════════════════════════════════════════════════════════
   TAB BAR
   ═══════════════════════════════════════════════════════════════ */

function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-900/80 rounded-xl p-1 border border-gray-800 w-fit">
      {tabs.map((tab) => (
        <motion.button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative px-4 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors ${
            activeTab === tab.key
              ? "text-white"
              : "text-gray-500 hover:text-gray-300"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {activeTab === tab.key && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gray-800 rounded-lg border border-gray-700"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.badge > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600/30 text-red-400 text-[8px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {tab.badge}
              </span>
            )}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FILTER BAR (Arena tab)
   ═══════════════════════════════════════════════════════════════ */

function FilterBar({ statusFilter, setStatusFilter, competitionFilter, setCompetitionFilter, groupFilter, setGroupFilter, leagues, meta }) {
  const statuses = [
    { key: "all", label: "All", count: meta.total },
    { key: "live", label: "Live", count: meta.live, pulse: true },
    { key: "scheduled", label: "Upcoming", count: meta.upcoming },
    { key: "completed", label: "Results", count: meta.completed },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Status pills */}
      {statuses.map((s) => (
        <button
          key={s.key}
          onClick={() => setStatusFilter(s.key)}
          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer flex items-center gap-1.5 ${
            statusFilter === s.key
              ? "bg-green-600/20 text-green-400 border-green-700/50"
              : "bg-gray-900 text-gray-500 border-gray-800 hover:text-gray-300"
          }`}
        >
          {s.pulse && s.count > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
          {s.label}
          {s.count > 0 && (
            <span className="text-[8px] opacity-60">({s.count})</span>
          )}
        </button>
      ))}

      {/* Competition dropdown */}
      <select
        value={competitionFilter}
        onChange={(e) => setCompetitionFilter(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-900 text-gray-400 border border-gray-800 cursor-pointer"
      >
        <option value="all">All Competitions</option>
        <option value="tournament">World Cup Tournament</option>
        {leagues.map((l) => (
          <option key={l._id} value={l._id}>
            {l.name}
          </option>
        ))}
      </select>

      {/* Group filter */}
      <select
        value={groupFilter}
        onChange={(e) => setGroupFilter(e.target.value)}
        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-900 text-gray-400 border border-gray-800 cursor-pointer"
      >
        <option value="all">All Groups</option>
        {["A", "B", "C", "D", "E", "F", "G", "H"].map((g) => (
          <option key={g} value={g}>
            Group {g}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MATCH EVENTS (expandable)
   ═══════════════════════════════════════════════════════════════ */

function MatchEvents({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="pt-3 mt-3 border-t border-gray-800 space-y-1.5">
        {events
          .sort((a, b) => (a.minute || 0) - (b.minute || 0))
          .map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[10px] text-gray-400"
            >
              <span className="w-6 text-right font-mono text-gray-600">
                {e.minute}&apos;
              </span>
              <span>{EVENT_ICON[e.type] || "•"}</span>
              <span className="font-semibold text-gray-300">
                {e.playerName}
              </span>
              {e.detail && (
                <span className="text-gray-600">({e.detail})</span>
              )}
            </div>
          ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FIXTURE CARD (Arena)
   ═══════════════════════════════════════════════════════════════ */

function FixtureCard({ fixture, index, expanded, onToggle, flash }) {
  const isLive = fixture.status === "live";
  const isCompleted = fixture.status === "completed";
  const homeTeam = fixture.homeTeam || {};
  const awayTeam = fixture.awayTeam || {};

  const teamName = (team) =>
    team.worldCupTeam
      ? team.worldCupTeam.split(" (")[0]
      : team.teamName || "TBD";

  const teamLogo = (team) =>
    team.worldCupTeamLogo || team.logo || null;

  const dateStr = fixture.scheduledAt
    ? new Date(fixture.scheduledAt).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`rounded-2xl border bg-gray-900/80 p-4 transition-all ${
        isLive
          ? "border-green-600/60 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          : flash
          ? "border-green-500/50"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      {/* Header: competition + round + status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
            {fixture.competitionType === "tournament" ? "🏆 Tournament" : "🏟️ League"}
          </span>
          {fixture.groupLetter && (
            <span className="text-[9px] font-bold text-gray-600">
              · Group {fixture.groupLetter}
            </span>
          )}
          {fixture.round && ROUND_LABEL[fixture.round] && (
            <span className="text-[9px] text-gray-600">
              · {ROUND_LABEL[fixture.round]}
            </span>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border flex items-center gap-1 ${
            STATUS_STYLE[fixture.status]
          }`}
        >
          {isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          )}
          {STATUS_LABEL[fixture.status]}
        </span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-white text-xs font-bold truncate max-w-[100px]">
              {teamName(homeTeam)}
            </span>
            {teamLogo(homeTeam) && (
              <Image
                src={teamLogo(homeTeam)}
                alt={teamName(homeTeam)}
                width={24}
                height={24}
                className="rounded-full object-cover"
                unoptimized
              />
            )}
          </div>
        </div>

        {/* Score */}
        <div className="shrink-0 mx-2 text-center min-w-[60px]">
          {isCompleted || isLive ? (
            <div
              className={`font-black text-xl ${
                isLive ? "text-green-400" : "text-white"
              }`}
              style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
            >
              {fixture.homeScore ?? 0} : {fixture.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-gray-500 text-xs font-bold">{dateStr || "vs"}</div>
          )}
          {isLive && (
            <div className="text-red-400 text-[9px] font-bold animate-pulse">
              LIVE
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            {teamLogo(awayTeam) && (
              <Image
                src={teamLogo(awayTeam)}
                alt={teamName(awayTeam)}
                width={24}
                height={24}
                className="rounded-full object-cover"
                unoptimized
              />
            )}
            <span className="text-white text-xs font-bold truncate max-w-[100px]">
              {teamName(awayTeam)}
            </span>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="text-[9px] text-gray-600 text-center mt-2">
        {fixture.venue}
        {fixture.matchday && ` · MD ${fixture.matchday}`}
      </div>

      {/* Expandable events */}
      {fixture.events && fixture.events.length > 0 && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-1 mt-2 text-[9px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
          >
            {expanded ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
            {expanded ? "Hide" : `${fixture.events.length} events`}
          </button>
          <AnimatePresence>
            {expanded && <MatchEvents events={fixture.events} />}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   GLOBAL MATCH ROW (Live Scores tab — Flashscore style)
   ═══════════════════════════════════════════════════════════════ */

function GlobalMatchRow({ match, index }) {
  const isLive = ["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(
    match.status?.short
  );
  const isFinished = ["FT", "AET", "PEN"].includes(match.status?.short);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
        isLive
          ? "bg-green-950/30 border-green-800/40"
          : "bg-gray-900/50 border-gray-800/50 hover:border-gray-700"
      }`}
    >
      {/* Status */}
      <div className="w-10 shrink-0 text-center">
        {isLive ? (
          <div className="flex flex-col items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mb-0.5" />
            <span className="text-red-400 text-[9px] font-black">
              {match.status?.elapsed}&apos;
            </span>
          </div>
        ) : isFinished ? (
          <span className="text-gray-500 text-[9px] font-black">FT</span>
        ) : (
          <span className="text-gray-600 text-[9px] font-bold">
            {match.date
              ? new Date(match.date).toLocaleTimeString("en-ZA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        )}
      </div>

      {/* Home */}
      <div className="flex-1 flex items-center gap-2 justify-end">
        <span
          className={`text-[11px] font-bold truncate max-w-[120px] ${
            match.home?.winner ? "text-white" : "text-gray-300"
          }`}
        >
          {match.home?.name}
        </span>
        {match.home?.logo && (
          <img
            src={match.home.logo}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
        )}
      </div>

      {/* Score */}
      <div
        className={`shrink-0 min-w-[40px] text-center font-black text-sm ${
          isLive ? "text-green-400" : "text-white"
        }`}
        style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
      >
        {match.goals?.home != null
          ? `${match.goals.home} : ${match.goals.away}`
          : "–"}
      </div>

      {/* Away */}
      <div className="flex-1 flex items-center gap-2">
        {match.away?.logo && (
          <img
            src={match.away.logo}
            alt=""
            className="w-5 h-5 rounded-full object-cover"
          />
        )}
        <span
          className={`text-[11px] font-bold truncate max-w-[120px] ${
            match.away?.winner ? "text-white" : "text-gray-300"
          }`}
        >
          {match.away?.name}
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STANDINGS TABLE
   ═══════════════════════════════════════════════════════════════ */

function StandingsTable({ groupLetter, teams, flash }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl border bg-gray-900/80 overflow-hidden transition-all ${
        flash ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]" : "border-gray-800"
      }`}
    >
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">
          Group {groupLetter}
        </span>
      </div>

      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-gray-600 uppercase tracking-widest border-b border-gray-800/50">
            <th className="text-left py-2 px-4 font-bold">#</th>
            <th className="text-left py-2 font-bold">Team</th>
            <th className="py-2 px-1 font-bold">MP</th>
            <th className="py-2 px-1 font-bold">W</th>
            <th className="py-2 px-1 font-bold">D</th>
            <th className="py-2 px-1 font-bold">L</th>
            <th className="py-2 px-1 font-bold">GD</th>
            <th className="py-2 px-2 font-bold text-green-500">PTS</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => (
            <tr
              key={team._id}
              className={`border-b border-gray-800/30 ${
                i < 2
                  ? "bg-green-950/20"
                  : ""
              }`}
            >
              <td className="py-2 px-4 text-gray-500 font-bold">{i + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  {(team.worldCupTeamLogo || team.logo) && (
                    <img
                      src={team.worldCupTeamLogo || team.logo}
                      alt=""
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                  <span className={`font-bold ${i < 2 ? "text-green-400" : "text-gray-300"}`}>
                    {team.worldCupTeam
                      ? team.worldCupTeam.split(" (")[0]
                      : team.teamName}
                  </span>
                </div>
              </td>
              <td className="py-2 px-1 text-center text-gray-500">{team.mp || 0}</td>
              <td className="py-2 px-1 text-center text-gray-500">{team.w || 0}</td>
              <td className="py-2 px-1 text-center text-gray-500">{team.d || 0}</td>
              <td className="py-2 px-1 text-center text-gray-500">{team.l || 0}</td>
              <td className="py-2 px-1 text-center text-gray-400 font-bold">
                {(team.gd || 0) > 0 ? `+${team.gd}` : team.gd || 0}
              </td>
              <td className="py-2 px-2 text-center text-green-400 font-black">
                {team.pts || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════════════════ */

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/80 p-4 animate-pulse">
      <div className="h-3 bg-gray-800 rounded w-1/3 mb-4" />
      <div className="flex items-center justify-between gap-2">
        <div className="h-4 bg-gray-800 rounded w-20" />
        <div className="h-6 bg-gray-800 rounded w-12" />
        <div className="h-4 bg-gray-800 rounded w-20" />
      </div>
      <div className="h-2 bg-gray-800 rounded w-2/3 mx-auto mt-3" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO EMBED (YouTube · Vimeo · Dailymotion · generic iframe)
   ═══════════════════════════════════════════════════════════════ */

function VideoEmbed({ url, title }) {
  if (!url) return null;

  let embedUrl = null;
  let platform = "other";

  // YouTube
  const ytMatch =
    url.match(/youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
  if (ytMatch) {
    embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    platform = "youtube";
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    platform = "vimeo";
  }

  // Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/video\/([A-Za-z0-9]+)/);
  if (dmMatch) {
    embedUrl = `https://www.dailymotion.com/embed/video/${dmMatch[1]}`;
    platform = "dailymotion";
  }

  if (!embedUrl) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-700 text-gray-400 text-xs hover:text-white hover:border-gray-600 transition-all"
      >
        <FaPlay size={10} className="text-green-400" />
        {title || "Watch Highlight"}
        <FaExternalLinkAlt size={8} className="ml-auto" />
      </a>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-gray-800">
      <div className="aspect-video">
        <iframe
          src={embedUrl}
          title={title || "Match Highlight"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {platform !== "youtube" && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-[8px] font-bold uppercase tracking-widest text-gray-400 border border-gray-700">
          {platform}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   NEWS ARTICLE CARD
   ═══════════════════════════════════════════════════════════════ */

function NewsCard({ article, index }) {
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime(); // eslint-disable-line react-hooks/purity
    const h = Math.floor(diff / 3_600_000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <motion.a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="block rounded-2xl border border-gray-800 bg-gray-900/80 overflow-hidden hover:border-gray-700 hover:bg-gray-900 transition-all group"
    >
      {article.img && (
        <div className="aspect-video relative bg-gray-900 overflow-hidden">
          <img
            src={article.img}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full bg-green-600/20 border border-green-700/40 text-green-400 text-[8px] font-black uppercase tracking-widest">
            {article.source}
          </span>
          <span className="text-[9px] text-gray-600">{timeAgo(article.pubDate)}</span>
        </div>
        <h3 className="text-white text-sm font-bold leading-tight mb-2 group-hover:text-green-400 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.summary && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1 text-gray-600 text-[9px] font-bold uppercase tracking-widest group-hover:text-gray-400 transition-colors">
          Read more <FaExternalLinkAlt size={7} />
        </div>
      </div>
    </motion.a>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function FixturesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState("arena");

  // Arena tab state
  const [arenaFixtures, setArenaFixtures] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [meta, setMeta] = useState({ total: 0, live: 0, upcoming: 0, completed: 0 });
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [expandedFixture, setExpandedFixture] = useState(null);
  const [flashIds, setFlashIds] = useState(new Set());

  // World scores tab state
  const [globalMatches, setGlobalMatches] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);

  // News tab state
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  // Standings tab state
  const [standings, setStandings] = useState({});
  const [flashGroup, setFlashGroup] = useState(null);

  // Shared
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);

  // ── Fetch arena fixtures ──
  const fetchArena = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (competitionFilter === "tournament") params.set("type", "tournament");
      else if (competitionFilter !== "all") {
        params.set("type", "league");
        params.set("leagueId", competitionFilter);
      }
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (groupFilter !== "all") params.set("group", groupFilter);

      const res = await fetch(`/api/fixtures?${params.toString()}`);
      const data = await res.json();
      if (data.fixtures) setArenaFixtures(data.fixtures);
      if (data.leagues) setLeagues(data.leagues);
      if (data.meta) setMeta(data.meta);
      setLastUpdated(new Date());
    } catch {
      /* network error — keep stale data */
    }
  }, [competitionFilter, statusFilter, groupFilter]);

  // ── Fetch standings ──
  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament/standings");
      const data = await res.json();
      if (data.groups) setStandings(data.groups);
    } catch {
      /* keep stale */
    }
  }, []);

  // ── Fetch global live scores (always available via TheSportsDB) ──
  const fetchGlobal = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const res = await fetch("/api/external/livescores");
      const data = await res.json();
      if (data.matches) setGlobalMatches(data.matches);
    } catch {
      /* keep stale */
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  // ── Fetch football news ──
  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch("/api/external/football-news");
      const data = await res.json();
      if (data.articles) setNewsArticles(data.articles);
    } catch {
      /* keep stale */
    } finally {
      setNewsLoading(false);
    }
  }, []);

  // ── Initial load ──
  useEffect(() => {
    Promise.all([fetchArena(), fetchStandings(), fetchGlobal(), fetchNews()]).finally(() =>
      setLoading(false)
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Refetch arena on filter change ──
  useEffect(() => {
    if (!loading) fetchArena();
  }, [competitionFilter, statusFilter, groupFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Poll global scores when World tab is active ──
  useEffect(() => {
    if (activeTab === "world") {
      pollRef.current = setInterval(fetchGlobal, 60_000);
      return () => clearInterval(pollRef.current);
    }
    return () => clearInterval(pollRef.current);
  }, [activeTab, fetchGlobal]);

  // ── SSE for tournament ──
  const handleSSE = useCallback(
    (data) => {
      if (data.type === "score-live" || data.type === "fixture-update") {
        fetchArena();
        // Flash the updated fixture
        if (data.fixtureId) {
          setFlashIds((prev) => new Set([...prev, data.fixtureId]));
          setTimeout(
            () =>
              setFlashIds((prev) => {
                const next = new Set(prev);
                next.delete(data.fixtureId);
                return next;
              }),
            3000
          );
        }
      }
      if (data.type === "standings-update") {
        fetchStandings();
        if (data.groupLetter) {
          setFlashGroup(data.groupLetter);
          setTimeout(() => setFlashGroup(null), 3000);
        }
      }
    },
    [fetchArena, fetchStandings]
  );

  const { connected } = useSSE("/api/sse/tournament", handleSSE);

  // ── Build tabs ──
  const liveWorldCount = globalMatches.filter((m) =>
    ["1H", "2H", "HT", "ET", "P", "BT", "LIVE"].includes(m.status?.short)
  ).length;

  const tabs = [
    {
      key: "arena",
      label: "Arena",
      icon: <FaFutbol size={10} className="text-green-400" />,
      badge: meta.live,
    },
    {
      key: "world",
      label: "World",
      icon: <FaGlobeAfrica size={10} className="text-red-400" />,
      badge: liveWorldCount,
    },
    {
      key: "news",
      label: "News",
      icon: <FaNewspaper size={10} className="text-cyan-400" />,
      badge: 0,
    },
    {
      key: "standings",
      label: "Standings",
      icon: <FaTrophy size={10} className="text-yellow-400" />,
      badge: 0,
    },
  ];

  // ── Group global matches by league ──
  const groupedGlobal = globalMatches.reduce((acc, m) => {
    const key = m.league?.name || "Other";
    if (!acc[key]) acc[key] = { league: m.league, matches: [] };
    acc[key].matches.push(m);
    return acc;
  }, {});

  // ── Render ──
  return (
    <section className="min-h-screen bg-gray-950 text-white py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AnimatedTitle
          text={[
            { text: "ARENA ", highlight: false },
            { text: "FIXTURES", highlight: true },
          ]}
          subtitle="Real-time from 5s Arena · World fixtures · Football news"
          icon={<FaFutbol />}
          size="lg"
        />

        {/* Connection indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500 animate-pulse" : "bg-gray-600"
            }`}
          />
          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
            {connected ? "Live connected" : "Connecting..."}
          </span>
          {lastUpdated && (
            <span className="text-[9px] text-gray-700 ml-auto">
              Updated {lastUpdated.toLocaleTimeString("en-ZA")}
            </span>
          )}
        </div>

        {/* Tab Bar */}
        <div className="mb-6">
          <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ══════════════════════ ARENA TAB ══════════════════════ */}
        {!loading && activeTab === "arena" && (
          <>
            <FilterBar
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              competitionFilter={competitionFilter}
              setCompetitionFilter={setCompetitionFilter}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              leagues={leagues}
              meta={meta}
            />

            {arenaFixtures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {arenaFixtures.map((f, i) => (
                  <FixtureCard
                    key={f._id}
                    fixture={f}
                    index={i}
                    expanded={expandedFixture === f._id}
                    onToggle={() =>
                      setExpandedFixture(
                        expandedFixture === f._id ? null : f._id
                      )
                    }
                    flash={flashIds.has(f._id)}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <FaCalendarAlt className="text-gray-800 text-5xl mx-auto mb-4" />
                <h3
                  className="text-xl font-black text-gray-600 uppercase tracking-widest mb-2"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  No Fixtures Yet
                </h3>
                <p className="text-gray-700 text-sm mb-6">
                  Fixtures will appear here once competitions begin at 5s Arena
                </p>
                <Link
                  href="/leagues"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600/20 border border-green-700/50 text-green-400 text-xs font-bold uppercase tracking-widest hover:bg-green-600/30 transition-colors"
                >
                  <FaTrophy size={12} /> View Competitions
                </Link>
              </motion.div>
            )}
          </>
        )}

        {/* ══════════════════════ WORLD TAB ══════════════════════ */}
        {!loading && activeTab === "world" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                Today&apos;s global fixtures · Updates every 60s
              </span>
              {globalLoading && (
                <span className="text-[9px] text-gray-700 animate-pulse">
                  refreshing…
                </span>
              )}
            </div>

            {globalLoading && globalMatches.length === 0 ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-gray-900/50 border border-gray-800 animate-pulse"
                  />
                ))}
              </div>
            ) : globalMatches.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedGlobal)
                  .sort(([a], [b]) => {
                    // Sort: live leagues first
                    const aLive = groupedGlobal[a]?.matches.some(m =>
                      ["1H","2H","HT","ET","P","BT","LIVE"].includes(m.status?.short));
                    const bLive = groupedGlobal[b]?.matches.some(m =>
                      ["1H","2H","HT","ET","P","BT","LIVE"].includes(m.status?.short));
                    if (aLive && !bLive) return -1;
                    if (!aLive && bLive) return 1;
                    return a.localeCompare(b);
                  })
                  .map(([leagueName, group]) => {
                    const hasLive = group.matches.some(m =>
                      ["1H","2H","HT","ET","P","BT","LIVE"].includes(m.status?.short));
                    return (
                      <div key={leagueName}>
                        {/* League header */}
                        <div className="flex items-center gap-2 mb-2 px-1">
                          {group.league?.logo && (
                            <img
                              src={group.league.logo}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          {group.league?.flag && (
                            <img
                              src={group.league.flag}
                              alt=""
                              className="w-4 h-3 rounded-sm object-cover"
                            />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                            {leagueName}
                          </span>
                          {group.league?.country && (
                            <span className="text-[9px] text-gray-600">
                              · {group.league.country}
                            </span>
                          )}
                          {hasLive && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600/20 border border-red-700/40 text-red-400 text-[8px] font-black uppercase">
                              <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                              live
                            </span>
                          )}
                        </div>

                        {/* Match rows */}
                        <div className="space-y-1.5">
                          {group.matches.map((m, i) => (
                            <GlobalMatchRow key={m.id || i} match={m} index={i} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <FaGlobeAfrica className="text-gray-800 text-5xl mx-auto mb-4" />
                <h3
                  className="text-xl font-black text-gray-600 uppercase tracking-widest mb-2"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  No Matches Today
                </h3>
                <p className="text-gray-700 text-sm">
                  No scheduled fixtures found for today. Check back later.
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* ══════════════════════ NEWS TAB ══════════════════════ */}
        {!loading && activeTab === "news" && (
          <>
            {/* Highlights section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FaPlay size={10} className="text-red-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Highlights
                </span>
                <span className="text-[9px] text-gray-600">YouTube · Vimeo · Dailymotion</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VideoEmbed
                  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  title="Latest Match Highlights"
                />
                <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 flex flex-col items-center justify-center text-center gap-3">
                  <FaPlay size={24} className="text-gray-700" />
                  <p className="text-gray-600 text-sm font-bold">More highlights coming soon</p>
                  <p className="text-gray-700 text-xs">Embed any YouTube, Vimeo, or Dailymotion link</p>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="flex items-center gap-2 mb-4">
              <FaNewspaper size={10} className="text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Latest Football News
              </span>
              {newsLoading && (
                <span className="text-[9px] text-gray-700 animate-pulse ml-auto">Loading…</span>
              )}
            </div>

            {newsLoading && newsArticles.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-800 bg-gray-900/80 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-video bg-gray-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-1/3" />
                      <div className="h-4 bg-gray-800 rounded" />
                      <div className="h-3 bg-gray-800 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : newsArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newsArticles.map((article, i) => (
                  <NewsCard key={`${article.link}-${i}`} article={article} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <FaNewspaper className="text-gray-800 text-5xl mx-auto mb-4" />
                <h3
                  className="text-xl font-black text-gray-600 uppercase tracking-widest mb-2"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  No News Available
                </h3>
                <p className="text-gray-700 text-sm">
                  Unable to fetch football headlines right now. Try again later.
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* ══════════════════════ STANDINGS TAB ══════════════════════ */}
        {!loading && activeTab === "standings" && (
          <>
            {Object.keys(standings).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(standings)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, teams]) => (
                    <StandingsTable
                      key={letter}
                      groupLetter={letter}
                      teams={teams}
                      flash={flashGroup === letter}
                    />
                  ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <FaTrophy className="text-gray-800 text-5xl mx-auto mb-4" />
                <h3
                  className="text-xl font-black text-gray-600 uppercase tracking-widest mb-2"
                  style={{ fontFamily: "Impact, Arial Black, sans-serif" }}
                >
                  No Standings Yet
                </h3>
                <p className="text-gray-700 text-sm">
                  Standings will appear once teams are confirmed and matches begin.
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
