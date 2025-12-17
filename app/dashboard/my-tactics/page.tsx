'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
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

const SUPER_ADMIN_EMAILS: readonly string[] = ['geedojo@gmail.com'];

export default function MyTacticsPage() {
  const { user } = useAuth();
  const [lineups, setLineups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      fetchTactics();
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

  const fetchTactics = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('lineups')
        .select(`
          *,
          team:teams!lineups_team_id_fkey(id, name),
          creator:users!lineups_created_by_fkey(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      // 관리자가 아니면 자신이 만든 전술만 조회
      if (!isSuperAdmin) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lineups:', error);
        setFeedback({ type: 'error', message: '전술 목록을 불러오는데 실패했습니다.' });
        return;
      }

      setLineups(data || []);
    } catch (error) {
      console.error('Error fetching lineups:', error);
      setFeedback({ type: 'error', message: '전술 목록을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lineupId: string, lineupName: string) => {
    if (!confirm(`정말로 "${lineupName || '이 전술'}" 전술을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeletingId(lineupId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('lineups')
        .delete()
        .eq('id', lineupId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '전술이 삭제되었습니다.' });
      fetchTactics();
    } catch (error: any) {
      console.error('Error deleting lineup:', error);
      setFeedback({ type: 'error', message: '전술 삭제에 실패했습니다.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLineups = useMemo(() => {
    return lineups.filter(lineup => {
      const matchesSearch =
        lineup.formation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lineup.team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lineup.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lineup.creator?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [lineups, searchQuery]);

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
          <h2 className="text-2xl font-bold">{isSuperAdmin ? '모든 전술 관리' : '내 전술'}</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? '사이트의 모든 사용자가 생성한 전술을 관리합니다'
              : '내가 만든 전술과 라인업을 관리합니다'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTactics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          {!isSuperAdmin && (
            <Button asChild>
              <Link href="/lineup-builder">
                <BarChart3 className="w-4 h-4 mr-2" />
                라인업 만들기
              </Link>
            </Button>
          )}
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

      {/* 검색 */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="포메이션, 팀명, 작성자로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredLineups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">전술이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? '검색 결과가 없습니다.' : (isSuperAdmin ? '등록된 전술이 없습니다.' : '첫 번째 라인업을 만들어보세요!')}
            </p>
            {!isSuperAdmin && !searchQuery && (
              <Button asChild>
                <Link href="/lineup-builder">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  라인업 만들기
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>포메이션</TableHead>
                <TableHead>팀</TableHead>
                {isSuperAdmin && <TableHead>작성자</TableHead>}
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLineups.map((lineup) => (
                <TableRow key={lineup.id}>
                  <TableCell>
                    <div className="font-medium">{lineup.formation || '포메이션 미정'}</div>
                  </TableCell>
                  <TableCell>
                    {lineup.team?.name || '팀 없음'}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="text-sm">
                        {lineup.creator?.full_name || lineup.creator?.username || lineup.creator?.email || '알 수 없음'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lineup.creator?.email}
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {new Date(lineup.created_at).toLocaleDateString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/lineup-builder?id=${lineup.id}`}>보기</Link>
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(lineup.id, lineup.formation)}
                          disabled={deletingId === lineup.id}
                        >
                          {deletingId === lineup.id ? (
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
