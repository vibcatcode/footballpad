import { create } from 'zustand';
import type { Lineup, LineupPlayer } from '../types/lineup';
import { supabase } from '@/lib/supabase';

// 포메이션별 포지션 맵핑 (등번호, 역할, 좌표)
const FORMATION_PRESETS: Record<string, Array<{ number: number; role: string; x: number; y: number }>> = {
  '4-4-2': [
    { number: 1, role: 'GK', x: 0.5, y: 0.92 }, // GK
    { number: 2, role: 'RB', x: 0.82, y: 0.78 }, // RB
    { number: 3, role: 'LB', x: 0.18, y: 0.78 }, // LB
    { number: 4, role: 'CB', x: 0.65, y: 0.78 }, // CB
    { number: 5, role: 'CB', x: 0.35, y: 0.78 }, // CB
    { number: 6, role: 'CM', x: 0.38, y: 0.60 }, // CM
    { number: 7, role: 'RM', x: 0.78, y: 0.60 }, // RM
    { number: 8, role: 'CM', x: 0.62, y: 0.60 }, // CM
    { number: 11, role: 'LM', x: 0.22, y: 0.60 }, // LM
    { number: 9, role: 'ST', x: 0.38, y: 0.38 }, // ST
    { number: 10, role: 'ST', x: 0.62, y: 0.38 }, // ST
  ],
  '4-3-3': [
    { number: 1, role: 'GK', x: 0.5, y: 0.92 },
    { number: 2, role: 'RB', x: 0.82, y: 0.78 },
    { number: 3, role: 'LB', x: 0.18, y: 0.78 },
    { number: 4, role: 'CB', x: 0.65, y: 0.78 },
    { number: 5, role: 'CB', x: 0.35, y: 0.78 },
    { number: 6, role: 'CM', x: 0.70, y: 0.58 },
    { number: 8, role: 'CM', x: 0.5, y: 0.56 },
    { number: 10, role: 'CAM', x: 0.30, y: 0.58 },
    { number: 7, role: 'RW', x: 0.78, y: 0.34 },
    { number: 9, role: 'ST', x: 0.5, y: 0.30 },
    { number: 11, role: 'LW', x: 0.22, y: 0.34 },
  ],
  '3-5-2': [
    { number: 1, role: 'GK', x: 0.5, y: 0.92 },
    { number: 4, role: 'CB', x: 0.7, y: 0.78 },
    { number: 5, role: 'CB', x: 0.5, y: 0.76 },
    { number: 3, role: 'CB', x: 0.3, y: 0.78 },
    { number: 7, role: 'RM', x: 0.8, y: 0.58 },
    { number: 6, role: 'CDM', x: 0.5, y: 0.52 },
    { number: 8, role: 'CDM', x: 0.35, y: 0.54 },
    { number: 10, role: 'CM', x: 0.65, y: 0.54 },
    { number: 11, role: 'LM', x: 0.2, y: 0.58 },
    { number: 9, role: 'ST', x: 0.4, y: 0.34 },
    { number: 20, role: 'ST', x: 0.6, y: 0.34 },
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
    
    // 포메이션에 맞게 선수 생성 (또는 기존 선수 업데이트)
    const newPlayers: LineupPlayer[] = preset.map(presetItem => {
      // 기존 선수 중 같은 등번호를 가진 선수 찾기
      const existingPlayer = get().players.find(p => p.number === presetItem.number);
      
      if (existingPlayer) {
        // 기존 선수 업데이트 (포지션과 역할만 변경)
        return {
          ...existingPlayer,
          role: presetItem.role,
          position: { x: presetItem.x, y: presetItem.y }
        };
      } else {
        // 새 선수 생성 (이름 없음)
        return {
          player_id: `temp_${presetItem.number}_${Date.now()}`,
          name: '', // 이름은 비워둠
          number: presetItem.number,
          role: presetItem.role,
          position: { x: presetItem.x, y: presetItem.y }
        };
      }
    });
    
    set({ formation, players: newPlayers });
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
