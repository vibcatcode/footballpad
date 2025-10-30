import { create } from 'zustand';
import type { Lineup, LineupPlayer } from '../types/lineup';
import { supabase } from '@/lib/supabase';

// 0~1 비율 좌표 프리셋 (GK 포함 최대 11명 순서대로)
const FORMATION_PRESETS: Record<string, Array<{ x: number; y: number }>> = {
  '4-4-2': [
    { x: 0.5, y: 0.92 }, // GK
    { x: 0.18, y: 0.78 }, { x: 0.35, y: 0.78 }, { x: 0.65, y: 0.78 }, { x: 0.82, y: 0.78 }, // DF
    { x: 0.22, y: 0.60 }, { x: 0.38, y: 0.60 }, { x: 0.62, y: 0.60 }, { x: 0.78, y: 0.60 }, // MF
    { x: 0.38, y: 0.38 }, { x: 0.62, y: 0.38 }, // FW
  ],
  '4-3-3': [
    { x: 0.5, y: 0.92 },
    { x: 0.18, y: 0.78 }, { x: 0.35, y: 0.78 }, { x: 0.65, y: 0.78 }, { x: 0.82, y: 0.78 },
    { x: 0.30, y: 0.58 }, { x: 0.5, y: 0.56 }, { x: 0.70, y: 0.58 },
    { x: 0.22, y: 0.34 }, { x: 0.5, y: 0.30 }, { x: 0.78, y: 0.34 },
  ],
  '3-5-2': [
    { x: 0.5, y: 0.92 },
    { x: 0.3, y: 0.78 }, { x: 0.5, y: 0.76 }, { x: 0.7, y: 0.78 },
    { x: 0.2, y: 0.58 }, { x: 0.35, y: 0.54 }, { x: 0.5, y: 0.52 }, { x: 0.65, y: 0.54 }, { x: 0.8, y: 0.58 },
    { x: 0.4, y: 0.34 }, { x: 0.6, y: 0.34 },
  ],
};

interface Team {
  id: string;
  name: string;
  logo_url?: string;
  created_by?: string;
}

interface Player {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';
  status: 'active' | 'injured' | 'suspended' | 'inactive';
}

interface LineupBuilderState {
  formation: string;
  players: LineupPlayer[];
  selectedPlayerId?: string;
  selectedTeamId?: string;
  teams: Team[];
  setFormation: (formation: string) => void;
  addPlayer: (p: LineupPlayer) => void;
  updatePlayer: (player_id: string, partial: Partial<LineupPlayer>) => void;
  removePlayer: (player_id: string) => void;
  selectPlayer: (player_id?: string) => void;
  clear: () => void;
  // 포메이션 템플릿 적용
  applyFormationPreset: (formation: string) => void;
  // Supabase 연동
  saveLineupToDB: (teamId: string, createdBy: string) => Promise<any>;
  loadLineupFromDB: (lineupId: string) => Promise<any>;
  // 팀 및 선수 불러오기
  loadUserTeams: (userId: string) => Promise<void>;
  loadTeamPlayers: (teamId: string) => Promise<void>;
  setSelectedTeamId: (teamId: string | undefined) => void;
}

export const useLineupBuilderStore = create<LineupBuilderState>((set, get) => ({
  formation: '4-4-2',
  players: [],
  selectedPlayerId: undefined,
  selectedTeamId: undefined,
  teams: [],
  setFormation: (formation) => set({ formation }),
  addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
  updatePlayer: (player_id, partial) => set((s) => ({ players: s.players.map(p=>p.player_id===player_id?{...p,...partial}:p) })),
  removePlayer: (player_id) => set((s) => ({ players: s.players.filter(p=>p.player_id!==player_id) })),
  selectPlayer: (player_id) => set({ selectedPlayerId: player_id }),
  clear: () => set({ players: [], selectedPlayerId: undefined }),
  applyFormationPreset: (formation) => {
    const preset = FORMATION_PRESETS[formation];
    if (!preset) return;
    const { players } = get();
    const updated = players.map((p, idx) => ({
      ...p,
      position: preset[idx] ? { x: preset[idx].x, y: preset[idx].y } : p.position
    }));
    set({ formation, players: updated });
  },
  saveLineupToDB: async (teamId, createdBy) => {
    const { formation, players } = get();
    const { data, error } = await supabase.from('lineups').insert([
      {
        team_id: teamId,
        formation,
        players: players,
        created_by: createdBy,
        is_shared: false,
      }
    ]).select();
    if(error) throw error;
    return data?.[0];
  },
  loadLineupFromDB: async (lineupId) => {
    const { data, error } = await supabase
      .from('lineups')
      .select('*')
      .eq('lineup_id', lineupId)
      .single();
    if(error) throw error;
    set({ formation: data.formation, players: data.players });
    return data;
  },
  loadUserTeams: async (userId) => {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if(error) throw error;
    set({ teams: data || [] });
  },
  loadTeamPlayers: async (teamId) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'active')
      .order('jersey_number', { ascending: true, nullsFirst: false });
    if(error) throw error;
    
    // DB 선수를 LineupPlayer로 변환
    const lineupPlayers: LineupPlayer[] = (data || []).map(player => ({
      player_id: player.id,
      name: `${player.first_name} ${player.last_name}`,
      number: player.jersey_number || undefined,
      role: player.position,
      position: { x: 0.5, y: 0.5 }, // 기본 중앙 위치
    }));
    
    set({ players: lineupPlayers, selectedTeamId: teamId });
  },
  setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),
}));
