import { create } from 'zustand';
import type { Lineup, LineupPlayer } from '../types/lineup';
import { supabase } from '../lib/supabaseClient';

interface LineupBuilderState {
  formation: string;
  players: LineupPlayer[];
  selectedPlayerId?: string;
  setFormation: (formation: string) => void;
  addPlayer: (p: LineupPlayer) => void;
  updatePlayer: (player_id: string, partial: Partial<LineupPlayer>) => void;
  removePlayer: (player_id: string) => void;
  selectPlayer: (player_id?: string) => void;
  clear: () => void;
  // Supabase 연동 추가
  saveLineupToDB: (teamId: string, createdBy: string) => Promise<any>;
  loadLineupFromDB: (lineupId: string) => Promise<any>;
}

export const useLineupBuilderStore = create<LineupBuilderState>((set, get) => ({
  formation: '4-4-2',
  players: [],
  selectedPlayerId: undefined,
  setFormation: (formation) => set({ formation }),
  addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
  updatePlayer: (player_id, partial) => set((s) => ({ players: s.players.map(p=>p.player_id===player_id?{...p,...partial}:p) })),
  removePlayer: (player_id) => set((s) => ({ players: s.players.filter(p=>p.player_id!==player_id) })),
  selectPlayer: (player_id) => set({ selectedPlayerId: player_id }),
  clear: () => set({ players: [], selectedPlayerId: undefined }),
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
}));
