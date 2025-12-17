'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Trophy, Lock, Users, Calendar, AlertCircle } from 'lucide-react';

interface League {
  id: string;
  name: string;
  description: string | null;
  season: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  created_by: string;
  is_public: boolean;
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
  };
}

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLeague();
    }
  }, [params.id, user]);

  const fetchLeague = async () => {
    const leagueId = params.id as string;
    setLoading(true);

    try {
      // 리그 정보 가져오기
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(`
          *,
          creator:users!leagues_created_by_fkey(id, email, username, full_name)
        `)
        .eq('id', leagueId)
        .single();

      if (leagueError) {
        console.error('Error fetching league:', leagueError);
        setLoading(false);
        return;
      }

      if (!leagueData) {
        router.push('/leagues');
        return;
      }

      setLeague(leagueData as League);

      // 권한 체크
      await checkAccess(leagueData as League);
    } catch (error) {
      console.error('Error fetching league:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAccess = async (leagueData: League) => {
    // 공개 리그는 모두 볼 수 있음
    if (leagueData.visibility === 'public' || leagueData.is_public) {
      setHasAccess(true);
      return;
    }

    // 비공개 리그는 권한 체크 필요
    if (!user) {
      setHasAccess(false);
      return;
    }

    // 리그 생성자는 항상 접근 가능
    if (leagueData.created_by === user.id) {
      setHasAccess(true);
      setIsParticipant(true);
      return;
    }

    // 리그 참여자 확인
    const { data: participant, error } = await supabase
      .from('league_participants')
      .select('*')
      .eq('league_id', leagueData.id)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();

    if (error || !participant) {
      setHasAccess(false);
      setIsParticipant(false);
      return;
    }

    setHasAccess(true);
    setIsParticipant(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>리그를 찾을 수 없습니다</CardTitle>
            <CardDescription>요청하신 리그가 존재하지 않거나 삭제되었습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/leagues')} className="w-full">
              리그 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <CardTitle>접근 권한이 없습니다</CardTitle>
            </div>
            <CardDescription>
              이 리그는 비공개 리그입니다. 리그 관리자에게 참여 요청을 해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-2">{league.name}</p>
              <p className="text-sm text-muted-foreground">{league.description || '설명이 없습니다.'}</p>
            </div>
            {!user ? (
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                로그인하여 참여 요청하기
              </Button>
            ) : (
              <Button onClick={() => router.push('/leagues')} className="w-full" variant="outline">
                리그 목록으로 돌아가기
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-3xl">{league.name}</CardTitle>
                    {league.visibility === 'private' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        비공개
                      </Badge>
                    )}
                    <Badge
                      variant={
                        league.status === 'active'
                          ? 'default'
                          : league.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {league.status === 'active'
                        ? '진행중'
                        : league.status === 'completed'
                        ? '완료'
                        : league.status === 'cancelled'
                        ? '취소'
                        : '초안'}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{league.season}</CardDescription>
                  {league.description && (
                    <p className="text-muted-foreground mt-2">{league.description}</p>
                  )}
                </div>
              </div>
              {isParticipant && (
                <Button onClick={() => router.push(`/admin/league/${league.id}`)}>
                  리그 관리
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">시즌 시작일</p>
                  <p className="font-medium">
                    {league.start_date
                      ? new Date(league.start_date).toLocaleDateString('ko-KR')
                      : '미정'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">시즌 종료일</p>
                  <p className="font-medium">
                    {league.end_date
                      ? new Date(league.end_date).toLocaleDateString('ko-KR')
                      : '미정'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">생성자</p>
                  <p className="font-medium">
                    {league.creator?.full_name || league.creator?.username || league.creator?.email || '알 수 없음'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 리그 콘텐츠 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>리그 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">리그 상태</p>
                  <Badge
                    variant={
                      league.status === 'active'
                        ? 'default'
                        : league.status === 'completed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {league.status === 'active'
                      ? '진행중'
                      : league.status === 'completed'
                      ? '완료'
                      : league.status === 'cancelled'
                      ? '취소'
                      : '초안'}
                  </Badge>
                </div>
                {league.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">설명</p>
                    <p>{league.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">생성일</p>
                  <p>{new Date(league.created_at).toLocaleDateString('ko-KR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 향후 확장: 경기 목록, 순위표 등 */}
          <Card>
            <CardHeader>
              <CardTitle>경기 및 순위</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>경기 및 순위 정보는 곧 추가될 예정입니다.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
