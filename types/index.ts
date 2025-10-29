// 리그/팀 관리 데이터 타입 정의

export interface Team {
  id: string;
  name: string;
  color: 'white' | 'blue' | 'red' | 'green' | 'yellow' | 'purple';
  description?: string;
}

export interface Round {
  code: string; // R1, R2, R3...
  date: string; // YYYY-MM-DD
}

export interface Match {
  id: string;
  round: string;
  game_no: number;
  home: string; // team id
  away: string; // team id
  homeScore: number | null;
  awayScore: number | null;
  youtube?: string;
  scorers?: string; // "선수1, 선수2(2), 선수3"
  assists?: string;
}

export interface Season {
  id: string;
  leagueId: string;
  label: string; // "2025년 1월"
  yearMonth: string; // "2025-01"
  teamColors: Record<string, string>; // { teamId: color }
  rounds: Round[];
  matches: Match[];
}

export interface League {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  teamIds: string[];
  seasonIds: string[];
}

export interface PlayerStats {
  name: string;
  goals: number;
  assists: number;
  points: number; // goals + assists
}

export interface TeamStats {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

