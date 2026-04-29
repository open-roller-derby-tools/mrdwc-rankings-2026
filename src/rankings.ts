import type { Game, TeamInfo, TeamStanding } from './types';

const FINISHED_STATE = 'finished';

export function computeTeamStats(
  teamId: number,
  games: Game[],
  groupNumber: number | null,
  teamInfo: Map<number, TeamInfo>,
): TeamStanding {
  let wins = 0;
  let losses = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;
  let biggestLoss = 0;

  for (const game of games) {
    if (game.state !== FINISHED_STATE) continue;

    const isHome = game.home_team === teamId;
    const isAway = game.away_team === teamId;

    if (!isHome && !isAway) continue;

    const teamScore = isHome ? (game.home_score ?? 0) : (game.away_score ?? 0);
    const opponentScore = isHome
      ? (game.away_score ?? 0)
      : (game.home_score ?? 0);

    pointsFor += teamScore;
    pointsAgainst += opponentScore;

    if (teamScore > opponentScore) {
      wins++;
    } else if (teamScore < opponentScore) {
      losses++;
      const lossMargin = opponentScore - teamScore;
      if (lossMargin > biggestLoss) biggestLoss = lossMargin;
    }
  }

  const differential = pointsFor - pointsAgainst;
  const info = teamInfo.get(teamId);

  return {
    rank: 0,
    team_id: teamId,
    group_number: groupNumber,
    team_name: info?.name ?? null,
    team_logo: info?.logo ?? null,
    team_flag: info?.flag ?? null,
    name_letters: info?.name_letters ?? null,
    schedule_color: info?.schedule_color ?? null,
    played: wins + losses,
    wins,
    losses,
    points_for: pointsFor,
    points_against: pointsAgainst,
    differential,
    adjusted_differential: differential + biggestLoss,
  };
}

export function getHeadToHeadWins(
  teamA: number,
  teamB: number,
  games: Game[],
): number {
  let wins = 0;
  for (const game of games) {
    if (game.state !== FINISHED_STATE) continue;

    const aIsHome = game.home_team === teamA && game.away_team === teamB;
    const aIsAway = game.away_team === teamA && game.home_team === teamB;

    if (!aIsHome && !aIsAway) continue;

    const teamScore = aIsHome ? (game.home_score ?? 0) : (game.away_score ?? 0);
    const opponentScore = aIsHome
      ? (game.away_score ?? 0)
      : (game.home_score ?? 0);

    if (teamScore > opponentScore) wins++;
  }
  return wins;
}

export function getGamesForGroup(
  groupNumber: number,
  games: Game[],
  teamToGroup: Map<number, number | null>,
): Game[] {
  return games.filter((game) => {
    const homeGroup = teamToGroup.get(game.home_team);
    const awayGroup = teamToGroup.get(game.away_team);
    return homeGroup === groupNumber && awayGroup === groupNumber;
  });
}

export function sortGroupStandings(
  standings: TeamStanding[],
  games: Game[],
): TeamStanding[] {
  return standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.adjusted_differential !== a.adjusted_differential)
      return b.adjusted_differential - a.adjusted_differential;
    const aH2H = getHeadToHeadWins(a.team_id, b.team_id, games);
    const bH2H = getHeadToHeadWins(b.team_id, a.team_id, games);
    return bH2H - aH2H;
  });
}

export function sortOverallStandings(
  standings: TeamStanding[],
): TeamStanding[] {
  return standings.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.adjusted_differential !== a.adjusted_differential)
      return b.adjusted_differential - a.adjusted_differential;
    return b.differential - a.differential;
  });
}

export function assignRanks(standings: TeamStanding[]): void {
  for (let i = 0; i < standings.length; i++) {
    standings[i].rank = i + 1;
  }
}
