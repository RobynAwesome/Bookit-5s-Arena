import { fetchFplBootstrap, getFplTeamMap } from "@/lib/sports/fpl";
import { getPremierLeagueSeasonOptions } from "@/lib/sports/isports";

const STATS_CATEGORY_MAP = {
  goals: {
    key: "goals",
    label: "Goals",
    statField: "goals_scored",
    fallbackLabel: "Goals",
  },
  assists: {
    key: "assists",
    label: "Assists",
    statField: "assists",
    fallbackLabel: "Assists",
  },
  yellowCards: {
    key: "yellowCards",
    label: "Yellow Cards",
    statField: "yellow_cards",
    fallbackLabel: "Yellows",
  },
  redCards: {
    key: "redCards",
    label: "Red Cards",
    statField: "red_cards",
    fallbackLabel: "Reds",
  },
};

function getActiveSeasonYear(referenceDate = new Date()) {
  const month = referenceDate.getMonth() + 1;
  return month >= 7 ? referenceDate.getFullYear() : referenceDate.getFullYear() - 1;
}

function buildPlayerImageUrl(player) {
  const photoCode = String(player.photo || "").split(".")[0] || String(player.code || "");

  if (!photoCode) {
    return "";
  }

  return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photoCode}.png`;
}

function normalizeCategory(category) {
  if (STATS_CATEGORY_MAP[category]) {
    return STATS_CATEGORY_MAP[category];
  }

  return STATS_CATEGORY_MAP.goals;
}

function getSortableValue(player, statField) {
  const value = Number(player?.[statField] ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function createLeader(player, team, category, rank) {
  const value = getSortableValue(player, category.statField);

  return {
    rank,
    player: {
      id: String(player.id),
      name: player.web_name || `${player.first_name || ""} ${player.second_name || ""}`.trim(),
      image: buildPlayerImageUrl(player),
      initials: (player.web_name || player.second_name || player.first_name || "PL")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    },
    team: team || {
      id: "",
      name: "Club TBD",
      shortName: "TBD",
      logo: "",
    },
    stat: {
      key: category.key,
      label: category.label,
      shortLabel: category.fallbackLabel,
      value,
    },
    minutes: Number(player.minutes || 0),
  };
}

function sortPlayersForCategory(players, statField) {
  return [...players].sort((left, right) => {
    const valueDelta = getSortableValue(right, statField) - getSortableValue(left, statField);
    if (valueDelta !== 0) {
      return valueDelta;
    }

    const minutesDelta = Number(right.minutes || 0) - Number(left.minutes || 0);
    if (minutesDelta !== 0) {
      return minutesDelta;
    }

    return (left.web_name || left.second_name || "").localeCompare(
      right.web_name || right.second_name || "",
    );
  });
}

export function getPremierLeagueStatsCategories() {
  return Object.values(STATS_CATEGORY_MAP).map(({ key, label }) => ({
    key,
    label,
  }));
}

export async function getPremierLeagueStats(seasonYear, categoryKey = "goals") {
  const seasonOptions = getPremierLeagueSeasonOptions();
  const activeSeasonYear = getActiveSeasonYear();
  const category = normalizeCategory(categoryKey);
  const selectedSeason =
    seasonOptions.find((option) => option.year === Number(seasonYear)) ||
    seasonOptions[0];

  if (selectedSeason.year !== activeSeasonYear) {
    return {
      season: selectedSeason,
      category: category.key,
      categories: getPremierLeagueStatsCategories(),
      leaders: [],
      provider: { name: "FPL player leaders", status: "coming-soon" },
      emptyState:
        "The next season player leaderboard has not been published yet. Switch back to the live season for current leaders.",
    };
  }

  const [bootstrap, teamMap] = await Promise.all([
    fetchFplBootstrap(),
    getFplTeamMap(),
  ]);

  const players = Array.isArray(bootstrap?.elements) ? bootstrap.elements : [];
  const sortedPlayers = sortPlayersForCategory(players, category.statField);
  const leaders = sortedPlayers.slice(0, 12).map((player, index) => {
    const team = teamMap.get(player.team);
    return createLeader(player, team, category, index + 1);
  });

  return {
    season: selectedSeason,
    category: category.key,
    categories: getPremierLeagueStatsCategories(),
    leaders,
    provider: {
      name: "FPL player leaders",
      status: "fallback",
    },
    emptyState: "",
  };
}
