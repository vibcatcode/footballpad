'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, UserIcon, Calendar, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const SUPER_ADMIN_EMAILS: readonly string[] = ['geedojo@gmail.com'];

export default function MyReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    totalLineups: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const isSuperAdminEmail = (email?: string | null) =>
    !!email && SUPER_ADMIN_EMAILS.includes(email);

  const isSuperAdmin = useMemo(
    () => isSuperAdminEmail(user?.email) || profile?.role === 'admin',
    [user?.email, profile?.role]
  );

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && profile) {
      fetchStats();
    }
  }, [user, profile, isSuperAdmin]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, full_name, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (!isSuperAdminEmail(user.email)) {
          setLoading(false);
          return;
        }
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      let leaguesQuery = supabase.from('leagues').select('*', { count: 'exact', head: true });
      let teamsQuery = supabase.from('teams').select('*', { count: 'exact', head: true });
      let playersQuery = supabase.from('players').select('*', { count: 'exact', head: true });
      let matchesQuery = supabase.from('matches').select('*', { count: 'exact', head: true });
      let lineupsQuery = supabase.from('lineups').select('*', { count: 'exact', head: true });

      // 최고 관리자가 아니면 자신이 만든/소속된 항목만 조회
      if (!isSuperAdmin) {
        // 자신이 만든 리그
        leaguesQuery = leaguesQuery.eq('created_by', user.id);
        
        // 자신이 만든 팀
        teamsQuery = teamsQuery.eq('created_by', user.id);
        
        // 자신이 만든 팀의 ID 목록 가져오기
        const { data: userTeams } = await supabase
          .from('teams')
          .select('id')
          .eq('created_by', user.id);
        
        const userTeamIds = userTeams?.map(t => t.id) || [];
        
        // 자신이 만든 팀에 속한 선수들
        if (userTeamIds.length > 0) {
          playersQuery = playersQuery.in('team_id', userTeamIds);
        } else {
          // 팀이 없으면 빈 결과
          playersQuery = playersQuery.eq('team_id', '00000000-0000-0000-0000-000000000000');
        }
        
        // 자신이 만든 팀이 참여한 경기들
        if (userTeamIds.length > 0) {
          matchesQuery = matchesQuery.or(
            `home_team_id.in.(${userTeamIds.join(',')}),away_team_id.in.(${userTeamIds.join(',')})`
          );
        } else {
          matchesQuery = matchesQuery.eq('home_team_id', '00000000-0000-0000-0000-000000000000');
        }

        // 자신이 만든 전술
        lineupsQuery = lineupsQuery.eq('created_by', user.id);
      }

      // 전체 통계
      const [leaguesResult, teamsResult, playersResult, matchesResult, lineupsResult] = await Promise.all([
        leaguesQuery,
        teamsQuery,
        playersQuery,
        matchesQuery,
        lineupsQuery,
      ]);

      setStats({
        totalLeagues: leaguesResult.count || 0,
        totalTeams: teamsResult.count || 0,
        totalPlayers: playersResult.count || 0,
        totalMatches: matchesResult.count || 0,
        totalLineups: lineupsResult.count || 0,
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{isSuperAdmin ? '모든 통계 관리' : '내 통계'}</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? '사이트의 모든 사용자가 생성한 리그, 팀, 선수, 경기, 전술의 통계를 확인합니다'
              : '내가 만든 리그, 팀, 선수, 경기의 통계를 확인합니다'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isSuperAdmin ? '전체 리그' : '내 리그'}</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeagues}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? '전체 리그 수' : '내가 만든 리그 수'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isSuperAdmin ? '전체 팀' : '내 팀'}</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? '전체 팀 수' : '내가 만든 팀 수'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isSuperAdmin ? '전체 선수' : '내 선수'}</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? '전체 선수 수' : '내 팀에 속한 선수 수'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isSuperAdmin ? '전체 경기' : '내 경기'}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? '전체 경기 수' : '내 팀이 참여한 경기 수'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isSuperAdmin ? '전체 전술' : '내 전술'}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLineups}</div>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? '전체 전술 수' : '내가 만든 전술 수'}
            </p>
          </CardContent>
        </Card>
      </div>

      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>리그 관리</CardTitle>
              <CardDescription>모든 리그를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/my-leagues">리그 관리하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>팀 관리</CardTitle>
              <CardDescription>모든 팀을 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/my-teams">팀 관리하기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>선수 관리</CardTitle>
              <CardDescription>모든 선수를 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/my-players">선수 관리하기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!isSuperAdmin && (
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
      )}
    </div>
  );
}
