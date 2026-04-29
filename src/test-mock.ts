import { MOCK_GROUPS, MOCK_TEAMS, MOCK_GAMES } from './mock-data';
import {
  computeTeamStats,
  getGamesForGroup,
  sortGroupStandings,
  sortOverallStandings,
  assignRanks,
} from './rankings';

function runMock(): void {
  const groups = MOCK_GROUPS;
  const teams = MOCK_TEAMS;
  const games = MOCK_GAMES;

  console.log(`\n🏆 MRDWC Rankings 2026 — Static Mock Data`);
  console.log(`═══════════════════════════════════════`);
  console.log(
    `Groups: ${groups.length}, Teams: ${teams.length}, Games: ${games.length}`,
  );
  console.log(`All games finished with static pre-generated scores (15–324)\n`);

  const groupIdToNumber = new Map<number, number>();
  for (const group of groups) {
    groupIdToNumber.set(group.id, group.number);
  }

  const teamToGroupNumber = new Map<number, number | null>();
  const teamInfoMap = new Map<number, any>();

  for (const team of teams) {
    const groupNumber = team.group_id
      ? (groupIdToNumber.get(team.group_id) ?? null)
      : null;
    teamToGroupNumber.set(team.id, groupNumber);
    teamInfoMap.set(team.id, team);
  }

  const groupStandings: any[] = [];
  for (const group of groups) {
    const groupGames = getGamesForGroup(group.number, games, teamToGroupNumber);
    const groupTeamIds = teams
      .filter((t: any) => t.group_id === group.id)
      .map((t: any) => t.id);

    const standings = sortGroupStandings(
      groupTeamIds.map((teamId: number) =>
        computeTeamStats(teamId, groupGames, group.number, teamInfoMap),
      ),
      groupGames,
    );
    assignRanks(standings);
    groupStandings.push({ group_number: group.number, standings });
  }

  const overallStandings: any[] = [];
  for (const group of groups) {
    const groupGames = getGamesForGroup(group.number, games, teamToGroupNumber);
    const groupTeamIds = teams
      .filter((t: any) => t.group_id === group.id)
      .map((t: any) => t.id);

    for (const teamId of groupTeamIds) {
      overallStandings.push(
        computeTeamStats(
          teamId,
          groupGames,
          teamToGroupNumber.get(teamId) ?? null,
          teamInfoMap,
        ),
      );
    }
  }
  sortOverallStandings(overallStandings);
  assignRanks(overallStandings);

  const response = {
    group_standings: groupStandings,
    overall_rankings: overallStandings,
  };

  // ── Print Group Standings ──
  for (const gs of response.group_standings) {
    console.log(
      `┌─ Group ${gs.group_number} ─────────────────────────────────────────────────┐`,
    );
    console.log(
      `│ Rank  Team                 W  L   PF    PA   Diff  AdjDiff       │`,
    );
    console.log(
      `│───── ─────────────────── ── ── ───── ───── ───── ────────       │`,
    );
    for (const t of gs.standings) {
      const name = (t.team_name ?? '???').padEnd(21);
      console.log(
        `│  ${t.rank}    ${name} ${String(t.wins).padStart(2)} ${String(t.losses).padStart(2)} ${String(t.points_for).padStart(5)} ${String(t.points_against).padStart(5)} ${String(t.differential).padStart(5)} ${String(t.adjusted_differential).padStart(8)}       │`,
      );
    }
    console.log(
      `└──────────────────────────────────────────────────────────────────┘\n`,
    );
  }

  // ── Print Overall Rankings ──
  console.log(
    `═══ Overall Rankings ════════════════════════════════════════════════`,
  );
  console.log(
    `Rank  Team                 Grp  W  L   PF    PA   Diff  AdjDiff`,
  );
  console.log(`──── ─────────────────── ─── ── ── ───── ───── ───── ────────`);
  for (const t of response.overall_rankings) {
    const name = (t.team_name ?? '???').padEnd(21);
    const grp = String(t.group_number ?? '?').padStart(3);
    console.log(
      ` ${String(t.rank).padStart(3)}  ${name} ${grp} ${String(t.wins).padStart(2)} ${String(t.losses).padStart(2)} ${String(t.points_for).padStart(5)} ${String(t.points_against).padStart(5)} ${String(t.differential).padStart(5)} ${String(t.adjusted_differential).padStart(8)}`,
    );
  }

  // ── Also output raw JSON ──
  console.log(`\n📄 Raw JSON output:\n`);
  console.log(JSON.stringify(response, null, 2));
}

runMock();
