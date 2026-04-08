const TOP_25_LEAGUES = [
  {
    slug: "premier-league",
    name: "Premier League",
    country: "England",
    aliases: ["england premier league", "epl"],
  },
  {
    slug: "la-liga",
    name: "La Liga",
    country: "Spain",
    aliases: ["laliga", "la liga ea sports"],
  },
  {
    slug: "serie-a",
    name: "Serie A",
    country: "Italy",
    aliases: ["italy serie a", "serie a tim"],
  },
  {
    slug: "bundesliga",
    name: "Bundesliga",
    country: "Germany",
    aliases: ["germany bundesliga"],
  },
  {
    slug: "ligue-1",
    name: "Ligue 1",
    country: "France",
    aliases: ["ligue1", "france ligue 1"],
  },
  {
    slug: "uefa-champions-league",
    name: "UEFA Champions League",
    country: "Europe",
    aliases: ["champions league", "ucl"],
  },
  {
    slug: "uefa-europa-league",
    name: "UEFA Europa League",
    country: "Europe",
    aliases: ["europa league", "uel"],
  },
  {
    slug: "uefa-conference-league",
    name: "UEFA Conference League",
    country: "Europe",
    aliases: ["conference league", "uefa europa conference league", "uecl"],
  },
  {
    slug: "eredivisie",
    name: "Eredivisie",
    country: "Netherlands",
    aliases: ["netherlands eredivisie"],
  },
  {
    slug: "primeira-liga",
    name: "Primeira Liga",
    country: "Portugal",
    aliases: ["liga portugal", "portugal primeira liga"],
  },
  {
    slug: "belgian-pro-league",
    name: "Belgian Pro League",
    country: "Belgium",
    aliases: ["jupiler pro league", "belgium pro league"],
  },
  {
    slug: "scottish-premiership",
    name: "Scottish Premiership",
    country: "Scotland",
    aliases: ["scotland premiership"],
  },
  {
    slug: "turkish-super-lig",
    name: "Turkish Super Lig",
    country: "Turkey",
    aliases: ["super lig", "turkey super lig", "süper lig"],
  },
  {
    slug: "saudi-pro-league",
    name: "Saudi Pro League",
    country: "Saudi Arabia",
    aliases: ["saudi league", "roshn saudi league"],
  },
  {
    slug: "major-league-soccer",
    name: "Major League Soccer",
    country: "United States",
    aliases: ["mls", "major league soccer"],
  },
  {
    slug: "brasileirao",
    name: "Brasileirao Serie A",
    country: "Brazil",
    aliases: ["campeonato brasileiro serie a", "brazil serie a", "brasileirão"],
  },
  {
    slug: "argentine-primera",
    name: "Argentine Primera Division",
    country: "Argentina",
    aliases: ["liga profesional argentina", "argentina primera division"],
  },
  {
    slug: "liga-mx",
    name: "Liga MX",
    country: "Mexico",
    aliases: ["mexico liga mx"],
  },
  {
    slug: "psl",
    name: "PSL",
    country: "South Africa",
    aliases: [
      "betway premiership",
      "south african premiership",
      "dStv premiership",
      "south africa premier soccer league",
      "premier soccer league",
    ],
  },
  {
    slug: "egyptian-premier-league",
    name: "Egyptian Premier League",
    country: "Egypt",
    aliases: ["egypt premier league"],
  },
  {
    slug: "caf-champions-league",
    name: "CAF Champions League",
    country: "Africa",
    aliases: ["caf champions league"],
  },
  {
    slug: "caf-confederation-cup",
    name: "CAF Confederation Cup",
    country: "Africa",
    aliases: ["caf confederation cup"],
  },
  {
    slug: "j1-league",
    name: "J1 League",
    country: "Japan",
    aliases: ["j league", "j.league"],
  },
  {
    slug: "k-league-1",
    name: "K League 1",
    country: "South Korea",
    aliases: ["k league 1", "kleague 1"],
  },
  {
    slug: "afc-champions-league-elite",
    name: "AFC Champions League Elite",
    country: "Asia",
    aliases: ["afc champions league elite", "afc champions league"],
  },
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getTopLeagueMatch(leagueName, country) {
  const normalizedLeague = normalizeText(leagueName);
  const normalizedCountry = normalizeText(country);

  return (
    TOP_25_LEAGUES.find((league) => {
      if (normalizeText(league.name) === normalizedLeague) {
        return true;
      }

      if (league.aliases.some((alias) => normalizeText(alias) === normalizedLeague)) {
        return true;
      }

      return (
        normalizedCountry &&
        normalizeText(league.country) === normalizedCountry &&
        league.aliases.some((alias) => normalizedLeague.includes(normalizeText(alias)))
      );
    }) || null
  );
}

export function getLeaguePriority(leagueName, country) {
  const match = getTopLeagueMatch(leagueName, country);
  return match ? TOP_25_LEAGUES.findIndex((league) => league.slug === match.slug) : Number.MAX_SAFE_INTEGER;
}

export function sortLeagueEntriesByPriority(entries) {
  return [...entries].sort((a, b) => {
    const priorityDiff =
      getLeaguePriority(a.league?.name, a.league?.country) -
      getLeaguePriority(b.league?.name, b.league?.country);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return String(a.league?.name || "").localeCompare(String(b.league?.name || ""));
  });
}

export { TOP_25_LEAGUES };
