"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  FaArrowRight,
  FaBroadcastTower,
  FaChartBar,
  FaChevronRight,
  FaClock,
  FaExternalLinkAlt,
  FaNewspaper,
  FaInfoCircle,
  FaTable,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";

function TeamBadge({ team }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="relative h-9 w-9 shrink-0 rounded-full bg-white/90 ring-1 ring-black/10">
        {team?.logo ? (
          <Image
            src={team.logo}
            alt={`${team.name} badge`}
            fill
            unoptimized
            className="object-contain p-1"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black uppercase text-white">
            {team?.shortName?.slice(0, 3) || team?.name?.slice(0, 3) || "FC"}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-zinc-950">
          {team?.name || "Team TBD"}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, minute }) {
  const state = status?.state || "scheduled";
  const tone = {
    live: "bg-rose-100 text-rose-700 border-rose-200",
    completed: "bg-zinc-100 text-zinc-700 border-zinc-200",
    postponed: "bg-amber-100 text-amber-700 border-amber-200",
    cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
    scheduled: "bg-sky-100 text-sky-700 border-sky-200",
  }[state] || "bg-sky-100 text-sky-700 border-sky-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${tone}`}
    >
      {state === "live" && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
      {state === "live" && minute ? `${minute}'` : status?.short || "NS"}
    </span>
  );
}

function MatchCard({ match, index }) {
  const hasScore =
    match?.score?.home !== null &&
    match?.score?.home !== undefined &&
    match?.score?.away !== null &&
    match?.score?.away !== undefined;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.03 }}
      className="grid gap-4 border-t border-zinc-200 px-4 py-5 sm:grid-cols-[1fr_auto] sm:px-6"
    >
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          <span>{match.weekLabel}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>{match.competitionPhase}</span>
        </div>
        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <TeamBadge team={match.home} />
            <div className="min-w-[52px] text-right text-lg font-black text-zinc-950">
              {hasScore ? match.score.home : "-"}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <TeamBadge team={match.away} />
            <div className="min-w-[52px] text-right text-lg font-black text-zinc-950">
              {hasScore ? match.score.away : "-"}
            </div>
          </div>
        </div>
      </div>
      <div className="flex min-w-[140px] flex-col items-start justify-between gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={match.status} minute={match.minute} />
          {match.provider === "isports" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-violet-700">
              <FaBroadcastTower size={9} />
              Live Data
            </span>
          )}
        </div>
        <div className="text-sm font-semibold text-zinc-900">
          {match.kickoffLabel}
        </div>
        <div className="max-w-[180px] text-xs text-zinc-500">
          {match.venue || "Premier League venue update pending"}
        </div>
      </div>
    </motion.article>
  );
}

function EmptyTabState({ icon, title, description }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-b-[32px] bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-xl font-black uppercase tracking-[0.16em] text-zinc-950">
          {title}
        </h3>
        <p className="text-sm leading-6 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function ProviderBadge({ provider, fallbackLabel = "Source pending" }) {
  const label = provider?.name || fallbackLabel;
  const status = provider?.status || "unconfigured";
  const styles = {
    ok: "bg-emerald-100 text-emerald-700 border-emerald-200",
    fallback: "bg-violet-100 text-violet-700 border-violet-200",
    degraded: "bg-amber-100 text-amber-700 border-amber-200",
    "coming-soon": "bg-sky-100 text-sky-700 border-sky-200",
    unconfigured: "bg-zinc-100 text-zinc-600 border-zinc-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${styles[status] || styles.unconfigured}`}
    >
      <FaBroadcastTower size={9} />
      {label}
    </span>
  );
}

function InlineNotice({ tone = "info", children }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <div
      className={`flex items-start gap-2 rounded-[20px] border px-4 py-3 text-sm ${styles[tone] || styles.info}`}
    >
      <FaInfoCircle className="mt-0.5 shrink-0" size={14} />
      <div>{children}</div>
    </div>
  );
}

const STANDINGS_VIEW_LABELS = {
  overall: "Overall",
  form: "Form",
  home: "Home",
  away: "Away",
  goals: "Goals",
};

const STATS_CATEGORY_LABELS = {
  goals: "Goals",
  assists: "Assists",
  yellowCards: "Yellow Cards",
  redCards: "Red Cards",
};

function PlayerAvatar({ player }) {
  if (player?.image) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-black/5">
        <Image
          src={player.image}
          alt={player.name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black uppercase text-violet-700 ring-1 ring-violet-200">
      {player?.initials || "PL"}
    </div>
  );
}

function FormDot({ result }) {
  const styles = {
    W: "bg-emerald-600 text-white",
    D: "bg-zinc-400 text-white",
    L: "bg-rose-600 text-white",
  };

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${styles[result] || "bg-zinc-300 text-zinc-900"}`}
    >
      {result}
    </span>
  );
}

function StandingsTable({ rows, onSelectTeam, loadingTeamId }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
            <th className="px-4 py-4 sm:px-6">Team</th>
            <th className="px-3 py-4 text-right">Pts</th>
            <th className="px-3 py-4 text-right">MP</th>
            <th className="px-3 py-4 text-right">W</th>
            <th className="px-3 py-4 text-right">L</th>
            <th className="px-3 py-4 text-right">D</th>
            <th className="px-3 py-4 text-right">GF</th>
            <th className="px-3 py-4 text-right">GA</th>
            <th className="px-3 py-4 text-right">GD</th>
            <th className="px-4 py-4 sm:px-6">Last 5</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.teamId}
              className="border-b border-zinc-200 transition hover:bg-violet-50/60"
            >
              <td className="px-4 py-4 sm:px-6">
                <button
                  onClick={() => onSelectTeam(row.teamId)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="w-7 text-sm font-black text-zinc-500">{row.rank}</span>
                  <div className="relative h-9 w-9 shrink-0 rounded-full bg-white">
                    <Image
                      src={row.team.logo}
                      alt={row.team.name}
                      fill
                      unoptimized
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="truncate text-sm font-semibold text-zinc-950">
                    {row.team.name}
                  </span>
                  {loadingTeamId === row.teamId && (
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">
                      Loading
                    </span>
                  )}
                </button>
              </td>
              <td className="px-3 py-4 text-right font-black text-zinc-950">{row.points}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.played}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.won}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.lost}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.draw}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.goalsFor}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.goalsAgainst}</td>
              <td className="px-3 py-4 text-right text-sm text-zinc-700">{row.goalDifference}</td>
              <td className="px-4 py-4 sm:px-6">
                <div className="flex gap-1">
                  {row.lastFive.map((item) => (
                    <FormDot key={`${row.teamId}-${item.fixtureId}`} result={item.result} />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeamAnalysisDrawer({ analysis, onClose }) {
  if (!analysis) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.aside
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-full bg-zinc-50">
                <Image
                  src={analysis.team.logo}
                  alt={analysis.team.name}
                  fill
                  unoptimized
                  className="object-contain p-2"
                />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Team analysis
                </div>
                <h3 className="text-2xl font-black text-zinc-950">{analysis.team.name}</h3>
                <p className="text-sm text-zinc-500">
                  Rank {analysis.summary.rank} · {analysis.summary.points} points
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-zinc-100 p-2 text-zinc-600 transition hover:bg-zinc-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-6 px-6 py-6">
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Streak</div>
                <div className="mt-2 text-sm font-semibold text-zinc-950">{analysis.summary.streak}</div>
              </div>
              <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Goals</div>
                <div className="mt-2 text-sm font-semibold text-zinc-950">
                  {analysis.summary.goalsFor} scored · {analysis.summary.goalsAgainst} conceded
                </div>
              </div>
              <div className="rounded-[22px] border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Last 5</div>
                <div className="mt-2 flex gap-1">
                  {analysis.lastFive.map((item) => (
                    <FormDot key={`${analysis.team.id}-${item.fixtureId}`} result={item.result} />
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-zinc-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Home split</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  <div>{analysis.home.points} pts from {analysis.home.played} matches</div>
                  <div>{analysis.home.won}W · {analysis.home.draw}D · {analysis.home.lost}L</div>
                  <div>{analysis.home.goalsFor}-{analysis.home.goalsAgainst} goals</div>
                </div>
              </div>
              <div className="rounded-[24px] border border-zinc-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Away split</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-700">
                  <div>{analysis.away.points} pts from {analysis.away.played} matches</div>
                  <div>{analysis.away.won}W · {analysis.away.draw}D · {analysis.away.lost}L</div>
                  <div>{analysis.away.goalsFor}-{analysis.away.goalsAgainst} goals</div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-zinc-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Next fixtures</div>
                <div className="mt-3 space-y-3">
                  {analysis.nextFixtures.length ? analysis.nextFixtures.map((fixture) => (
                    <div key={fixture.fixtureId} className="rounded-2xl bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                      <div className="font-semibold text-zinc-950">
                        {fixture.isHome ? "vs" : "at"} {fixture.opponent.name}
                      </div>
                      <div className="text-xs text-zinc-500">{fixture.dateLabel}</div>
                    </div>
                  )) : <div className="text-sm text-zinc-500">No upcoming fixtures in the current window.</div>}
                </div>
              </div>
              <div className="rounded-[24px] border border-zinc-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Recent results</div>
                <div className="mt-3 space-y-3">
                  {analysis.recentResults.map((fixture) => (
                    <div key={fixture.fixtureId} className="rounded-2xl bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                      <div className="font-semibold text-zinc-950">
                        {fixture.isHome ? "vs" : "at"} {fixture.opponent.name}
                      </div>
                      <div className="text-xs text-zinc-500">{fixture.dateLabel}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-zinc-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Related articles</div>
                <div className="mt-3 space-y-3">
                  {analysis.relatedArticles.length ? analysis.relatedArticles.map((article) => (
                    <a
                      key={article.url}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-violet-50"
                    >
                      {article.title}
                    </a>
                  )) : <div className="text-sm text-zinc-500">No team-specific articles were found in the current article window.</div>}
                </div>
              </div>
              <div className="rounded-[24px] border border-zinc-200 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Related videos</div>
                <div className="mt-3 space-y-3">
                  {analysis.relatedVideos.length ? analysis.relatedVideos.map((video) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-2xl bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-violet-50"
                    >
                      {video.reactor?.name || video.channelName}: {video.title}
                    </a>
                  )) : <div className="text-sm text-zinc-500">YouTube enrichment is not available right now for this team.</div>}
                </div>
              </div>
            </section>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>
  );
}

function StatsLeaderboard({ leaders }) {
  return (
    <div className="divide-y divide-zinc-200">
      {leaders.map((leader, index) => (
        <motion.article
          key={`${leader.player.id}-${leader.stat.key}`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: index * 0.03 }}
          className="grid gap-4 px-4 py-4 sm:grid-cols-[1.2fr_1fr_auto] sm:px-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-7 text-sm font-black text-zinc-500">{leader.rank}</div>
            <PlayerAvatar player={leader.player} />
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-zinc-950">
                {leader.player.name}
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                Premier League
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-zinc-50 ring-1 ring-black/5">
              {leader.team.logo ? (
                <Image
                  src={leader.team.logo}
                  alt={leader.team.name}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black uppercase text-white">
                  {leader.team.shortName || leader.team.name?.slice(0, 3) || "FC"}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-zinc-950">
                {leader.team.name}
              </div>
              <div className="text-xs text-zinc-500">{leader.minutes} minutes</div>
            </div>
          </div>

          <div className="flex items-center justify-start sm:justify-end">
            <div className="rounded-[20px] bg-violet-900 px-4 py-3 text-right text-white shadow-[0_12px_30px_rgba(76,29,149,0.18)]">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">
                {leader.stat.shortLabel}
              </div>
              <div className="text-2xl font-black">{leader.stat.value}</div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

export default function PremierLeagueFixturesHub() {
  const [meta, setMeta] = useState(null);
  const [matchesPayload, setMatchesPayload] = useState(null);
  const [newsPayload, setNewsPayload] = useState(null);
  const [standingsPayload, setStandingsPayload] = useState(null);
  const [statsPayload, setStatsPayload] = useState(null);
  const [activeTab, setActiveTab] = useState("matches");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [standingsViewOrder, setStandingsViewOrder] = useState([
    "overall",
    "form",
    "home",
    "away",
    "goals",
  ]);
  const [activeStandingsView, setActiveStandingsView] = useState("overall");
  const [activeStatsCategory, setActiveStatsCategory] = useState("goals");
  const [teamAnalysis, setTeamAnalysis] = useState(null);
  const [teamLoadingId, setTeamLoadingId] = useState("");
  const [error, setError] = useState("");
  const [newsError, setNewsError] = useState("");
  const [standingsError, setStandingsError] = useState("");
  const [statsError, setStatsError] = useState("");
  const [teamError, setTeamError] = useState("");

  const formatRelativeTime = (value) => {
    if (!value) {
      return "";
    }

    const publishedAt = new Date(value).getTime();
    const diffMs = Date.now() - publishedAt;
    const diffMinutes = Math.max(Math.round(diffMs / (60 * 1000)), 1);

    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours}h`;
    }

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d`;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      try {
        const response = await fetch("/api/football/league/premier-league/meta", {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load league meta");
        }

        if (!cancelled) {
          setMeta(payload);
          setSeason(String(payload.selectedSeason));
        }
      } catch (metaError) {
        if (!cancelled) {
          setError(metaError.message);
          setLoading(false);
        }
      }
    }

    loadMeta();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const savedOrder = window.localStorage.getItem("pl-standings-view-order");
    if (!savedOrder) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(savedOrder);
      if (!Array.isArray(parsed) || parsed.length !== 5) {
        return undefined;
      }

      const frameId = window.requestAnimationFrame(() => {
        setStandingsViewOrder(parsed);
      });

      return () => window.cancelAnimationFrame(frameId);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!season) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setTeamAnalysis(null);
    setTeamError("");

    async function loadMatches() {
      try {
        const response = await fetch(
          `/api/football/league/premier-league/matches?season=${season}`,
          {
            cache: "no-store",
          },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load matches");
        }

        if (!cancelled) {
          setMatchesPayload(payload);
          setError("");
          setLoading(false);
        }
      } catch (matchesError) {
        if (!cancelled) {
          setError(matchesError.message || "Failed to load matches.");
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      cancelled = true;
    };
  }, [season]);

  useEffect(() => {
    if (activeTab !== "news" || !season || newsPayload?.season?.year === Number(season)) {
      return;
    }

    let cancelled = false;
    setNewsLoading(true);
    setNewsError("");

    async function loadNews() {
      try {
        const response = await fetch(
          `/api/football/league/premier-league/news?season=${season}`,
          {
            cache: "no-store",
          },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load news");
        }

        if (!cancelled) {
          setNewsPayload(payload);
          setNewsError("");
          setNewsLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setNewsPayload((current) =>
            current?.season?.year === Number(season)
              ? current
              : {
                  season: matchesPayload?.season,
                  provider: {
                    articles: "rss-og-enrichment",
                    videos: "youtube-unavailable",
                    status: "degraded",
                    name: "Feed fallback",
                  },
                  articles: [],
                  videos: [],
                },
          );
          setNewsError(loadError.message || "News feed is temporarily unavailable.");
          setNewsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [activeTab, season, newsPayload?.season?.year, matchesPayload?.season]);

  useEffect(() => {
    if (!season || activeTab !== "standings") {
      return;
    }

    let cancelled = false;
    setStandingsLoading(true);
    setStandingsError("");

    async function loadStandings() {
      try {
        const response = await fetch(
          `/api/football/league/premier-league/standings?season=${season}&view=${activeStandingsView}`,
          {
            cache: "no-store",
          },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load standings");
        }

        if (!cancelled) {
          setStandingsPayload(payload);
          setStandingsError("");
          setStandingsLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setStandingsPayload((current) =>
            current?.season?.year === Number(season) &&
            current?.view === activeStandingsView
              ? current
              : {
                  season: matchesPayload?.season,
                  view: activeStandingsView,
                  rows: [],
                  provider: { name: "standings-unavailable", status: "degraded" },
                  emptyState: "Standings are temporarily unavailable.",
                },
          );
          setStandingsError(loadError.message || "Standings are temporarily unavailable.");
          setStandingsLoading(false);
        }
      }
    }

    loadStandings();

    return () => {
      cancelled = true;
    };
  }, [activeTab, season, activeStandingsView, matchesPayload?.season]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      "pl-standings-view-order",
      JSON.stringify(standingsViewOrder),
    );
  }, [standingsViewOrder]);

  useEffect(() => {
    if (
      activeTab !== "stats" ||
      !season ||
      (statsPayload?.season?.year === Number(season) &&
        statsPayload?.category === activeStatsCategory)
    ) {
      return;
    }

    let cancelled = false;
    setStatsLoading(true);
    setStatsError("");

    async function loadStats() {
      try {
        const response = await fetch(
          `/api/football/league/premier-league/stats?season=${season}&category=${activeStatsCategory}`,
          {
            cache: "no-store",
          },
        );
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load stats");
        }

        if (!cancelled) {
          setStatsPayload(payload);
          setStatsError("");
          setStatsLoading(false);
        }
      } catch (loadError) {
        if (!cancelled) {
          setStatsPayload((current) =>
            current?.season?.year === Number(season) &&
            current?.category === activeStatsCategory
              ? current
              : {
                  season: matchesPayload?.season,
                  category: activeStatsCategory,
                  leaders: [],
                  provider: { name: "stats-unavailable", status: "degraded" },
                  emptyState: "Stats are temporarily unavailable.",
                },
          );
          setStatsError(loadError.message || "Stats are temporarily unavailable.");
          setStatsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [activeTab, season, activeStatsCategory, statsPayload?.season?.year, statsPayload?.category, matchesPayload?.season]);

  async function handleSelectTeam(teamId) {
    setTeamLoadingId(teamId);
    setTeamError("");

    try {
      const response = await fetch(
        `/api/football/league/premier-league/team/${teamId}?season=${season}`,
        {
          cache: "no-store",
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load team analysis");
      }

      setTeamAnalysis(payload);
    } catch (loadError) {
      setTeamAnalysis(null);
      setTeamError(loadError.message || "Team analysis is temporarily unavailable.");
    } finally {
      setTeamLoadingId("");
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f3ff_0%,#f8f5ef_42%,#f5f5f5_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-violet-200/70 bg-white shadow-[0_24px_80px_rgba(51,14,82,0.08)]">
          <div className="relative overflow-hidden bg-[linear-gradient(120deg,#4b024e_0%,#5b2363_45%,#d4c4d7_100%)] px-6 py-8 text-white sm:px-8">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.15)_45%,rgba(255,255,255,0.35)_100%)]" />
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-2xl bg-white/95 p-2 shadow-lg">
                  <Image
                    src={meta?.league?.logo || "https://resources.premierleague.com/premierleague/badges/70/t43.png"}
                    alt="Premier League"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white">
                    Premier League
                  </h1>
                  <p className="mt-1 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold">
                    {matchesPayload?.season?.label || meta?.league?.seasonLabel || "2025-26 Season"}
                  </p>
                </div>
              </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/85">
                    {meta?.provider?.name || "Provider pending"}
                  </div>
                <Link
                  href={meta?.arenaLink?.href || "/fixtures"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-violet-900 transition hover:bg-violet-50"
                >
                  {meta?.arenaLink?.label || "Main Fixtures Board"}
                  <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-200 bg-white px-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 py-4">
              <nav className="flex flex-wrap gap-1">
                {(meta?.tabs || []).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-5 py-3 text-sm font-black uppercase tracking-[0.18em] ${
                      activeTab === tab.key
                        ? "text-zinc-950"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.key && (
                      <motion.span
                        layoutId="fixtures-tab"
                        className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-violet-800"
                      />
                    )}
                  </button>
                ))}
              </nav>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  Season
                </label>
                <div className="flex flex-wrap gap-2">
                  {(meta?.seasonOptions || []).map((option) => (
                    <button
                      key={option.year}
                      onClick={() => setSeason(String(option.year))}
                      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                        String(option.year) === season
                          ? "bg-violet-900 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "matches" ? (
              <motion.div
                key="matches"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#faf7f2]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 px-4 py-5 sm:px-8">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                      Match Window
                    </p>
                    <h2 className="text-2xl font-black text-zinc-950">
                      Live schedule and results
                    </h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <FaClock size={12} />
                    <ProviderBadge provider={matchesPayload?.provider} fallbackLabel="Match data" />
                    <span>
                      {matchesPayload?.provider?.status === "ok"
                        ? "Current season schedule with live iSports overlays"
                        : matchesPayload?.provider?.status === "fallback"
                          ? "Current season schedule powered by FPL while iSports live coverage is unavailable"
                          : "Provider window not published yet"}
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div className="grid gap-4 px-4 py-8 sm:px-8 lg:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-40 animate-pulse rounded-[28px] border border-zinc-200 bg-white"
                      />
                    ))}
                  </div>
                ) : error ? (
                  <div className="px-6 py-8">
                    <InlineNotice tone="error">{error}</InlineNotice>
                  </div>
                ) : matchesPayload?.groups?.length ? (
                  <div className="space-y-6 px-4 py-6 sm:px-8">
                    {matchesPayload.groups.map((group) => (
                      <section
                        key={group.dateKey}
                        className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white"
                      >
                        <div className="border-b border-zinc-200 px-4 py-4 text-2xl font-black text-zinc-950 sm:px-6">
                          {group.dateLabel}
                        </div>
                        <div className="grid divide-y divide-zinc-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                          {group.matches.map((match, index) => (
                            <MatchCard key={match.id} match={match} index={index} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <EmptyTabState
                    icon={<FaTrophy size={20} />}
                    title="Schedule window not published yet"
                    description={
                      matchesPayload?.emptyState ||
                      "The next Premier League slate has not been published yet for this season selection."
                    }
                  />
                )}
              </motion.div>
            ) : activeTab === "news" ? (
              <motion.div key="news" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid gap-6 bg-[#faf7f2] px-4 py-6 sm:px-8 lg:grid-cols-[1.35fr_0.85fr]">
                  <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-200 px-6 py-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Editorial feed
                      </p>
                      <h2 className="mt-2 text-2xl font-black text-zinc-950">
                        Live Premier League headlines
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <ProviderBadge provider={newsPayload?.provider} fallbackLabel="Editorial feed" />
                      </div>
                    </div>

                    {newsError && (
                      <div className="px-6 pt-6">
                        <InlineNotice tone="warning">{newsError}</InlineNotice>
                      </div>
                    )}

                    {newsLoading ? (
                      <div className="space-y-4 px-6 py-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-36 animate-pulse rounded-[24px] border border-zinc-200 bg-zinc-50"
                          />
                        ))}
                      </div>
                    ) : newsPayload?.articles?.length ? (
                      <div className="divide-y divide-zinc-200">
                        {newsPayload.articles.map((article) => (
                          <a
                            key={article.url}
                            href={article.url}
                            target="_blank"
                            rel="noreferrer"
                            className="grid gap-4 px-5 py-5 transition hover:bg-zinc-50 sm:grid-cols-[1fr_260px]"
                          >
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                                <span className="font-black text-zinc-700">{article.source}</span>
                                <span>&middot;</span>
                                <span>{formatRelativeTime(article.publishedAt)}</span>
                              </div>
                              <h3 className="text-2xl font-semibold leading-tight text-zinc-950">
                                {article.title}
                              </h3>
                              <p className="text-sm leading-6 text-zinc-600">
                                {article.summary}
                              </p>
                            </div>
                            <div
                              className="min-h-[180px] rounded-[22px] border border-zinc-200 bg-zinc-100 bg-cover bg-center"
                              style={{
                                backgroundImage: article.image
                                  ? `linear-gradient(rgba(0,0,0,0.04), rgba(0,0,0,0.12)), url("${article.image}")`
                                  : "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <EmptyTabState
                        icon={<FaNewspaper size={20} />}
                        title="No live articles available"
                        description="The article feed is temporarily empty. The route is wired and will populate as soon as the feed sources respond."
                      />
                    )}
                  </section>

                  <section className="space-y-5">
                    <div className="rounded-[28px] border border-zinc-200 bg-white">
                      <div className="border-b border-zinc-200 px-6 py-5">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                          Reactor channels
                        </p>
                        <h3 className="mt-2 text-xl font-black text-zinc-950">
                          YouTube watchlist
                        </h3>
                      </div>

                      {newsLoading ? (
                        <div className="space-y-4 px-6 py-6">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={index}
                              className="h-28 animate-pulse rounded-[22px] border border-zinc-200 bg-zinc-50"
                            />
                          ))}
                        </div>
                      ) : newsPayload?.videos?.length ? (
                        <div className="space-y-4 px-6 py-6">
                          {newsPayload.videos.map((video) => (
                            <a
                              key={video.id}
                              href={video.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex gap-4 rounded-[22px] border border-zinc-200 p-3 transition hover:border-violet-300 hover:bg-violet-50/40"
                            >
                              <div
                                className="h-24 w-36 shrink-0 rounded-[18px] bg-zinc-100 bg-cover bg-center"
                                style={{
                                  backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)), url("${video.thumbnail}")`,
                                }}
                              />
                              <div className="min-w-0">
                                <div className="truncate text-xs font-bold uppercase tracking-[0.14em] text-violet-700">
                                  {video.reactor?.name || video.channelName}
                                </div>
                                <div className="mt-2 line-clamp-3 text-sm font-semibold leading-5 text-zinc-950">
                                  {video.title}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <div className="px-6 py-6 text-sm leading-6 text-zinc-500">
                          The curated reactor rail is wired but the YouTube provider is unavailable right now. Add `YOUTUBE_RAPIDAPI_KEY` and `YOUTUBE_RAPIDAPI_HOST` to populate it automatically.
                        </div>
                      )}
                    </div>

                    <div className="rounded-[28px] border border-zinc-200 bg-zinc-950 p-6 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                        Provider mix
                      </p>
                      <p className="mt-3 text-sm leading-6 text-zinc-300">
                        Articles are aggregated from football RSS feeds and enriched with OG metadata. Videos are layered in from the curated reactor registry using the RapidAPI YouTube adapter when configured.
                      </p>
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : activeTab === "standings" ? (
              <motion.div key="standings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid gap-6 bg-[#faf7f2] px-4 py-6 sm:px-8">
                  <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-200 px-6 py-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Standings views
                      </p>
                      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <h2 className="text-2xl font-black text-zinc-950">
                          Rearrangeable league table
                        </h2>
                        <p className="text-sm text-zinc-500">
                          Drag the inner pills to reorder them, then click any team for analysis.
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <ProviderBadge provider={standingsPayload?.provider} fallbackLabel="League table" />
                      </div>
                    </div>

                    <div className="border-b border-zinc-200 px-4 py-4 sm:px-6">
                      <Reorder.Group
                        axis="x"
                        values={standingsViewOrder}
                        onReorder={setStandingsViewOrder}
                        className="flex flex-wrap gap-3"
                      >
                        {standingsViewOrder.map((viewKey) => (
                          <Reorder.Item
                            key={viewKey}
                            value={viewKey}
                            className={`list-none rounded-full border px-4 py-2 text-sm font-bold cursor-grab ${
                              activeStandingsView === viewKey
                                ? "border-violet-900 bg-violet-900 text-white"
                                : "border-zinc-200 bg-zinc-50 text-zinc-600"
                            }`}
                            onClick={() => setActiveStandingsView(viewKey)}
                          >
                            {STANDINGS_VIEW_LABELS[viewKey]}
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    </div>

                    {standingsError && (
                      <div className="px-6 pt-6">
                        <InlineNotice tone="warning">{standingsError}</InlineNotice>
                      </div>
                    )}

                    {standingsLoading ? (
                      <div className="space-y-3 px-6 py-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-14 animate-pulse rounded-[20px] bg-zinc-100"
                          />
                        ))}
                      </div>
                    ) : standingsPayload?.rows?.length ? (
                      <StandingsTable
                        rows={standingsPayload.rows}
                        onSelectTeam={handleSelectTeam}
                        loadingTeamId={teamLoadingId}
                      />
                    ) : (
                      <EmptyTabState
                        icon={<FaTable size={20} />}
                        title="Standings unavailable"
                        description={
                          standingsPayload?.emptyState ||
                          "The standings engine is not returning data for this season selection yet."
                        }
                      />
                    )}
                  </section>
                </div>
              </motion.div>
            ) : (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid gap-6 bg-[#faf7f2] px-4 py-6 sm:px-8">
                  <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white">
                    <div className="border-b border-zinc-200 px-6 py-5">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Player leaders
                      </p>
                      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <h2 className="text-2xl font-black text-zinc-950">
                          Premier League stat race
                        </h2>
                        <p className="text-sm text-zinc-500">
                          Swipe across categories on mobile to move between the live leaderboards.
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <ProviderBadge provider={statsPayload?.provider} fallbackLabel="Player leaders" />
                      </div>
                    </div>

                    <div className="border-b border-zinc-200 px-4 py-4 sm:px-6">
                      <div className="flex gap-3 overflow-x-auto pb-1">
                        {Object.entries(STATS_CATEGORY_LABELS).map(([categoryKey, label]) => (
                          <button
                            key={categoryKey}
                            onClick={() => setActiveStatsCategory(categoryKey)}
                            className={`shrink-0 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                              activeStatsCategory === categoryKey
                                ? "border-transparent bg-[#1976d2] text-white shadow-[0_10px_25px_rgba(25,118,210,0.22)]"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {statsError && (
                      <div className="px-6 pt-6">
                        <InlineNotice tone="warning">{statsError}</InlineNotice>
                      </div>
                    )}

                    {statsLoading ? (
                      <div className="space-y-4 px-6 py-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-20 animate-pulse rounded-[22px] bg-zinc-100"
                          />
                        ))}
                      </div>
                    ) : statsPayload?.leaders?.length ? (
                      <StatsLeaderboard leaders={statsPayload.leaders} />
                    ) : (
                      <EmptyTabState
                        icon={<FaChartBar size={20} />}
                        title="Stats unavailable"
                        description={
                          statsPayload?.emptyState ||
                          "The player leaderboard is not available for this season selection yet."
                        }
                      />
                    )}
                  </section>

                  <section className="rounded-[28px] border border-zinc-200 bg-zinc-950 p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Provider mix
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-300">
                      Player leaders are currently sourced from the FPL player dataset while the iSports stat mapping is being finalized. The UI is already wired for the four public categories in the rollout plan.
                    </p>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
              Phase 1 check
            </p>
            <h3 className="mt-2 text-2xl font-black text-zinc-950">
              Dedicated Premier League route kept launch-safe
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              The main fixtures route now leads with the broader multi-league board, while this page stays available as a dedicated Premier League hub with the same schedule, standings, stats, and provider-aware fallbacks.
            </p>
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-zinc-950 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Shortcut
            </p>
            <Link
              href="/fixtures"
              className="mt-3 flex items-center justify-between gap-4 rounded-[22px] bg-white/10 px-4 py-4 transition hover:bg-white/15"
            >
              <div>
                <div className="text-lg font-black">Open Main Fixtures Board</div>
                <div className="text-sm text-zinc-300">
                  Jump back to the live top-25 league board and local arena fixtures.
                </div>
              </div>
              <FaChevronRight className="shrink-0 text-zinc-300" />
            </Link>
            <a
              href="https://fantasy.premierleague.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 hover:text-white"
            >
              Current fallback provider reference
              <FaExternalLinkAlt size={12} />
            </a>
          </div>
        </section>
      </div>
      {teamError && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="pointer-events-auto w-full max-w-xl">
            <InlineNotice tone="error">{teamError}</InlineNotice>
          </div>
        </div>
      )}
      <TeamAnalysisDrawer analysis={teamAnalysis} onClose={() => setTeamAnalysis(null)} />
    </div>
  );
}
