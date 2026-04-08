import {
  fetchISportsEvents,
  fetchISportsLeagueProfile,
  fetchISportsLiveScores,
  getPremierLeagueSeasonOptions,
} from "@/lib/sports/isports";
import { getFirstEnv } from "@/lib/config/env";
import { getFplPremierLeagueFixtures } from "@/lib/sports/fpl";

const PREMIER_LEAGUE_LOGO =
  "https://resources.premierleague.com/premierleague/badges/70/t43.png";

function getSeasonYearFromDate(referenceDate = new Date()) {
  const month = referenceDate.getMonth() + 1;
  return month >= 7 ? referenceDate.getFullYear() : referenceDate.getFullYear() - 1;
}

function getDateLabel(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-ZA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function getKickoffLabel(dateString) {
  if (!dateString) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateString));
}

const CLUB_NAME_ALIASES = {
  arsenal: "arsenal",
  astonvilla: "astonvilla",
  "astonvillafc": "astonvilla",
  bournemouth: "bournemouth",
  afcbournemouth: "bournemouth",
  brentford: "brentford",
  brighton: "brighton",
  brightonandhovealbion: "brighton",
  brightonhovealbion: "brighton",
  burnley: "burnley",
  chelsea: "chelsea",
  crystalpalace: "crystalpalace",
  everton: "everton",
  fulham: "fulham",
  ipswichtown: "ipswich",
  ipswich: "ipswich",
  leicestercity: "leicester",
  leicester: "leicester",
  liverpool: "liverpool",
  manchestercity: "mancity",
  mancity: "mancity",
  manchesterunited: "manutd",
  manutd: "manutd",
  newcastleunited: "newcastle",
  newcastle: "newcastle",
  nottinghamforest: "forest",
  nottmforest: "forest",
  forest: "forest",
  southampton: "southampton",
  tottenhamhotspur: "spurs",
  spurs: "spurs",
  tottenham: "spurs",
  westhamunited: "westham",
  westham: "westham",
  wolverhamptonwanderers: "wolves",
  wolves: "wolves",
};

function normalizeClubName(name) {
  const normalized = String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");

  return CLUB_NAME_ALIASES[normalized] || normalized;
}

function getMatchFingerprint(match) {
  const dateKey = match?.kickoffTime
    ? new Date(match.kickoffTime).toISOString().slice(0, 10)
    : "tbd";

  return [
    normalizeClubName(match?.home?.name || match?.home?.shortName),
    normalizeClubName(match?.away?.name || match?.away?.shortName),
    dateKey,
  ].join(":");
}

function mergeMatchWindows(baseMatches, overlayMatches) {
  if (!overlayMatches.length) {
    return baseMatches;
  }

  const overlayByFingerprint = new Map(
    overlayMatches.map((match) => [getMatchFingerprint(match), match]),
  );

  const merged = baseMatches.map((match) => {
    const fingerprint = getMatchFingerprint(match);
    const overlay = overlayByFingerprint.get(fingerprint);

    if (!overlay) {
      return match;
    }

    overlayByFingerprint.delete(fingerprint);

    return {
      ...match,
      kickoffTime: overlay.kickoffTime || match.kickoffTime,
      dateLabel: overlay.dateLabel || match.dateLabel,
      kickoffLabel: overlay.kickoffLabel || match.kickoffLabel,
      weekLabel: overlay.weekLabel || match.weekLabel,
      competitionPhase: overlay.competitionPhase || match.competitionPhase,
      status: overlay.status || match.status,
      score: {
        home: overlay.score?.home ?? match.score?.home,
        away: overlay.score?.away ?? match.score?.away,
      },
      venue: overlay.venue || match.venue,
      minute: overlay.minute ?? match.minute,
      isLive: overlay.isLive ?? match.isLive,
      events: overlay.events?.length ? overlay.events : match.events,
      provider: overlay.provider || match.provider,
    };
  });

  return [...merged, ...overlayByFingerprint.values()].sort((left, right) => {
    const leftTime = left.kickoffTime
      ? new Date(left.kickoffTime).getTime()
      : Number.MAX_SAFE_INTEGER;
    const rightTime = right.kickoffTime
      ? new Date(right.kickoffTime).getTime()
      : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });
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

  return [...groups.values()].sort((left, right) =>
    left.dateKey.localeCompare(right.dateKey),
  );
}

function limitMatchesWindow(fixtures, referenceDate = new Date()) {
  if (!fixtures.length) {
    return [];
  }

  const reference = referenceDate.getTime();
  const sorted = [...fixtures].sort((left, right) => {
    const leftTime = left.kickoffTime ? new Date(left.kickoffTime).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.kickoffTime ? new Date(right.kickoffTime).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });

  const candidates = sorted.filter((fixture) => {
    if (!fixture.kickoffTime) {
      return false;
    }

    const time = new Date(fixture.kickoffTime).getTime();
    const distance = Math.abs(time - reference);
    return distance <= 21 * 24 * 60 * 60 * 1000;
  });

  if (candidates.length >= 12) {
    return candidates;
  }

  const nearest = sorted
    .map((fixture) => ({
      fixture,
      distance: fixture.kickoffTime
        ? Math.abs(new Date(fixture.kickoffTime).getTime() - reference)
        : Number.MAX_SAFE_INTEGER,
    }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 20)
    .map((entry) => entry.fixture)
    .sort((left, right) => {
      const leftTime = left.kickoffTime ? new Date(left.kickoffTime).getTime() : Number.MAX_SAFE_INTEGER;
      const rightTime = right.kickoffTime ? new Date(right.kickoffTime).getTime() : Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    });

  return nearest;
}

async function getISportsPremierLeagueMatches(seasonYear) {
  const leagueId = getFirstEnv("ISPORTS_PREMIER_LEAGUE_ID", "PREMIER_LEAGUE_ID");

  if (!leagueId) {
    throw new Error("Premier League leagueId not configured for iSports");
  }

  const scheduleMatches = await fetchISportsLiveScores({
    date: undefined,
  });

  const filtered = scheduleMatches.filter(
    (match) =>
      String(match.league.id) === String(leagueId) &&
      (!seasonYear || String(match.season).startsWith(String(seasonYear))),
  );

  const enriched = await Promise.all(
    filtered.slice(0, 20).map(async (match) => {
      let events = [];

      try {
        const eventRows = await fetchISportsEvents({ matchId: match.id });
        events = eventRows.find((row) => row.matchId === match.id)?.events || [];
      } catch {
        events = [];
      }

      return {
        id: match.id,
        kickoffTime: match.date,
        dateLabel: match.date ? getDateLabel(match.date) : "Schedule TBC",
        kickoffLabel: getKickoffLabel(match.date),
        weekLabel: match.round ? `Week ${match.round}` : "Premier League",
        competitionPhase: match.group || "Premier League",
        status: match.status,
        home: match.home,
        away: match.away,
        score: match.goals,
        venue: match.venue,
        minute: match.status.elapsed,
        isLive: match.status.isLive,
        events,
        provider: "isports",
      };
    }),
  );

  return {
    status: "ok",
    provider: "iSports",
    matches: enriched,
  };
}

async function getFplFallbackMatches(seasonYear, referenceDate = new Date()) {
  const activeSeasonYear = getSeasonYearFromDate(referenceDate);
  const activeSeasonLabel = `${activeSeasonYear}-${String((activeSeasonYear + 1) % 100).padStart(2, "0")}`;

  if (seasonYear !== activeSeasonYear) {
    return {
      status: "coming-soon",
      provider: "FPL schedule",
      matches: [],
      emptyState:
        `The next season schedule has not been published yet. Switch back to the live ${activeSeasonLabel} season for the current match window.`,
    };
  }

  const fixtures = await getFplPremierLeagueFixtures();
  const limited = limitMatchesWindow(fixtures, referenceDate);

  const matches = limited.map((fixture) => ({
    id: `fpl-${fixture.id}`,
    kickoffTime: fixture.kickoffTime,
    dateLabel: fixture.kickoffTime ? getDateLabel(fixture.kickoffTime) : "Schedule TBC",
    kickoffLabel: getKickoffLabel(fixture.kickoffTime),
    weekLabel: fixture.week ? `Week ${fixture.week}` : "Premier League",
    competitionPhase: "Premier League",
    status: fixture.status,
    home: fixture.home,
    away: fixture.away,
    score: fixture.score,
    venue: "",
    minute: fixture.minute,
    isLive: fixture.status.isLive,
    events: [],
    provider: "fpl",
  }));

  return {
    status: "fallback",
    provider: "FPL schedule",
    matches,
  };
}

export async function getPremierLeagueMeta() {
  const seasonOptions = getPremierLeagueSeasonOptions();
  const activeSeason = seasonOptions[0];

  let providerStatus = "fallback";
  let providerName = "FPL schedule";

  try {
    const leagueId = getFirstEnv("ISPORTS_PREMIER_LEAGUE_ID", "PREMIER_LEAGUE_ID");
    if (leagueId) {
      const profile = await fetchISportsLeagueProfile({ leagueId });
      if (profile) {
        providerStatus = "ok";
        providerName = "iSports + FPL schedule";
      }
    }
  } catch {
    providerStatus = "fallback";
    providerName = "FPL schedule";
  }

  return {
    league: {
      slug: "premier-league",
      name: "Premier League",
      seasonLabel: activeSeason.label,
      logo: PREMIER_LEAGUE_LOGO,
    },
    tabs: [
      { key: "matches", label: "Matches" },
      { key: "news", label: "News" },
      { key: "standings", label: "Standings" },
      { key: "stats", label: "Stats" },
    ],
    seasonOptions,
    selectedSeason: activeSeason.year,
    provider: {
      status: providerStatus,
      name: providerName,
    },
    arenaLink: {
      href: "/fixtures",
      label: "Main Fixtures Board",
    },
  };
}

export async function getPremierLeagueMatches(seasonYear) {
  const normalizedSeasonYear = Number(seasonYear) || getSeasonYearFromDate();
  const seasonOptions = getPremierLeagueSeasonOptions();
  const selectedSeason =
    seasonOptions.find((option) => option.year === normalizedSeasonYear) ||
    seasonOptions[0];
  let fallbackResult = {
    status: "degraded",
    provider: "FPL schedule",
    matches: [],
    emptyState: "",
  };
  let iSportsResult = null;

  try {
    fallbackResult = await getFplFallbackMatches(selectedSeason.year);
  } catch {
    fallbackResult = {
      status: "degraded",
      provider: "FPL schedule",
      matches: [],
      emptyState: "FPL season schedule is temporarily unavailable.",
    };
  }

  try {
    iSportsResult = await getISportsPremierLeagueMatches(selectedSeason.year);
  } catch {
    iSportsResult = null;
  }

  const matches = mergeMatchWindows(
    fallbackResult.matches,
    iSportsResult?.matches || [],
  );

  if (matches.length > 0) {
    return {
      season: selectedSeason,
      provider: {
        status: iSportsResult?.matches?.length ? "ok" : fallbackResult.status,
        name: iSportsResult?.matches?.length
          ? "iSports + FPL schedule"
          : fallbackResult.provider,
      },
      groups: createMatchesGroups(matches),
      matches,
      emptyState: "",
    };
  }

  return {
    season: selectedSeason,
    provider: {
      status: fallbackResult.status,
      name: fallbackResult.provider,
    },
    groups: createMatchesGroups([]),
    matches: [],
    emptyState:
      fallbackResult.emptyState ||
      "No Premier League fixtures are available for the current match window yet.",
  };
}
