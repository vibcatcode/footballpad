// 풋볼패드 데이터 타입 정의

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'coach' | 'captain' | 'player' | 'referee' | 'venue_partner' | 'guest';
  createdAt: string;
  lastLoginAt?: string;
}

export interface Club {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  timezone: string; // 기본: Asia/Phnom_Penh
  createdAt: string;
  ownerId: string;
}

export interface Team {
  id: string;
  clubId: string;
  name: string;
  color: 'white' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'black' | 'orange';
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  eloRating: number; // 매칭용 실력 지수
  preferredDays: string[]; // ['monday', 'tuesday', ...]
  preferredTimes: string[]; // ['morning', 'afternoon', 'evening']
  homeVenueId?: string;
  createdAt: string;
}

export interface Player {
  id: string;
  teamId: string;
  userId?: string; // 로그인 사용자와 연결
  name: string;
  number?: number; // 등번호
  position: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';
  secondaryPositions: string[];
  height?: number; // cm
  weight?: number; // kg
  birthDate?: string;
  joinDate: string;
  status: 'active' | 'injured' | 'suspended' | 'inactive';
  phone?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  profileImage?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  type: 'indoor' | 'outdoor';
  surface: 'grass' | 'artificial' | 'hard' | 'sand';
  capacity?: number;
  facilities: string[]; // ['parking', 'shower', 'locker', 'cafe']
  contactPhone?: string;
  hourlyRate?: number;
  isPartner: boolean;
}

export interface Referee {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  level: 'amateur' | 'semi_pro' | 'professional';
  availability: string[]; // 요일별 가능 시간
  hourlyRate?: number;
  isPartner: boolean;
}

export interface Round {
  code: string; // R1, R2, R3...
  date: string; // YYYY-MM-DD
  name?: string; // "1주차", "준결승" 등
}

export interface Match {
  id: string;
  seasonId: string;
  round: string;
  game_no: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed';
  scheduledAt: string; // ISO datetime
  venueId?: string;
  refereeId?: string;
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  temperature?: number;
  attendance?: number;
  notes?: string;
  youtube?: string;
  highlights?: string[]; // 하이라이트 영상 URL들
  createdAt: string;
  updatedAt: string;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' | 'shot' | 'save' | 'foul' | 'var' | 'penalty';
  playerId?: string;
  teamId: string;
  minute: number;
  extraTime?: number;
  description?: string;
  coordinates?: { x: number; y: number }; // 필드 내 위치
  createdAt: string;
}

export interface Lineup {
  id: string;
  matchId: string;
  teamId: string;
  formation: string; // "4-4-2", "4-3-3" 등
  players: {
    playerId: string;
    position: string;
    isStarter: boolean;
    coordinates: { x: number; y: number }; // 필드 내 위치 (0-100%)
  }[];
  createdAt: string;
}

export interface Season {
  id: string;
  clubId: string;
  name: string; // "2025년 1월 시즌"
  type: 'league' | 'cup' | 'friendly' | 'tournament';
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'finished';
  teams: string[]; // team IDs
  rounds: Round[];
  matches: Match[];
  settings: {
    pointsForWin: number; // 기본 3
    pointsForDraw: number; // 기본 1
    maxPlayersPerTeam: number;
    allowSubstitutions: boolean;
    extraTime: boolean;
    penalties: boolean;
  };
  createdAt: string;
}

export interface Competition {
  id: string;
  clubId: string;
  name: string;
  description?: string;
  type: 'league' | 'cup' | 'tournament';
  level: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  maxTeams?: number;
  registrationDeadline?: string;
  startDate: string;
  endDate?: string;
  status: 'upcoming' | 'active' | 'finished' | 'cancelled';
  prize?: string;
  rules?: string;
  createdAt: string;
}

export interface MatchMaking {
  id: string;
  requesterTeamId: string;
  targetTeamId?: string; // 특정 팀 요청시
  type: 'friendly' | 'league' | 'cup';
  preferredDate: string;
  preferredTime: string;
  preferredVenueId?: string;
  maxDistance?: number; // km
  level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Training {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // minutes
  venueId?: string;
  coachId?: string;
  attendees: string[]; // player IDs
  drills: {
    name: string;
    duration: number;
    description?: string;
  }[];
  notes?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  playerId: string;
  trainingId?: string;
  matchId?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  reason?: string;
  checkedAt: string;
  checkedBy: string; // user ID
}

export interface Injury {
  id: string;
  playerId: string;
  type: string; // "무릎 인대", "발목 염좌" 등
  severity: 'minor' | 'moderate' | 'severe';
  description?: string;
  occurredAt: string;
  expectedRecoveryDate?: string;
  actualRecoveryDate?: string;
  treatment?: string;
  notes?: string;
  createdAt: string;
}

export interface Media {
  id: string;
  type: 'image' | 'video' | 'highlight';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  matchId?: string;
  playerId?: string;
  teamId?: string;
  tags: string[];
  uploadedBy: string; // user ID
  createdAt: string;
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

// 기존 호환성을 위한 League 타입 (deprecated)
export interface League {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  teamIds: string[];
  seasonIds: string[];
}

