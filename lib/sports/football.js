import {
  fetchISportsEvents,
  fetchISportsLiveScores,
} from "@/lib/sports/isports";
import { resolveISportsLeagueFixtures } from "@/lib/sports/fixturesProvider";

const PREMIER_LEAGUE_SLUG = "premier-league";

const LEAGUE_MAP = {
  /* ─── Big 5 European Leagues ─── */
  "premier-league":          { id: "1639",  name: "Premier League",           country: "England",      logo: "https://media.api-sports.io/football/leagues/39.png" },
  "la-liga":                 { id: "1134",  name: "La Liga",                  country: "Spain",        logo: "https://media.api-sports.io/football/leagues/140.png" },
  "serie-a":                 { id: "1437",  name: "Serie A",                  country: "Italy",        logo: "https://media.api-sports.io/football/leagues/135.png" },
  "bundesliga":              { id: "188",   name: "Bundesliga",               country: "Germany",      logo: "https://media.api-sports.io/football/leagues/78.png" },
  "ligue-1":                 { id: "1112",  name: "Ligue 1",                  country: "France",       logo: "https://media.api-sports.io/football/leagues/61.png" },

  /* ─── UEFA Club Competitions ─── */
  "uefa-champions-league":   { id: "13014", name: "Champions League",         country: "Europe",       logo: "https://media.api-sports.io/football/leagues/2.png" },
  "uefa-europa-league":      { id: "13115", name: "Europa League",            country: "Europe",       logo: "https://media.api-sports.io/football/leagues/3.png" },
  "uefa-conference-league":  { id: "14216", name: "UEFA Conference League",   country: "Europe",       logo: "https://media.api-sports.io/football/leagues/848.png" },

  /* ─── Other European Leagues ─── */
  "eredivisie":              { id: "1617",  name: "Eredivisie",               country: "Netherlands",  logo: "https://media.api-sports.io/football/leagues/88.png" },
  "primeira-liga":           { id: "1325",  name: "Primeira Liga",            country: "Portugal",     logo: "https://media.api-sports.io/football/leagues/94.png" },
  "belgian-pro-league":      { id: "155",   name: "Belgian Pro League",       country: "Belgium",      logo: "https://media.api-sports.io/football/leagues/144.png" },
  "scottish-premiership":    { id: "1921",  name: "Scottish Premiership",     country: "Scotland",     logo: "https://media.api-sports.io/football/leagues/179.png" },
  "turkish-super-lig":       { id: "1033",  name: "Turkish Super Lig",        country: "Turkey",       logo: "https://media.api-sports.io/football/leagues/203.png" },

  /* ─── Americas ─── */
  "major-league-soccer": { id: "1123", name: "Major League Soccer", country: "United States", logo: "https://media.api-sports.io/football/leagues/253.png" },
  "brasileirao": { id: "144", name: "Brasileirao Serie A", country: "Brazil", logo: "https://media.api-sports.io/football/leagues/71.png" },
  "argentine-primera": { id: "122", name: "Argentine Primera", country: "Argentina", logo: "https://media.api-sports.io/football/leagues/128.png" },
  "liga-mx": { id: "10415", name: "Liga MX", country: "Mexico", logo: "https://media.api-sports.io/football/leagues/262.png" },

  /* ─── Africa ─── */
  "psl": { id: "18031", name: "PSL (South Africa)", country: "South Africa", logo: "https://media.api-sports.io/football/leagues/288.png" },
  "egyptian-premier-league": { id: "13036", name: "Egyptian Premier League", country: "Egypt", logo: "https://media.api-sports.io/football/leagues/233.png" },
  "caf-champions-league": { id: "19324", name: "CAF Champions League", country: "Africa", logo: "https://media.api-sports.io/football/leagues/12.png" },
  "caf-confederation-cup": { id: "12620", name: "CAF Confederation Cup", country: "Africa", logo: "https://media.api-sports.io/football/leagues/13.png" },

  /* ─── Asia & Middle East ─── */
  "saudi-pro-league": { id: "12923", name: "Saudi Pro League", country: "Saudi Arabia", logo: "https://media.api-sports.io/football/leagues/307.png" },
  "j1-league": { id: "1527", name: "J1 League", country: "Japan", logo: "https://media.api-sports.io/football/leagues/98.png" },
  "k-league-1": { id: "1516", name: "K League 1", country: "South Korea", logo: "https://media.api-sports.io/football/leagues/292.png" },
  "afc-champions-league-elite": { id: "12912", name: "AFC Champions League Elite", country: "Asia", logo: "https://media.api-sports.io/football/leagues/17.png" },

  /* ─── International ─── */
  "fifa-world-cup": { id: "1572", name: "FIFA World Cup", country: "International", logo: "https://media.api-sports.io/football/leagues/1.png" },
  "uefa-nations-league": { id: "10197", name: "UEFA Nations League", country: "Europe", logo: "https://media.api-sports.io/football/leagues/5.png" },
};

function getDateLabel(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getKickoffLabel(dateString) {
  if (!dateString) return "TBD";
  return new Intl.DateTimeFormat("en-ZA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

function createMatchesGroups(matches) {
  const groups = new Map();
  for (const match of matches) {
    const dateKey = match.kickoffTime
      ? new Date(match.kickoffTime).toISOString().slice(0, 10)
      : `unscheduled-${match.id}`;
    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        dateKey,
        dateLabel: match.kickoffTime ? getDateLabel(match.kickoffTime) : "Schedule TBC",
        matches: [],
      });
    }
    groups.get(dateKey).matches.push(match);
  }
  return [...groups.values()].sort((left, right) => left.dateKey.localeCompare(right.dateKey));
}

export async function getLeagueMeta(slug) {
  if (slug === PREMIER_LEAGUE_SLUG) {
    const { getPremierLeagueMeta } = await import("@/lib/sports/premierLeague");
    return getPremierLeagueMeta();
  }

  const league = LEAGUE_MAP[slug];
  if (!league) throw new Error("League not supported");

  return {
    league: {
      slug,
      name: league.name,
      logo: league.logo,
    },
    tabs: [
      { key: "matches", label: "Matches" },
      { key: "news", label: "News" },
      { key: "standings", label: "Standings" },
      { key: "stats", label: "Stats" },
    ],
    provider: { status: "ok", name: "iSports" },
  };
}

export async function getLeagueMatches(slug, seasonYear) {
  if (slug === PREMIER_LEAGUE_SLUG) {
    const [
      { getPremierLeagueMatches },
      { normalizePremierLeagueSeason },
    ] = await Promise.all([
      import("@/lib/sports/premierLeague"),
      import("@/lib/sports/premierLeagueConfig"),
    ]);
    const { seasonYear: normalizedSeasonYear } =
      normalizePremierLeagueSeason(seasonYear);

    return getPremierLeagueMatches(normalizedSeasonYear);
  }

  const league = LEAGUE_MAP[slug];
  if (!league) throw new Error("League not supported");

  const leagueId = league.id;
  const fixtureResult = await resolveISportsLeagueFixtures({
    leagueId,
    seasonYear,
  });
  const filtered = fixtureResult.matches;

  const enriched = await Promise.all(
    filtered.slice(0, 20).map(async (match) => {
      let events = match.events || [];
      // Only fetch live event timelines if the match is currently in-progress
      if (events.length === 0 && match.status?.isLive) {
        try {
          const eventRows = await fetchISportsEvents({ matchId: match.id });
          events = eventRows.find((row) => row.matchId === match.id)?.events || [];
        } catch {
          events = [];
        }
      }

      return {
        id: match.id,
        kickoffTime: match.date,
        dateLabel: match.date ? getDateLabel(match.date) : "Schedule TBC",
        kickoffLabel: getKickoffLabel(match.date),
        weekLabel: match.round ? `Week ${match.round}` : league.name,
        competitionPhase: match.group || league.name,
        status: match.status,
        home: match.home,
        away: match.away,
        score: match.goals,
        venue: match.venue,
        minute: match.status.elapsed,
        isLive: match.status.isLive,
        events,
        provider: fixtureResult.source === "schedule" ? "isports-schedule" : "isports",
      };
    }),
  );

  const providerName =
    fixtureResult.provider === "none" ? "iSports" : fixtureResult.provider;
  const emptyState =
    enriched.length === 0
      ? `No ${league.name} fixtures are available for this window.`
      : fixtureResult.source === "schedule"
        ? `Showing the nearest ${league.name} schedule while live scores are quiet.`
        : "";

  return {
    season: { year: seasonYear, label: String(seasonYear) },
    provider: { status: fixtureResult.status, name: providerName },
    groups: createMatchesGroups(enriched),
    matches: enriched,
    emptyState,
  };
}

export async function getLeagueNews(slug, seasonLabel) {
  if (slug === PREMIER_LEAGUE_SLUG) {
    // Do not load full fixture lists here — that path can exceed serverless
    // limits (504) while the news feed only needs the normalized season label.
    const [{ normalizePremierLeagueSeason }, { getFootballNewsFeed }] =
      await Promise.all([
        import("@/lib/sports/premierLeagueConfig"),
        import("@/lib/media/news"),
      ]);
    const { seasonYear, selectedSeason } =
      normalizePremierLeagueSeason(seasonLabel);
    const newsFeed = await getFootballNewsFeed({
      seasonLabel: selectedSeason.label,
    });

    return {
      season: { year: seasonYear, label: selectedSeason.label },
      provider: newsFeed.providers,
      articles: newsFeed.articles,
      videos: newsFeed.videos,
    };
  }

  const league = LEAGUE_MAP[slug];
  if (!league) throw new Error("League not supported");

  // We reuse the existing news feed logic but can customize the topics later
  const { getFootballNewsFeed } = await import("@/lib/media/news");
  const newsFeed = await getFootballNewsFeed({
    seasonLabel: seasonLabel || new Date().getFullYear(),
    leagueQuery: league.name,
  });

  return {
    season: { label: seasonLabel },
    provider: newsFeed.providers,
    articles: newsFeed.articles,
    videos: newsFeed.videos,
  };
}

function safeKickoffLabel(dateValue) {
  if (!dateValue) return "TBC";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "TBC";
  try {
    return new Intl.DateTimeFormat("en-ZA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "TBC";
  }
}

export async function getFeaturedMatches() {
  let scheduleMatches = [];
  try {
    scheduleMatches = await fetchISportsLiveScores();
  } catch (err) {
    console.warn("[getFeaturedMatches] live scores unavailable:", err?.message || err);
    return [];
  }

  // Big 5 + PSL + Champions League + FIFA World Cup feed (1572) for tournament season visibility
  const featuredIds = ["1639", "1134", "1437", "188", "1112", "18031", "13014", "1572"];

  const filtered = scheduleMatches.filter((m) =>
    featuredIds.includes(String(m.league.id)),
  );

  const sorted = [...filtered].sort((a, b) => {
    if (a.status.isLive && !b.status.isLive) return -1;
    if (!a.status.isLive && b.status.isLive) return 1;
    return 0;
  });

  return sorted.slice(0, 15).map((match) => {
    const leagueEntry = Object.entries(LEAGUE_MAP).find(
      ([, meta]) => String(meta.id) === String(match.league?.id),
    );
    const leagueSlug = leagueEntry?.[0] || null;
    const leagueMeta = leagueSlug ? LEAGUE_MAP[leagueSlug] : null;
    const leagueLogo = match.league?.logo || leagueMeta?.logo || null;

    return {
      id: match.id,
      league: {
        ...match.league,
        slug: leagueSlug || PREMIER_LEAGUE_SLUG,
        logo: leagueLogo,
        shortName: match.league?.shortName || leagueMeta?.name || match.league?.name,
      },
      home: {
        ...match.home,
        logo: match.home?.logo || leagueLogo,
      },
      away: {
        ...match.away,
        logo: match.away?.logo || leagueLogo,
      },
      score: match.goals,
      status: match.status,
      kickoff: match.date,
      kickoffLabel: safeKickoffLabel(match.date),
      isLive: match.status.isLive,
      minute: match.status.elapsed,
    };
  });
}

export async function getMatchH2H(matchId) {
  return {
    status: "unavailable",
    source: "none",
    matchId: matchId == null ? null : String(matchId),
    summary: "Head-to-head data is unavailable until a verified provider adapter is implemented.",
    winProbability: null,
    lastMeetings: [],
    insights: [],
  };
}
