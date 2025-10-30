// 라인업 관련 타입 정의
export interface LineupPlayer {
  player_id: string;
  name: string;
  number?: number;
  role?: string;
  position: { x: number; y: number };
  photoUrl?: string;
}

export interface Lineup {
  id: string;
  teamId: string;
  formation: string;
  createdAt: string;
  data: {
    players: Array<{ id: string; x: number; y: number }>;
    arrows?: Array<{ from: {x:number, y:number}, to:{x:number, y:number} }>;
    notes?: string;
  };
}

export type FormationType = '4-4-2' | '4-3-3' | '3-4-3' | '4-5-1' | '5-4-1' | '3-5-2';

