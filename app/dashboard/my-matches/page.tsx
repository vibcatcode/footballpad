'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Edit, Trash2, Search, RefreshCw, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const SUPER_ADMIN_EMAILS: readonly string[] = ['geedojo@gmail.com'];

export default function MyMatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [leagueFilter, setLeagueFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      fetchMatches();
      if (isSuperAdmin) {
        fetchLeagues();
      }
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

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching leagues:', error);
        return;
      }

      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    }
  };

  const fetchMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name),
          league:leagues(id, name)
        `)
        .order('match_date', { ascending: false });

      // 관리자가 아니면 자신이 만든 팀이 참여한 경기만 조회
      if (!isSuperAdmin) {
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

        query = query.or(`home_team_id.in.(${userTeamIds.join(',')}),away_team_id.in.(${userTeamIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching matches:', error);
        setFeedback({ type: 'error', message: '경기 목록을 불러오는데 실패했습니다.' });
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setFeedback({ type: 'error', message: '경기 목록을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (matchId: string, matchInfo: string) => {
    if (!confirm(`정말로 "${matchInfo}" 경기를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeletingId(matchId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '경기가 삭제되었습니다.' });
      fetchMatches();
    } catch (error: any) {
      console.error('Error deleting match:', error);
      setFeedback({ type: 'error', message: '경기 삭제에 실패했습니다.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter(match => {
      const matchesSearch =
        match.home_team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.away_team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.league?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.venue?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLeague = leagueFilter === 'all' || match.league_id === leagueFilter;
      const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
      return matchesSearch && matchesLeague && matchesStatus;
    });
  }, [matches, searchQuery, leagueFilter, statusFilter]);

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
          <h2 className="text-2xl font-bold">{isSuperAdmin ? '모든 경기 관리' : '내 경기'}</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? '사이트의 모든 사용자가 생성한 경기를 관리합니다'
              : '내 팀이 참여한 경기를 확인합니다'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchMatches}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {feedback && (
        <Card className={`border-2 ${feedback.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <CardContent className="pt-6">
            <div className={`flex items-center gap-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
              <span>{feedback.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 검색 및 필터 */}
      <Card>
        <CardHeader>
          <CardTitle>검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>검색</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="팀명, 리그명, 경기장으로 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>리그 필터</Label>
                <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 리그</SelectItem>
                    {leagues.map(league => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>상태 필터</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="scheduled">예정</SelectItem>
                  <SelectItem value="live">진행중</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                  <SelectItem value="postponed">연기</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredMatches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">경기가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || leagueFilter !== 'all' || statusFilter !== 'all' 
                ? '검색 결과가 없습니다.' 
                : (isSuperAdmin ? '등록된 경기가 없습니다.' : '내 팀이 참여한 경기가 없습니다.')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>리그</TableHead>
                <TableHead>홈 팀</TableHead>
                <TableHead>어웨이 팀</TableHead>
                <TableHead>스코어</TableHead>
                <TableHead>상태</TableHead>
                {isSuperAdmin && <TableHead>작성자</TableHead>}
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell>
                    <div className="font-medium">
                      {new Date(match.match_date).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(match.match_date).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {match.league?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{match.home_team?.name || '알 수 없음'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{match.away_team?.name || '알 수 없음'}</div>
                  </TableCell>
                  <TableCell>
                    {match.home_score !== null && match.away_score !== null
                      ? <span className="font-bold text-lg">{match.home_score} - {match.away_score}</span>
                      : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        match.status === 'completed' ? 'default' :
                        match.status === 'live' ? 'destructive' :
                        match.status === 'cancelled' ? 'secondary' :
                        'outline'
                      }
                    >
                      {match.status === 'completed' ? '완료' :
                       match.status === 'live' ? '진행중' :
                       match.status === 'cancelled' ? '취소' :
                       match.status === 'postponed' ? '연기' : '예정'}
                    </Badge>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {match.venue || '-'}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/matches/${match.id}`}>
                          <Play className="w-4 h-4 mr-1" />
                          보기
                        </Link>
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(match.id, `${match.home_team?.name || '홈'} vs ${match.away_team?.name || '어웨이'}`)}
                          disabled={deletingId === match.id}
                        >
                          {deletingId === match.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
