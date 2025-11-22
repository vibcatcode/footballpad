'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyMatches();
    }
  }, [user]);

  const fetchMyMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 내가 만든 팀의 ID 목록 가져오기
      const { data: userTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', user.id);
      
      const userTeamIds = userTeams?.map(t => t.id) || [];
      
      if (userTeamIds.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      // 내 팀이 참여한 경기들
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .or(`home_team_id.in.(${userTeamIds.join(',')}),away_team_id.in.(${userTeamIds.join(',')})`)
        .order('match_date', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
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
        <h2 className="text-2xl font-bold">내 경기</h2>
        <p className="text-muted-foreground">내 팀이 참여한 경기를 확인합니다</p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">경기가 없습니다</h3>
            <p className="text-muted-foreground">
              내 팀이 참여한 경기가 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {match.home_team?.name || '홈팀'} vs {match.away_team?.name || '원정팀'}
                </CardTitle>
                <CardDescription>
                  {new Date(match.match_date).toLocaleDateString('ko-KR')} · {match.venue || '장소 미정'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {match.home_score ?? '-'} : {match.away_score ?? '-'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      상태: {match.status === 'completed' ? '종료' : match.status === 'live' ? '진행중' : '예정'}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/matches/${match.id}`}>상세보기</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

