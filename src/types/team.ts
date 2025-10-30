export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  color?: string;
  formation: string;
  userId?: string;
  players: Array<{
    id: string;
    name: string;
    number: number;
    position: string;
    photoUrl?: string;
    x: number;
    y: number;
  }>;
}

