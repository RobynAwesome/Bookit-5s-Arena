"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowRight,
  FaBroadcastTower,
  FaChevronRight,
  FaClock,
  FaExternalLinkAlt,
  FaNewspaper,
  FaTable,
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

export default function PremierLeagueFixturesHub() {
  const [meta, setMeta] = useState(null);
  const [matchesPayload, setMatchesPayload] = useState(null);
  const [newsPayload, setNewsPayload] = useState(null);
  const [activeTab, setActiveTab] = useState("matches");
  const [season, setSeason] = useState("");
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (!season) {
      return;
    }

    let cancelled = false;
    setLoading(true);

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
          setError(matchesError.message);
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
          setNewsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNewsPayload({
            season: matchesPayload?.season,
            provider: {
              articles: "rss-og-enrichment",
              videos: "youtube-unavailable",
            },
            articles: [],
            videos: [],
          });
          setNewsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [activeTab, season, newsPayload?.season?.year, matchesPayload?.season]);

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
                  href={meta?.arenaLink?.href || "/fixtures/arena"}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-violet-900 transition hover:bg-violet-50"
                >
                  {meta?.arenaLink?.label || "Arena Fixtures"}
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
                    <span>
                      {matchesPayload?.provider?.name === "iSports"
                        ? "Live data from iSports"
                        : "FPL-backed fallback while iSports league mapping is unavailable"}
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
                  <div className="px-6 py-10 text-center text-sm text-rose-600">{error}</div>
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
                    </div>

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
                <EmptyTabState
                  icon={<FaTable size={20} />}
                  title="Standings tab queued for phase 3"
                  description="This phase will add the interactive standings table, draggable view pills, and the team analysis drawer."
                />
              </motion.div>
            ) : (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EmptyTabState
                  icon={<FaBroadcastTower size={20} />}
                  title="Stats tab queued for phase 4"
                  description="This phase will add the leaderboard categories for goals, assists, yellow cards, and red cards."
                />
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
              Premier League-first fixtures are now the default
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              The old mixed arena/world view has been preserved under a separate route, while the new shell puts Premier League schedule cards, official club badges, season switching, and provider-aware fallbacks at the front.
            </p>
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-zinc-950 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
              Shortcut
            </p>
            <Link
              href="/fixtures/arena"
              className="mt-3 flex items-center justify-between gap-4 rounded-[22px] bg-white/10 px-4 py-4 transition hover:bg-white/15"
            >
              <div>
                <div className="text-lg font-black">Open Arena Fixtures</div>
                <div className="text-sm text-zinc-300">
                  Keep using the legacy local competition board while EPL tabs roll out.
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
    </div>
  );
}
