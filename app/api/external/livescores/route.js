export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';
const SPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

// In-memory cache (60s TTL)
let cache = { data: null, timestamp: 0, key: '' };
const CACHE_TTL = 60_000;

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
    const cacheKey = `livescores-${date || 'today'}`;

    // Return cached data if still fresh
    if (cache.key === cacheKey && Date.now() - cache.timestamp < CACHE_TTL && cache.data) {
      return NextResponse.json(cache.data);
    }

    let result;

    // Try API-Football first if key is configured (real live data)
    if (process.env.FOOTBALL_API_KEY) {
      try {
        const params = new URLSearchParams();
        if (date) {
          params.set('date', date);
        } else {
          params.set('live', 'all');
        }
        result = await fetchFromApiFootball(params);
      } catch (err) {
        console.warn('API-Football failed, falling back to TheSportsDB:', err.message);
        result = await fetchFromSportsDB(date);
      }
    } else {
      // Free fallback — TheSportsDB (today's/date's matches, no key needed)
      result = await fetchFromSportsDB(date);
    }

    // Cache the result
    cache = { data: result, timestamp: Date.now(), key: cacheKey };
    return NextResponse.json(result);
  } catch (err) {
    console.error('Livescores proxy error:', err);
    return NextResponse.json({ matches: [], available: false, error: err.message }, { status: 500 });
  }
}
