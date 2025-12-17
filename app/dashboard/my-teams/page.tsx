'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
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

export default function MyTeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    short_name: '',
    description: '',
    location: '',
    founded_year: null as number | null,
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
      fetchTeams();
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

  const fetchTeams = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          creator:users!teams_created_by_fkey(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      // 관리자가 아니면 자신이 만든 팀만 조회
      if (!isSuperAdmin) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching teams:', error);
        setFeedback({ type: 'error', message: '팀 목록을 불러오는데 실패했습니다.' });
        return;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setFeedback({ type: 'error', message: '팀 목록을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team: any) => {
    setEditingId(team.id);
    setEditForm({
      name: team.name || '',
      short_name: team.short_name || '',
      description: team.description || '',
      location: team.location || '',
      founded_year: team.founded_year || null,
      is_public: team.is_public || false,
      visibility: team.visibility || 'public',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          ...editForm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '팀이 수정되었습니다.' });
      setEditingId(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error updating team:', error);
      setFeedback({ type: 'error', message: '팀 수정에 실패했습니다.' });
    }
  };

  const handleDelete = async (teamId: string, teamName: string) => {
    if (!confirm(`정말로 "${teamName}" 팀을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 모든 선수와 데이터도 함께 삭제됩니다.`)) {
      return;
    }

    setDeletingId(teamId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '팀이 삭제되었습니다.' });
      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      setFeedback({ type: 'error', message: '팀 삭제에 실패했습니다.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch =
        team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.short_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.creator?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [teams, searchQuery]);

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
          <h2 className="text-2xl font-bold">{isSuperAdmin ? '모든 팀 관리' : '내 팀'}</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? '사이트의 모든 사용자가 생성한 팀을 관리합니다'
              : '내가 만든 팀을 관리합니다'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTeams}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          {!isSuperAdmin && (
            <Button asChild>
              <Link href="/teams/create">
                <Plus className="w-4 h-4 mr-2" />
                팀 생성
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
              placeholder="팀명, 약칭, 설명, 위치, 작성자로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">팀이 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? '검색 결과가 없습니다.' : (isSuperAdmin ? '등록된 팀이 없습니다.' : '첫 번째 팀을 만들어보세요!')}
            </p>
            {!isSuperAdmin && !searchQuery && (
              <Button asChild>
                <Link href="/teams/create">
                  <Plus className="w-4 h-4 mr-2" />
                  팀 생성
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
                <TableHead>팀명</TableHead>
                <TableHead>약칭</TableHead>
                <TableHead>위치</TableHead>
                {isSuperAdmin && <TableHead>작성자</TableHead>}
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.map((team) => (
                <TableRow key={team.id}>
                  {editingId === team.id ? (
                    <>
                      <TableCell colSpan={isSuperAdmin ? 6 : 5}>
                        <Card>
                          <CardHeader>
                            <CardTitle>팀 수정</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>팀명</Label>
                                <Input
                                  value={editForm.name}
                                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>약칭</Label>
                                <Input
                                  value={editForm.short_name}
                                  onChange={e => setEditForm({ ...editForm, short_name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>위치</Label>
                                <Input
                                  value={editForm.location}
                                  onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>창립년도</Label>
                                <Input
                                  type="number"
                                  value={editForm.founded_year || ''}
                                  onChange={e => setEditForm({ ...editForm, founded_year: e.target.value ? parseInt(e.target.value) : null })}
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
                        <div className="font-medium">{team.name}</div>
                        {team.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {team.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{team.short_name || '-'}</TableCell>
                      <TableCell>{team.location || '-'}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="text-sm">
                            {team.creator?.full_name || team.creator?.username || team.creator?.email || '알 수 없음'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {team.creator?.email}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {new Date(team.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/teams/${team.id}`}>보기</Link>
                          </Button>
                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(team)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(team.id, team.name)}
                                disabled={deletingId === team.id}
                              >
                                {deletingId === team.id ? (
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
