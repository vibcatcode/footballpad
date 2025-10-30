import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Player, Lineup, Team } from '../types';

interface LineupState {
  teamName: string;
  logoUrl?: string;
  players: Player[];
  formation: string;
  addPlayer: (p: Player) => void;
  removePlayer: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  setFormation: (formation: string) => void;
  setTeamName: (name: string) => void;
  setLogoUrl: (url: string) => void;
  reset: () => void;
  saveTeamToDB: () => Promise<any>;
  loadTeamFromDB: (teamId: string) => Promise<any>;
  saveLineupToDB: () => Promise<any>;
  loadLineupFromDB: (lineupId: string) => Promise<any>;
}

export const useLineupStore = create<LineupState>((set, get) => ({
  teamName: 'My FC',
  logoUrl: undefined,
  players: [],
  formation: '4-3-3',
  addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
  removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  updatePosition: (id, x, y) => set((s) => ({
    players: s.players.map((p) => p.id === id ? { ...p, x, y } : p),
  })),
  setFormation: (formation) => set({ formation }),
  setTeamName: (teamName) => set({ teamName }),
  setLogoUrl: (url) => set({ logoUrl: url }),
  reset: () => set({ players: [], formation: '4-3-3', teamName: 'My FC', logoUrl: undefined }),
  saveTeamToDB: async () => {
    const { teamName, logoUrl, formation, players } = get();
    // 컬럼명 snake_case로 맞춤
    const { data, error } = await supabase.from('teams').insert([{
      name: teamName,
      logo_url: logoUrl,
      formation,
      // user_id: ...(로그인 시 연동)
    }]).select();
    if (error) throw error;
    const teamId = data?.[0]?.id;
    if (teamId && players.length > 0) {
      await supabase.from('players').insert(players.map(p => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        photo_url: p.photoUrl || null,
        x: p.x,
        y: p.y,
        team_id: teamId
      })));
    }
    return data?.[0];
  },
  loadTeamFromDB: async (teamId: string) => {
    const { data: team, error: err1 } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (err1) throw err1;
    const { data: players, error: err2 } = await supabase.from('players').select('*').eq('team_id', teamId);
    if (err2) throw err2;
    set({
      teamName: team.name,
      logoUrl: team.logo_url,
      formation: team.formation,
      players: (players || []).map(p => ({
        id: p.id,
        name: p.name,
        number: p.number,
        position: p.position,
        photoUrl: p.photo_url,
        x: p.x,
        y: p.y
      }))
    });
    return { team, players };
  },
  saveLineupToDB: async () => {
    const { players, formation } = get();
    const { data, error } = await supabase.from('lineups').insert([{
      formation,
      data: { players: players.map(p => ({ id: p.id, x: p.x, y: p.y })) }
    }]).select();
    if (error) throw error;
    return data?.[0];
  },
  loadLineupFromDB: async (lineupId: string) => {
    const { data: lineup, error } = await supabase.from('lineups').select('*').eq('id', lineupId).single();
    if (error) throw error;
    set((state) => ({
      formation: lineup.formation,
      players: state.players.map(player => {
        const np = lineup.data.players.find((p: any) => p.id === player.id);
        return np ? { ...player, ...np } : player;
      })
    }));
    return lineup;
  }
}));
