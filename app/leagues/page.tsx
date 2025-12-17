'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Users, 
  Search,
  Play,
  CheckCircle,
  Lock,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

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
  creator?: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
  };
}

const statusConfig = {
  active: { label: '진행중', color: 'bg-green-500', icon: Play },
  draft: { label: '초안', color: 'bg-gray-500', icon: Calendar },
  completed: { label: '완료', color: 'bg-blue-500', icon: CheckCircle },
  cancelled: { label: '취소', color: 'bg-red-500', icon: Calendar }
};

export default function LeaguesPage() {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchLeagues();
  }, [user]);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leagues')
        .select(`
          *,
          creator:users!leagues_created_by_fkey(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      // 로그인하지 않은 사용자는 공개 리그만 볼 수 있음
      if (!user) {
        query = query.or('visibility.eq.public,is_public.eq.true');
      } else {
        // 로그인한 사용자는:
        // 1. 공개 리그
        // 2. 자신이 생성한 리그
        // 3. 참여 승인된 비공개 리그
        
        // 먼저 공개 리그와 자신이 생성한 리그 가져오기
        const { data: publicAndOwnLeagues } = await supabase
          .from('leagues')
          .select(`
            *,
            creator:users!leagues_created_by_fkey(id, email, username, full_name)
          `)
          .or(`visibility.eq.public,is_public.eq.true,created_by.eq.${user.id}`)
          .order('created_at', { ascending: false });

        // 참여 승인된 비공개 리그 가져오기
        const { data: participants } = await supabase
          .from('league_participants')
          .select('league_id')
          .eq('user_id', user.id)
          .eq('status', 'approved');

        const participantLeagueIds = participants?.map(p => p.league_id) || [];

        if (participantLeagueIds.length > 0) {
          const { data: privateLeagues } = await supabase
            .from('leagues')
            .select(`
              *,
              creator:users!leagues_created_by_fkey(id, email, username, full_name)
            `)
            .in('id', participantLeagueIds)
            .order('created_at', { ascending: false });

          // 중복 제거하여 합치기
          const allLeagues = [
            ...(publicAndOwnLeagues || []),
            ...(privateLeagues || [])
          ];
          
          const uniqueLeagues = allLeagues.filter((league, index, self) =>
            index === self.findIndex(l => l.id === league.id)
          );

          setLeagues(uniqueLeagues as League[]);
        } else {
          setLeagues((publicAndOwnLeagues || []) as League[]);
        }
      }

      // 위의 로직이 복잡하므로 간단하게 다시 구현
      const { data: allLeagues, error } = await supabase
        .from('leagues')
        .select(`
          *,
          creator:users!leagues_created_by_fkey(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leagues:', error);
        setLeagues([]);
        return;
      }

      // 클라이언트 사이드에서 필터링
      let filtered = (allLeagues || []) as League[];

      if (user) {
        // 참여 승인된 비공개 리그 ID 가져오기
        const { data: participants } = await supabase
          .from('league_participants')
          .select('league_id')
          .eq('user_id', user.id)
          .eq('status', 'approved');

        const participantLeagueIds = new Set(participants?.map(p => p.league_id) || []);

        filtered = filtered.filter(league => {
          // 공개 리그는 모두 볼 수 있음
          if (league.visibility === 'public' || league.is_public) {
            return true;
          }
          // 자신이 생성한 리그는 볼 수 있음
          if (league.created_by === user.id) {
            return true;
          }
          // 참여 승인된 비공개 리그는 볼 수 있음
          if (participantLeagueIds.has(league.id)) {
            return true;
          }
          return false;
        });
      } else {
        // 로그인하지 않은 사용자는 공개 리그만 볼 수 있음
        filtered = filtered.filter(league => league.visibility === 'public' || league.is_public);
      }

      setLeagues(filtered);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.season.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || league.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">리그 목록</h1>
            <p className="text-muted-foreground">
              축구 리그를 탐색하고 참여하세요
            </p>
          </div>
          {user && (
            <Button size="lg" asChild className="mt-4 sm:mt-0">
              <Link href="/leagues/create">
                <Plus className="w-5 h-5 mr-2" />
                새 리그 만들기
              </Link>
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="리그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
            >
              진행중
            </Button>
            <Button
              variant={statusFilter === 'draft' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('draft')}
            >
              초안
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
            >
              완료
            </Button>
          </div>
        </div>

        {/* Leagues Grid */}
        {filteredLeagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map((league) => {
              const status = statusConfig[league.status];
              const StatusIcon = status.icon;
              
              return (
                <Card key={league.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{league.name}</CardTitle>
                          <CardDescription>{league.season}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {league.visibility === 'private' && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                          </Badge>
                        )}
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {league.description || '설명이 없습니다.'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {league.start_date ? new Date(league.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">시작일</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {league.end_date ? new Date(league.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">종료일</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/league/${league.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          보기
                        </Link>
                      </Button>
                      {user && league.created_by === user.id && (
                        <Button variant="outline" asChild>
                          <Link href={`/admin/league/${league.id}`}>
                            관리
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">리그가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? '검색 결과가 없습니다.'
                  : '첫 번째 축구 리그를 만들어보세요!'}
              </p>
              {user && (
                <Button asChild>
                  <Link href="/leagues/create">
                    <Plus className="w-4 h-4 mr-2" />
                    리그 만들기
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
