'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyLeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyLeagues();
    }
  }, [user]);

  const fetchMyLeagues = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leagues:', error);
        return;
      }

      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
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
          <h2 className="text-2xl font-bold">내 리그</h2>
          <p className="text-muted-foreground">내가 만든 리그를 관리합니다</p>
        </div>
        <Button asChild>
          <Link href="/leagues/create">
            <Plus className="w-4 h-4 mr-2" />
            리그 생성
          </Link>
        </Button>
      </div>

      {leagues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">리그가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              첫 번째 리그를 만들어보세요!
            </p>
            <Button asChild>
              <Link href="/leagues/create">
                <Plus className="w-4 h-4 mr-2" />
                리그 생성
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <Card key={league.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  {league.name}
                </CardTitle>
                <CardDescription>{league.season}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {league.description || '설명이 없습니다.'}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(league.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/leagues/${league.id}`}>보기</Link>
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

