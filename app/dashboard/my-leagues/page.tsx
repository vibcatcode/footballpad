'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const SUPER_ADMIN_EMAILS: readonly string[] = ['geedojo@gmail.com'];

export default function MyLeaguesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    season: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'cancelled',
    max_teams: 0,
    is_public: false,
    visibility: 'public' as 'public' | 'private' | 'unlisted',
  });
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
      fetchLeagues();
      if (isSuperAdmin) {
        fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, full_name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLeagues = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('leagues')
        .select(`
          *,
          creator:users!leagues_created_by_fkey(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      // 관리자가 아니면 자신이 만든 리그만 조회
      if (!isSuperAdmin) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching leagues:', error);
        setFeedback({ type: 'error', message: '리그 목록을 불러오는데 실패했습니다.' });
        return;
      }

      setLeagues(data || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
      setFeedback({ type: 'error', message: '리그 목록을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (league: any) => {
    setEditingId(league.id);
    setEditForm({
      name: league.name || '',
      description: league.description || '',
      season: league.season || '',
      status: league.status || 'draft',
      max_teams: league.max_teams || 0,
      is_public: league.is_public || false,
      visibility: league.visibility || 'public',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('leagues')
        .update({
          ...editForm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '리그가 수정되었습니다.' });
      setEditingId(null);
      fetchLeagues();
    } catch (error: any) {
      console.error('Error updating league:', error);
      setFeedback({ type: 'error', message: '리그 수정에 실패했습니다.' });
    }
  };

  const handleDelete = async (leagueId: string, leagueName: string) => {
    if (!confirm(`정말로 "${leagueName}" 리그를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeletingId(leagueId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', leagueId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '리그가 삭제되었습니다.' });
      fetchLeagues();
    } catch (error: any) {
      console.error('Error deleting league:', error);
      setFeedback({ type: 'error', message: '리그 삭제에 실패했습니다.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLeagues = useMemo(() => {
    return leagues.filter(league => {
      const matchesSearch =
        league.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.season?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.creator?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [leagues, searchQuery]);

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
          <h2 className="text-2xl font-bold">{isSuperAdmin ? '모든 리그 관리' : '내 리그'}</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? '사이트의 모든 사용자가 생성한 리그를 관리합니다'
              : '내가 만든 리그를 관리합니다'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLeagues}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          {!isSuperAdmin && (
            <Button asChild>
              <Link href="/leagues/create">
                <Plus className="w-4 h-4 mr-2" />
                리그 생성
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
              placeholder="리그명, 시즌, 설명, 작성자로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredLeagues.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">리그가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? '검색 결과가 없습니다.' : (isSuperAdmin ? '등록된 리그가 없습니다.' : '첫 번째 리그를 만들어보세요!')}
            </p>
            {!isSuperAdmin && !searchQuery && (
              <Button asChild>
                <Link href="/leagues/create">
                  <Plus className="w-4 h-4 mr-2" />
                  리그 생성
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
                <TableHead>리그명</TableHead>
                <TableHead>시즌</TableHead>
                <TableHead>상태</TableHead>
                {isSuperAdmin && <TableHead>작성자</TableHead>}
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeagues.map((league) => (
                <TableRow key={league.id}>
                  {editingId === league.id ? (
                    <>
                      <TableCell colSpan={isSuperAdmin ? 6 : 5}>
                        <Card>
                          <CardHeader>
                            <CardTitle>리그 수정</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>리그명</Label>
                                <Input
                                  value={editForm.name}
                                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>시즌</Label>
                                <Input
                                  value={editForm.season}
                                  onChange={e => setEditForm({ ...editForm, season: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>상태</Label>
                                <Select
                                  value={editForm.status}
                                  onValueChange={value => setEditForm({ ...editForm, status: value as any })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="draft">초안</SelectItem>
                                    <SelectItem value="active">진행중</SelectItem>
                                    <SelectItem value="completed">완료</SelectItem>
                                    <SelectItem value="cancelled">취소</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>최대 팀 수</Label>
                                <Input
                                  type="number"
                                  value={editForm.max_teams}
                                  onChange={e => setEditForm({ ...editForm, max_teams: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>공개 설정</Label>
                                <Select
                                  value={editForm.visibility}
                                  onValueChange={value => setEditForm({ ...editForm, visibility: value as any })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="public">공개</SelectItem>
                                    <SelectItem value="private">비공개</SelectItem>
                                    <SelectItem value="unlisted">목록 제외</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>설명</Label>
                              <Textarea
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setEditingId(null)}>
                                취소
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                저장
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>
                        <div className="font-medium">{league.name}</div>
                        {league.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {league.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{league.season}</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded bg-muted">
                          {league.status === 'draft' ? '초안' : 
                           league.status === 'active' ? '진행중' :
                           league.status === 'completed' ? '완료' : '취소'}
                        </span>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="text-sm">
                            {league.creator?.full_name || league.creator?.username || league.creator?.email || '알 수 없음'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {league.creator?.email}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {new Date(league.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/leagues/${league.id}`}>보기</Link>
                          </Button>
                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(league)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(league.id, league.name)}
                                disabled={deletingId === league.id}
                              >
                                {deletingId === league.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

