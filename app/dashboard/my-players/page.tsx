'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserIcon, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyPlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyPlayers();
    }
  }, [user]);

  const fetchMyPlayers = async () => {
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
        setPlayers([]);
        setLoading(false);
        return;
      }

      // 내 팀에 속한 선수들
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          team:teams!players_team_id_fkey(id, name)
        `)
        .in('team_id', userTeamIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
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
          <h2 className="text-2xl font-bold">내 선수</h2>
          <p className="text-muted-foreground">내 팀에 속한 선수를 관리합니다</p>
        </div>
        <Button asChild>
          <Link href="/players/create">
            <Plus className="w-4 h-4 mr-2" />
            선수 등록
          </Link>
        </Button>
      </div>

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">선수가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 선수를 등록해보세요!
            </p>
            <Button asChild>
              <Link href="/players/create">
                <Plus className="w-4 h-4 mr-2" />
                선수 등록
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Card key={player.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  {player.first_name} {player.last_name}
                </CardTitle>
                <CardDescription>
                  {player.team?.name || '팀 없음'} · {player.position}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {player.jersey_number && (
                    <p className="text-muted-foreground">
                      등번호: {player.jersey_number}
                    </p>
                  )}
                  {player.nationality && (
                    <p className="text-muted-foreground">
                      국적: {player.nationality}
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-muted-foreground">
                    {new Date(player.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/players/${player.id}`}>보기</Link>
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

