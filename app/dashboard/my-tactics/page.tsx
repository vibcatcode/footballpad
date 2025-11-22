'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyTacticsPage() {
  const { user } = useAuth();
  const [lineups, setLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyTactics();
    }
  }, [user]);

  const fetchMyTactics = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lineups')
        .select(`
          *,
          team:teams!lineups_team_id_fkey(id, name)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lineups:', error);
        return;
      }

      setLineups(data || []);
    } catch (error) {
      console.error('Error fetching lineups:', error);
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
          <h2 className="text-2xl font-bold">내 전술</h2>
          <p className="text-muted-foreground">내가 만든 전술과 라인업을 관리합니다</p>
        </div>
        <Button asChild>
          <Link href="/lineup-builder">
            <BarChart3 className="w-4 h-4 mr-2" />
            라인업 만들기
          </Link>
        </Button>
      </div>

      {lineups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">전술이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 라인업을 만들어보세요!
            </p>
            <Button asChild>
              <Link href="/lineup-builder">
                <BarChart3 className="w-4 h-4 mr-2" />
                라인업 만들기
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lineups.map((lineup) => (
            <Card key={lineup.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {lineup.formation || '포메이션 미정'}
                </CardTitle>
                <CardDescription>
                  {lineup.team?.name || '팀 없음'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(lineup.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/lineup-builder?id=${lineup.id}`}>보기</Link>
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

