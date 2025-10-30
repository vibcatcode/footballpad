// 라인업, 팀, 선수의 타입 정의
export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  photoUrl?: string;
  x: number;
  y: number;
}

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  color?: string;
  formation: string;
  userId?: string;
  players: Player[];
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
