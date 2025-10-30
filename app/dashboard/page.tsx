'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Lock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalLeagues: number;
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  publicLeagues: number;
  privateLeagues: number;
  publicTeams: number;
  privateTeams: number;
  publicPlayers: number;
  privatePlayers: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    publicLeagues: 0,
    privateLeagues: 0,
    publicTeams: 0,
    privateTeams: 0,
    publicPlayers: 0,
    privatePlayers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // 전체 통계
      const [leaguesResult, teamsResult, playersResult, matchesResult] = await Promise.all([
        supabase.from('leagues').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('matches').select('*'),
      ]);

      const leagues = leaguesResult.data || [];
      const teams = teamsResult.data || [];
      const players = playersResult.data || [];
      const matches = matchesResult.data || [];

      setStats({
        totalLeagues: leagues.length,
        totalTeams: teams.length,
        totalPlayers: players.length,
        totalMatches: matches.length,
        publicLeagues: leagues.filter(l => l.is_public).length,
        privateLeagues: leagues.filter(l => !l.is_public).length,
        publicTeams: teams.filter(t => t.is_public).length,
        privateTeams: teams.filter(t => !t.is_public).length,
        publicPlayers: players.filter(p => p.is_public).length,
        privatePlayers: players.filter(p => !p.is_public).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>이 페이지에 접근하려면 로그인이 필요합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/login">로그인하기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">관리자 대시보드</h1>
            <p className="text-gray-600 dark:text-gray-300">
              안녕하세요, {user.user_metadata?.username || user.email}님!
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              새로 만들기
            </Button>
          </div>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 리그</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeagues}</div>
              <p className="text-xs text-muted-foreground">
                공개: {stats.publicLeagues} | 비공개: {stats.privateLeagues}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 팀</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                공개: {stats.publicTeams} | 비공개: {stats.privateTeams}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 선수</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                공개: {stats.publicPlayers} | 비공개: {stats.privatePlayers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 경기</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground">이번 시즌</p>
            </CardContent>
          </Card>
        </div>

        {/* 공개/비공개 비율 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">리그 공개 비율</CardTitle>
              <CardDescription>전체 리그 중 공개/비공개 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">공개</span>
                  </div>
                  <span className="font-semibold">{stats.publicLeagues}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalLeagues > 0 ? (stats.publicLeagues / stats.totalLeagues) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">비공개</span>
                  </div>
                  <span className="font-semibold">{stats.privateLeagues}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">팀 공개 비율</CardTitle>
              <CardDescription>전체 팀 중 공개/비공개 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">공개</span>
                  </div>
                  <span className="font-semibold">{stats.publicTeams}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalTeams > 0 ? (stats.publicTeams / stats.totalTeams) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">비공개</span>
                  </div>
                  <span className="font-semibold">{stats.privateTeams}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">선수 공개 비율</CardTitle>
              <CardDescription>전체 선수 중 공개/비공개 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">공개</span>
                  </div>
                  <span className="font-semibold">{stats.publicPlayers}명</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalPlayers > 0 ? (stats.publicPlayers / stats.totalPlayers) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">비공개</span>
                  </div>
                  <span className="font-semibold">{stats.privatePlayers}명</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/leagues/create">
                  <Trophy className="h-6 w-6" />
                  <span>새 리그 만들기</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/teams/create">
                  <Users className="h-6 w-6" />
                  <span>새 팀 만들기</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/players/create">
                  <BarChart3 className="h-6 w-6" />
                  <span>선수 등록</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/matches">
                  <Calendar className="h-6 w-6" />
                  <span>경기 관리</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
