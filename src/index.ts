import type { Request, Response } from 'express';
import type {
  Game,
  TeamInfo,
  TeamStanding,
  GroupStanding,
  RankingsResponse,
} from './types';
import {
  computeTeamStats,
  getGamesForGroup,
  sortGroupStandings,
  sortOverallStandings,
  assignRanks,
} from './rankings';

export default {
  id: 'rankings',
  handler: (
    router: any,
    {
      services,
      database,
      getSchema,
    }: { services: any; database: any; getSchema: any },
  ) => {
    const { ItemsService } = services;

    router.get('/', async (req: Request, res: Response) => {
      const schema = await getSchema();

      const groupsService = new ItemsService('tournament_groups', {
        schema,
        knex: database,
      });
      const teamsService = new ItemsService('teams', {
        schema,
        knex: database,
      });
      const gamesService = new ItemsService('games', {
        schema,
        knex: database,
      });

      // Fetch all data
      const [groups, teams, games] = await Promise.all([
        groupsService.readByQuery({
          fields: ['id', 'number'],
          sort: ['number'],
        }),
        teamsService.readByQuery({
          fields: [
            'id',
            'name',
            'logo',
            'flag',
            'name_letters',
            'schedule_color',
            'group_id',
          ],
        }),
        gamesService.readByQuery({
          fields: [
            'id',
            'home_team',
            'away_team',
            'home_score',
            'away_score',
            'state',
          ],
        }),
      ]);

      // Build mappings
      const groupIdToNumber = new Map<number, number>();
      for (const group of groups) {
        groupIdToNumber.set(group.id, group.number);
      }

      const teamToGroupNumber = new Map<number, number | null>();
      const teamInfoMap = new Map<number, TeamInfo>();

      for (const team of teams) {
        const groupNumber = team.group_id
          ? (groupIdToNumber.get(team.group_id) ?? null)
          : null;
        teamToGroupNumber.set(team.id, groupNumber);
        teamInfoMap.set(team.id, {
          id: team.id,
          name: team.name,
          logo: team.logo,
          flag: team.flag,
          name_letters: team.name_letters,
          schedule_color: team.schedule_color,
          group_id: team.group_id,
        });
      }

      // ── Compute Group Standings ──
      const groupStandings: GroupStanding[] = [];

      for (const group of groups) {
        const groupGames = getGamesForGroup(
          group.number,
          games,
          teamToGroupNumber,
        );
        const groupTeamIds = teams
          .filter((t: TeamInfo) => t.group_id === group.id)
          .map((t: TeamInfo) => t.id);

        const standings: TeamStanding[] = sortGroupStandings(
          groupTeamIds.map((teamId: number) =>
            computeTeamStats(teamId, groupGames, group.number, teamInfoMap),
          ),
          groupGames,
        );

        assignRanks(standings);

        groupStandings.push({
          group_number: group.number,
          standings,
        });
      }

      // ── Compute Overall Rankings ──
      const overallStandings: TeamStanding[] = [];

      for (const group of groups) {
        const groupGames = getGamesForGroup(
          group.number,
          games,
          teamToGroupNumber,
        );
        const groupTeamIds = teams
          .filter((t: TeamInfo) => t.group_id === group.id)
          .map((t: TeamInfo) => t.id);

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

      const response: RankingsResponse = {
        group_standings: groupStandings,
        overall_rankings: overallStandings,
      };

      res.json(response);
    });
  },
};
