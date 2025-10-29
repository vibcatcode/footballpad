import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Season, Match, TeamStats, PlayerStats } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅 함수
export function formatDateSlash(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit'
  });
}

// 라운드를 주차로 변환
export function roundToWeek(roundCode: string): string {
  const match = roundCode.match(/R(\d+)/);
  if (match) {
    const roundNum = parseInt(match[1]);
    return `${roundNum}주차`;
  }
  return roundCode;
}

// 순위에 따른 메달 이모지
export function medalFor(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
}

// 선수 통계 계산
export function computePlayerStats(season: Season): PlayerStats[] {
  const playerMap = new Map<string, PlayerStats>();
  
  // TODO: MatchEvent에서 득점 정보를 가져와야 함
  // 현재는 빈 배열 반환
  season.matches.forEach(match => {
    // 향후 MatchEvent를 통해 득점 정보 처리
  });
  
  return Array.from(playerMap.values()).sort((a, b) => b.points - a.points);
}

// 팀 순위 계산
export function computeStandings(season: Season, teams: any[]): TeamStats[] {
  const teamMap = new Map<string, TeamStats>();
  
  // 팀 초기화
  teams.forEach(team => {
    teamMap.set(team.id, {
      teamId: team.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0
    });
  });
  
  // 경기 결과 처리
  season.matches.forEach(match => {
    if (match.homeScore !== null && match.awayScore !== null) {
      const homeStats = teamMap.get(match.homeTeamId);
      const awayStats = teamMap.get(match.awayTeamId);
      
      if (homeStats && awayStats) {
        // 경기 수 증가
        homeStats.played++;
        awayStats.played++;
        
        // 골 수 업데이트
        homeStats.goalsFor += match.homeScore;
        homeStats.goalsAgainst += match.awayScore;
        awayStats.goalsFor += match.awayScore;
        awayStats.goalsAgainst += match.homeScore;
        
        // 승부 결정
        if (match.homeScore > match.awayScore) {
          homeStats.won++;
          awayStats.lost++;
          homeStats.points += 3;
        } else if (match.homeScore < match.awayScore) {
          homeStats.lost++;
          awayStats.won++;
          awayStats.points += 3;
        } else {
          homeStats.drawn++;
          awayStats.drawn++;
          homeStats.points += 1;
          awayStats.points += 1;
        }
      }
    }
  });
  
  // 골득실차 계산
  teamMap.forEach(stats => {
    stats.goalDiff = stats.goalsFor - stats.goalsAgainst;
  });
  
  // 순위 정렬 (승점 > 골득실차 > 다득점)
  return Array.from(teamMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });
}

// 토큰 리스트 파싱
export function parseTokenList(str: string): string[] {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}
