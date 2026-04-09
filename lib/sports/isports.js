import { withRuntimeCache } from "@/lib/runtimeCache";
import { getISportsConfig } from "@/lib/sports/config";

const SPORTS_NAMESPACE = "isports";

const STATUS_MAP = {
  "-14": { state: "postponed", short: "PPD", long: "Postponed", isLive: false },
  "-13": { state: "interrupted", short: "INT", long: "Interrupted", isLive: false },
  "-12": { state: "terminated", short: "TERM", long: "Terminated", isLive: false },
  "-11": { state: "scheduled", short: "TBD", long: "To Be Decided", isLive: false },
  "-10": { state: "cancelled", short: "CANC", long: "Cancelled", isLive: false },
  "-1": { state: "completed", short: "FT", long: "Full Time", isLive: false },
  "0": { state: "scheduled", short: "NS", long: "Not Started", isLive: false },
  "1": { state: "live", short: "1H", long: "First Half", isLive: true },
  "2": { state: "live", short: "HT", long: "Half Time", isLive: true },
  "3": { state: "live", short: "2H", long: "Second Half", isLive: true },
  "4": { state: "live", short: "ET", long: "Extra Time", isLive: true },
  "5": { state: "live", short: "PEN", long: "Penalty Shootout", isLive: true },
};

const EVENT_TYPE_MAP = {
  "1": "goal",
  "2": "red-card",
  "3": "yellow-card",
  "7": "penalty-goal",
  "8": "own-goal",
  "9": "second-yellow",
  "11": "substitution",
  "13": "penalty-missed",
  "14": "var",
};

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveDateTime(match) {
  return (
    match.matchTime ||
    match.matchDate ||
    match.kickOffTime ||
    match.dateTime ||
    match.time ||
    match.date ||
    null
  );
}

function inferWinner(homeScore, awayScore, side) {
  if (homeScore === null || awayScore === null) {
    return null;
  }

  if (homeScore === awayScore) {
    return false;
  }

  return side === "home" ? homeScore > awayScore : awayScore > homeScore;
}

export function getPremierLeagueSeasonOptions(referenceDate = new Date()) {
  const month = referenceDate.getMonth() + 1;
  const activeStartYear =
    month >= 7 ? referenceDate.getFullYear() : referenceDate.getFullYear() - 1;

  return [activeStartYear, activeStartYear + 1].map((startYear) => ({
    year: startYear,
    label: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
  }));
}

export function normalizeISportsStatus(statusCode, fallbackMinute = null) {
  const status = STATUS_MAP[String(statusCode)] || STATUS_MAP["0"];

  return {
    ...status,
    code: statusCode,
    minute: toNumber(fallbackMinute),
  };
}

export function mapISportsEvent(event) {
  return {
    id: event?.eventId ?? `${event?.minute ?? "0"}-${event?.type ?? "unknown"}`,
    minute: toNumber(event?.minute),
    type: EVENT_TYPE_MAP[String(event?.type)] || "event",
    playerName: event?.playerName || "",
    assistPlayerName: event?.assistPlayerName || "",
    homeEvent: Boolean(event?.homeEvent),
    detail: event?.detail || "",
    raw: event,
  };
}

export function mapISportsMatch(match) {
  const homeScore = toNumber(match?.homeScore);
  const awayScore = toNumber(match?.awayScore);
  const status = normalizeISportsStatus(
    match?.status,
    match?.extraExplain?.minute ?? match?.minute,
  );

  return {
    id: String(match?.matchId ?? match?.id ?? ""),
    league: {
      id: String(match?.leagueId ?? ""),
      name: match?.leagueName || match?.competitionName || "Premier League",
      shortName: match?.leagueShortName || "",
      logo: match?.leagueLogo || null,
      country: match?.country || null,
      flag: match?.countryLogo || null,
    },
    season: match?.season || "",
    round: match?.round || match?.currentRound || "",
    group: match?.group || "",
    venue: match?.location || match?.venue || "",
    weather: match?.weather || "",
    temperature: match?.temperature || "",
    home: {
      id: String(match?.homeId ?? ""),
      name: match?.homeName || "Home Team",
      logo: match?.homeLogo || null,
      winner: inferWinner(homeScore, awayScore, "home"),
    },
    away: {
      id: String(match?.awayId ?? ""),
      name: match?.awayName || "Away Team",
      logo: match?.awayLogo || null,
      winner: inferWinner(homeScore, awayScore, "away"),
    },
    goals: {
      home: homeScore,
      away: awayScore,
    },
    cards: {
      homeYellow: toNumber(match?.homeYellow),
      awayYellow: toNumber(match?.awayYellow),
      homeRed: toNumber(match?.homeRed),
      awayRed: toNumber(match?.awayRed),
    },
    corners: {
      home: toNumber(match?.homeCorner),
      away: toNumber(match?.awayCorner),
    },
    status: {
      long: status.long,
      short: status.short,
      elapsed: status.minute,
      state: status.state,
      code: status.code,
      isLive: status.isLive,
    },
    date: resolveDateTime(match),
    source: "isports",
    raw: match,
  };
}

async function fetchISports(path, params = {}, { ttlMs = 30_000 } = {}) {
  const config = getISportsConfig();

  if (!config.enabled) {
    throw new Error("iSports is not configured");
  }

  const searchParams = new URLSearchParams();
  searchParams.set("api_key", config.apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const requestUrl = `${config.baseUrl}${path}?${searchParams.toString()}`;
  const cacheKey = `${path}:${searchParams.toString()}`;

  return withRuntimeCache(SPORTS_NAMESPACE, cacheKey, ttlMs, async () => {
    const response = await fetch(requestUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`iSports request failed with ${response.status}`);
    }

    const payload = await response.json();

    if (
      typeof payload?.code === "number" &&
      payload.code !== 0 &&
      payload.code !== 200
    ) {
      throw new Error(payload.message || `iSports error code ${payload.code}`);
    }

    return payload;
  });
}

export async function fetchISportsLiveScores({ date } = {}) {
  const path = date ? "/sport/football/schedule" : "/sport/football/livescores";
  const response = await fetchISports(
    path,
    date ? { date } : {},
    { ttlMs: date ? 120_000 : 30_000 },
  );

  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return rows.map(mapISportsMatch);
}

export async function fetchISportsEvents({ date, matchId, onlyUpdated = false } = {}) {
  const params = {
    date,
    matchId,
  };

  if (onlyUpdated) {
    params.cmd = "new";
  }

  const response = await fetchISports("/sport/football/events", params, {
    ttlMs: onlyUpdated ? 10_000 : 30_000,
  });

  const rows = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return rows.map((row) => ({
    matchId: String(row?.matchId ?? ""),
    events: Array.isArray(row?.events) ? row.events.map(mapISportsEvent) : [],
  }));
}

export async function fetchISportsLineups({ matchId, isPreview = false }) {
  if (!matchId) {
    return null;
  }

  return fetchISports(
    "/sport/football/lineups",
    {
      matchId,
      isPreview: isPreview ? "true" : undefined,
    },
    { ttlMs: 60_000 },
  );
}

export async function fetchISportsLeagueProfile({ leagueId, cmd, day } = {}) {
  if (!leagueId) {
    return null;
  }

  return fetchISports(
    "/sport/football/league",
    {
      leagueId,
      cmd,
      day,
    },
    { ttlMs: 300_000 },
  );
}

export async function getISportsProviderHealth() {
  const config = getISportsConfig();

  if (!config.enabled) {
    return {
      provider: "iSports",
      configured: false,
      status: "unconfigured",
      baseUrl: config.baseUrl,
    };
  }

  try {
    const matches = await fetchISportsLiveScores();

    return {
      provider: "iSports",
      configured: true,
      status: "ok",
      baseUrl: config.baseUrl,
      sampleCount: matches.length,
    };
  } catch (error) {
    return {
      provider: "iSports",
      configured: true,
      status: "degraded",
      baseUrl: config.baseUrl,
      error: error.message,
    };
  }
}
