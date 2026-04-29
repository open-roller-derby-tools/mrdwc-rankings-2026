export interface Game {
  id: number;
  home_team: number;
  away_team: number;
  home_score: number | null;
  away_score: number | null;
  state: string | null;
}

export interface GroupInfo {
  id: number;
  number: number;
}

export interface TeamInfo {
  id: number;
  name: string | null;
  logo: string | null;
  flag: string | null;
  name_letters: string | null;
  schedule_color: string | null;
  group_id: number | null;
}

export interface TeamStanding {
  rank: number;
  team_id: number;
  group_number: number | null;
  team_name: string | null;
  team_logo: string | null;
  team_flag: string | null;
  name_letters: string | null;
  schedule_color: string | null;
  played: number;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  differential: number;
  adjusted_differential: number;
}

export interface GroupStanding {
  group_number: number;
  standings: TeamStanding[];
}

export interface RankingsResponse {
  group_standings: GroupStanding[];
  overall_rankings: TeamStanding[];
}
