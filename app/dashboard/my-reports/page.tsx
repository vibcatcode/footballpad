'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, UserIcon, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyStats();
    }
  }, [user]);

  const fetchMyStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 내가 만든 리그
      const { data: leagues } = await supabase
        .from('leagues')
        .select('id', { count: 'exact', head: true })
        .eq('created_by', user.id);

      // 내가 만든 팀
      const { data: teams } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', user.id);

      const userTeamIds = teams?.map(t => t.id) || [];

      // 내 팀에 속한 선수
      let playersCount = 0;
      if (userTeamIds.length > 0) {
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .in('team_id', userTeamIds);
        playersCount = count || 0;
      }

      // 내 팀이 참여한 경기
      let matchesCount = 0;
      if (userTeamIds.length > 0) {
        const { count } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .or(`home_team_id.in.(${userTeamIds.join(',')}),away_team_id.in.(${userTeamIds.join(',')})`);
        matchesCount = count || 0;
      }

      setStats({
        totalLeagues: leagues?.length || 0,
        totalTeams: teams?.length || 0,
        totalPlayers: playersCount,
        totalMatches: matchesCount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">내 통계</h2>
        <p className="text-muted-foreground">내가 만든 리그, 팀, 선수, 경기의 통계를 확인합니다</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 리그</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeagues}</div>
            <p className="text-xs text-muted-foreground">
              내가 만든 리그 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 팀</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              내가 만든 팀 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 선수</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">
              내 팀에 속한 선수 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 경기</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              내 팀이 참여한 경기 수
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>리그 순위</CardTitle>
            <CardDescription>내 리그의 순위를 확인합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/my-leagues">리그 순위 보기</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>선수 랭킹</CardTitle>
            <CardDescription>내 선수의 랭킹을 확인합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/my-players">선수 랭킹 보기</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>경기 리포트</CardTitle>
            <CardDescription>내 경기의 리포트를 확인합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/my-matches">경기 리포트 보기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

