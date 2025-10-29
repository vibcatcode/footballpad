// 데이터 저장/로드 유틸리티

import { League, Team, Season, Match } from '@/types';

const STORAGE_KEY = 'footballpad_leagues';

export function getAllLeagues(): League[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveLeague(league: League): void {
  const leagues = getAllLeagues();
  const index = leagues.findIndex(l => l.id === league.id);
  if (index >= 0) {
    leagues[index] = league;
  } else {
    leagues.push(league);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leagues));
}

export function getLeague(id: string): League | null {
  const leagues = getAllLeagues();
  return leagues.find(l => l.id === id) || null;
}

export function deleteLeague(id: string): void {
  const leagues = getAllLeagues();
  const filtered = leagues.filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
