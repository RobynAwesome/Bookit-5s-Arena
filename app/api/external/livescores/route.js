export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { fetchISportsLiveScores } from '@/lib/sports/isports';
import { getLeaguePriority, getTopLeagueMatch } from '@/lib/sports/topLeagues';

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';
const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const LIVE_STATUS_SHORTS = new Set(['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE', 'PEN']);

// In-memory cache (60s TTL)
let cache = { data: null, timestamp: 0, key: '' };
const CACHE_TTL = 60_000;

function getDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().split('T')[0];
}

function dedupeMatches(matches) {
  const deduped = new Map();

  for (const match of matches) {
    const fallbackKey = [
      match?.league?.name || 'league',
      match?.home?.name || 'home',
      match?.away?.name || 'away',
      match?.date || 'date',
    ].join(':');
    const key = String(match?.id || fallbackKey);
    const existing = deduped.get(key);

    if (!existing) {
      deduped.set(key, match);
      continue;
    }

    const matchIsLive = LIVE_STATUS_SHORTS.has(match?.status?.short);
    const existingIsLive = LIVE_STATUS_SHORTS.has(existing?.status?.short);
    const matchHasScore =
      match?.goals?.home !== null &&
      match?.goals?.home !== undefined &&
      match?.goals?.away !== null &&
      match?.goals?.away !== undefined;
    const existingHasScore =
      existing?.goals?.home !== null &&
      existing?.goals?.home !== undefined &&
      existing?.goals?.away !== null &&
      existing?.goals?.away !== undefined;

    if ((matchIsLive && !existingIsLive) || (matchHasScore && !existingHasScore)) {
      deduped.set(key, match);
    }
  }

  return [...deduped.values()];
}

async function fetchFromISports(date) {
  const targetDate = date || getDateKey();
  const [liveMatches, scheduledMatches] = await Promise.all(
    date
      ? [fetchISportsLiveScores({ date: targetDate }), Promise.resolve([])]
      : [fetchISportsLiveScores(), fetchISportsLiveScores({ date: targetDate })],
  );

  const matches = dedupeMatches([...(liveMatches || []), ...(scheduledMatches || [])]);

  return {
    matches,
    available: true,
    source: date ? 'isports-schedule' : 'isports-live-schedule',
  };
}

// TheSportsDB free endpoints — key "3" is the documented free tier
async function fetchFromSportsDB(date) {
  const d = date || new Date().toISOString().split('T')[0];
  const res = await fetch(`${SPORTSDB_BASE}/eventsday.php?d=${d}&s=Soccer`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`TheSportsDB error: ${res.status}`);
  const json = await res.json();

  const events = json.events || [];
  const matches = events.map(e => {
    const statusRaw = e.strStatus || '';
    const elapsed = parseInt(e.intProgress) || null;
    // Derive short status
    let short = 'NS';
    if (statusRaw === 'Match Finished') short = 'FT';
    else if (statusRaw === '1st Half' || statusRaw === 'Live') short = '1H';
    else if (statusRaw === '2nd Half') short = '2H';
    else if (statusRaw === 'Extra Time') short = 'ET';
    else if (statusRaw === 'Penalty') short = 'PEN';
    else if (statusRaw === 'Half Time') short = 'HT';
    else if (statusRaw === 'Postponed') short = 'PST';
    else if (statusRaw === 'Cancelled') short = 'CANC';

    return {
      id: e.idEvent,
      league: {
        name: e.strLeague,
        country: e.strCountry,
        logo: e.strLeagueBadge || null,
        flag: null,
      },
      home: {
        name: e.strHomeTeam,
        logo: e.strHomeTeamBadge || null,
        winner: short === 'FT'
          ? parseInt(e.intHomeScore) > parseInt(e.intAwayScore)
          : null,
      },
      away: {
        name: e.strAwayTeam,
        logo: e.strAwayTeamBadge || null,
        winner: short === 'FT'
          ? parseInt(e.intAwayScore) > parseInt(e.intHomeScore)
          : null,
      },
      goals: {
        home: e.intHomeScore !== null && e.intHomeScore !== '' ? parseInt(e.intHomeScore) : null,
        away: e.intAwayScore !== null && e.intAwayScore !== '' ? parseInt(e.intAwayScore) : null,
      },
      status: {
        long: statusRaw || 'Not Started',
        short,
        elapsed,
      },
      date: e.strTimestamp || `${e.dateEvent}T${e.strTime || '00:00:00'}+00:00`,
      source: 'sportsdb',
    };
  });

  return { matches, available: true, source: 'sportsdb' };
}

async function fetchFromApiFootball(params) {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const res = await fetch(`${API_FOOTBALL_BASE}/fixtures?${params.toString()}`, {
    headers: { 'x-apisports-key': apiKey },
  });
  if (!res.ok) throw new Error(`API-Football error: ${res.status}`);
  const json = await res.json();

  const matches = (json.response || []).map(m => ({
    id: m.fixture?.id,
    league: {
      name: m.league?.name,
      country: m.league?.country,
      logo: m.league?.logo,
      flag: m.league?.flag,
    },
    home: {
      name: m.teams?.home?.name,
      logo: m.teams?.home?.logo,
      winner: m.teams?.home?.winner,
    },
    away: {
      name: m.teams?.away?.name,
      logo: m.teams?.away?.logo,
      winner: m.teams?.away?.winner,
    },
    goals: {
      home: m.goals?.home,
      away: m.goals?.away,
    },
    status: {
      long: m.fixture?.status?.long,
      short: m.fixture?.status?.short,
      elapsed: m.fixture?.status?.elapsed,
    },
    date: m.fixture?.date,
    source: 'apifootball',
  }));

  return { matches, available: true, source: 'apifootball' };
}

/**
 * GET /api/external/livescores
 * Query params: date (YYYY-MM-DD)
 * Always available — uses TheSportsDB (free, no key) or API-Football (enhanced, key required)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const topLeaguesOnly = searchParams.get('topLeaguesOnly') === 'true';
    const targetDate = date || getDateKey();
    const cacheKey = `livescores-${targetDate}-${topLeaguesOnly ? 'top25' : 'all'}`;

    // Return cached data if still fresh
    if (cache.key === cacheKey && Date.now() - cache.timestamp < CACHE_TTL && cache.data) {
      return NextResponse.json(cache.data);
    }

    let result;

    try {
      result = await fetchFromISports(date);

      if (!result.matches.length) {
        throw new Error('iSports returned no matches for the current window');
      }
    } catch (iSportsError) {
      console.warn('iSports failed, falling back to legacy providers:', iSportsError.message);

      // Try API-Football first if key is configured (legacy compatibility)
      if (process.env.FOOTBALL_API_KEY) {
        try {
          const params = new URLSearchParams();
          params.set('date', targetDate);
          result = await fetchFromApiFootball(params);
        } catch (err) {
          console.warn('API-Football failed, falling back to TheSportsDB:', err.message);
          result = await fetchFromSportsDB(targetDate);
        }
      } else {
        // Free fallback — TheSportsDB (today's/date's matches, no key needed)
        result = await fetchFromSportsDB(targetDate);
      }
    }

    const matches = (result.matches || [])
      .map((match) => {
        const preferredLeague = getTopLeagueMatch(
          match.league?.name,
          match.league?.country,
        );

        return {
          ...match,
          league: {
            ...match.league,
            spotlight: preferredLeague?.name || null,
          },
          preferredLeague: preferredLeague?.slug || null,
          leaguePriority: getLeaguePriority(
            match.league?.name,
            match.league?.country,
          ),
        };
      })
      .filter((match) => !topLeaguesOnly || match.preferredLeague)
      .sort((a, b) => {
        if (a.leaguePriority !== b.leaguePriority) {
          return a.leaguePriority - b.leaguePriority;
        }

        const aLive = LIVE_STATUS_SHORTS.has(a.status?.short);
        const bLive = LIVE_STATUS_SHORTS.has(b.status?.short);

        if (aLive !== bLive) {
          return aLive ? -1 : 1;
        }

        return String(a.league?.name || '').localeCompare(String(b.league?.name || ''));
      });

    result = {
      ...result,
      matches,
      topLeagueCoverage: matches.filter((match) => match.preferredLeague).length,
    };

    // Cache the result
    cache = { data: result, timestamp: Date.now(), key: cacheKey };
    return NextResponse.json(result);
  } catch (err) {
    console.error('Livescores proxy error:', err);
    return NextResponse.json({ matches: [], available: false, error: err.message }, { status: 500 });
  }
}
