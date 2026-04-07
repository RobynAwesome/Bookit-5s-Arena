/**
 * Random Fixture Generator — Old UEFA Champions League Format
 * 8 Groups × 6 Teams each = 48 teams
 * Round-robin within groups, top 2 advance to Round of 16
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

/**
 * Assign teams to groups (6 teams per group, 8 groups)
 * @param {Array} teams - Array of team objects with _id, teamName, worldCupTeam
 * @returns {Object} groups - { A: [...], B: [...], ..., H: [...] }
 */
export function assignGroups(teams) {
  if (teams.length > 48) throw new Error("Maximum 48 teams allowed");

  const shuffled = shuffle(teams);
  const groups = {};

  GROUP_LETTERS.forEach((letter, i) => {
    groups[letter] = shuffled.slice(i * 6, (i + 1) * 6).map((team, seed) => ({
      ...team,
      groupLetter: letter,
      groupNumber: i + 1,
      seed: seed + 1,
    }));
  });

  return groups;
}

/**
 * Generate round-robin fixtures within a group
 * Each team plays every other team once
 * @param {Array} groupTeams - Array of teams in a group
 * @returns {Array} fixtures - Array of { home, away, matchday }
 */
export function generateGroupFixtures(groupTeams) {
  const fixtures = [];
  const n = groupTeams.length;

  // Round-robin: every team plays every other team
  let matchday = 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      fixtures.push({
        home: {
          teamId: groupTeams[i]._id || groupTeams[i].teamName,
          teamName: groupTeams[i].teamName,
          worldCupTeam: groupTeams[i].worldCupTeam,
        },
        away: {
          teamId: groupTeams[j]._id || groupTeams[j].teamName,
          teamName: groupTeams[j].teamName,
          worldCupTeam: groupTeams[j].worldCupTeam,
        },
        matchday: Math.ceil((fixtures.length + 1) / Math.floor(n / 2)),
        result: null, // { homeScore: 0, awayScore: 0 }
        played: false,
      });
    }
  }

  return fixtures;
}

/**
 * Generate the entire tournament draw
 * @param {Array} teams - All registered teams
 * @returns {Object} tournament draw
 */
export function generateTournamentDraw(teams) {
  const groups = assignGroups(teams);
  const allFixtures = {};

  GROUP_LETTERS.forEach((letter) => {
    if (groups[letter] && groups[letter].length > 1) {
      allFixtures[letter] = generateGroupFixtures(groups[letter]);
    }
  });

  return {
    groups,
    fixtures: allFixtures,
    format: {
      name: "5s Arena World Cup 2026",
      totalTeams: teams.length,
      groupCount: 8,
      teamsPerGroup: 6,
      matchesPerGroup: 15, // C(6,2) = 15
      totalGroupMatches: 120, // 8 × 15
      knockoutFormat: "Round of 16 → Quarter-Finals → Semi-Finals → Final",
      advanceFromGroup: 2,
    },
    knockoutBracket: generateKnockoutBracket(),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate empty knockout bracket template
 * Top 2 from each group → R16 → QF → SF → F
 */
function generateKnockoutBracket() {
  return {
    roundOf16: [
      { match: "R16-1", home: "1A", away: "2B", result: null },
      { match: "R16-2", home: "1C", away: "2D", result: null },
      { match: "R16-3", home: "1E", away: "2F", result: null },
      { match: "R16-4", home: "1G", away: "2H", result: null },
      { match: "R16-5", home: "1B", away: "2A", result: null },
      { match: "R16-6", home: "1D", away: "2C", result: null },
      { match: "R16-7", home: "1F", away: "2E", result: null },
      { match: "R16-8", home: "1H", away: "2G", result: null },
    ],
    quarterFinals: [
      { match: "QF-1", home: "W-R16-1", away: "W-R16-2", result: null },
      { match: "QF-2", home: "W-R16-3", away: "W-R16-4", result: null },
      { match: "QF-3", home: "W-R16-5", away: "W-R16-6", result: null },
      { match: "QF-4", home: "W-R16-7", away: "W-R16-8", result: null },
    ],
    semiFinals: [
      { match: "SF-1", home: "W-QF-1", away: "W-QF-2", result: null },
      { match: "SF-2", home: "W-QF-3", away: "W-QF-4", result: null },
    ],
    final: { match: "FINAL", home: "W-SF-1", away: "W-SF-2", result: null },
  };
}

/**
 * Calculate group standings from fixtures
 * @param {Array} fixtures - Completed group fixtures
 * @param {Array} teams - Teams in the group
 * @returns {Array} sorted standings
 */
export function calculateGroupStandings(fixtures, teams) {
  const standings = {};

  teams.forEach((team) => {
    const id = team._id || team.teamName;
    standings[id] = {
      teamName: team.teamName,
      worldCupTeam: team.worldCupTeam,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    };
  });

  fixtures
    .filter((f) => f.played && f.result)
    .forEach((f) => {
      const home = standings[f.home.teamId];
      const away = standings[f.away.teamId];
      if (!home || !away) return;

      const { homeScore, awayScore } = f.result;
      home.played++;
      away.played++;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.won++;
        home.points += 3;
        away.lost++;
      } else if (homeScore < awayScore) {
        away.won++;
        away.points += 3;
        home.lost++;
      } else {
        home.drawn++;
        away.drawn++;
        home.points++;
        away.points++;
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    });

  return Object.values(standings).sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor,
  );
}
