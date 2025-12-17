'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserIcon, Plus, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
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

const POSITION_OPTIONS = [
  { value: 'GK', label: 'GK (골키퍼)' },
  { value: 'CB', label: 'CB (중앙 수비수)' },
  { value: 'LB', label: 'LB (왼쪽 풀백)' },
  { value: 'RB', label: 'RB (오른쪽 풀백)' },
  { value: 'CDM', label: 'CDM (수비형 미드필더)' },
  { value: 'CM', label: 'CM (중앙 미드필더)' },
  { value: 'CAM', label: 'CAM (공격형 미드필더)' },
  { value: 'LW', label: 'LW (왼쪽 윙어)' },
  { value: 'RW', label: 'RW (오른쪽 윙어)' },
  { value: 'ST', label: 'ST (스트라이커)' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: '활성' },
  { value: 'injured', label: '부상' },
  { value: 'suspended', label: '출장 정지' },
  { value: 'inactive', label: '비활성' },
];

export default function MyPlayersPage() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    jersey_number: null as number | null,
    position: 'GK' as 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST',
    birth_date: '',
    nationality: '',
    height: null as number | null,
    weight: null as number | null,
    preferred_foot: 'right' as 'left' | 'right' | 'both' | null,
    status: 'active' as 'active' | 'injured' | 'suspended' | 'inactive',
    team_id: '',
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
      fetchPlayers();
      if (isSuperAdmin) {
        fetchAllTeams();
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

  const fetchAllTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPlayers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('players')
        .select(`
          *,
          team:teams!players_team_id_fkey(id, name, created_by)
        `)
        .order('created_at', { ascending: false });

      // 관리자가 아니면 자신이 만든 팀에 속한 선수만 조회
      if (!isSuperAdmin) {
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

        query = query.in('team_id', userTeamIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching players:', error);
        setFeedback({ type: 'error', message: '선수 목록을 불러오는데 실패했습니다.' });
        return;
      }

      // 관리자인 경우 작성자 정보 가져오기
      if (isSuperAdmin && data && data.length > 0) {
        const creatorIds = [...new Set(data.map((p: any) => p.team?.created_by).filter(Boolean))];
        const { data: creators } = await supabase
          .from('users')
          .select('id, email, username, full_name')
          .in('id', creatorIds);

        const creatorsMap = new Map(creators?.map(c => [c.id, c]) || []);

        const playersWithCreator = data.map((player: any) => ({
          ...player,
          creator: player.team?.created_by ? creatorsMap.get(player.team.created_by) : null,
        }));

        setPlayers(playersWithCreator);
      } else {
        setPlayers(data || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      setFeedback({ type: 'error', message: '선수 목록을 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (player: any) => {
    setEditingId(player.id);
    setEditForm({
      first_name: player.first_name || '',
      last_name: player.last_name || '',
      jersey_number: player.jersey_number || null,
      position: player.position || 'GK',
      birth_date: player.birth_date || '',
      nationality: player.nationality || '',
      height: player.height || null,
      weight: player.weight || null,
      preferred_foot: player.preferred_foot || 'right',
      status: player.status || 'active',
      team_id: player.team_id || '',
      is_public: player.is_public || false,
      visibility: player.visibility || 'public',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('players')
        .update({
          ...editForm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '선수가 수정되었습니다.' });
      setEditingId(null);
      fetchPlayers();
    } catch (error: any) {
      console.error('Error updating player:', error);
      setFeedback({ type: 'error', message: '선수 수정에 실패했습니다.' });
    }
  };

  const handleDelete = async (playerId: string, playerName: string) => {
    if (!confirm(`정말로 "${playerName}" 선수를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeletingId(playerId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) {
        throw error;
      }

      setFeedback({ type: 'success', message: '선수가 삭제되었습니다.' });
      fetchPlayers();
    } catch (error: any) {
      console.error('Error deleting player:', error);
      setFeedback({ type: 'error', message: '선수 삭제에 실패했습니다.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        player.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nationality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.creator?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [players, searchQuery]);

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
          <h2 className="text-2xl font-bold">{isSuperAdmin ? '모든 선수 관리' : '내 선수'}</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? '사이트의 모든 사용자가 등록한 선수를 관리합니다'
              : '내 팀에 속한 선수를 관리합니다'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPlayers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
          {!isSuperAdmin && (
            <Button asChild>
              <Link href="/players/create">
                <Plus className="w-4 h-4 mr-2" />
                선수 등록
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
              placeholder="이름, 포지션, 국적, 팀명, 작성자로 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredPlayers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">선수가 없습니다</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? '검색 결과가 없습니다.' : (isSuperAdmin ? '등록된 선수가 없습니다.' : '첫 번째 선수를 등록해보세요!')}
            </p>
            {!isSuperAdmin && !searchQuery && (
              <Button asChild>
                <Link href="/players/create">
                  <Plus className="w-4 h-4 mr-2" />
                  선수 등록
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
                <TableHead>이름</TableHead>
                <TableHead>포지션</TableHead>
                <TableHead>등번호</TableHead>
                <TableHead>팀</TableHead>
                {isSuperAdmin && <TableHead>작성자</TableHead>}
                <TableHead>생성일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  {editingId === player.id ? (
                    <>
                      <TableCell colSpan={isSuperAdmin ? 7 : 6}>
                        <Card>
                          <CardHeader>
                            <CardTitle>선수 수정</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label>이름</Label>
                                <Input
                                  value={editForm.first_name}
                                  onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>성</Label>
                                <Input
                                  value={editForm.last_name}
                                  onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>등번호</Label>
                                <Input
                                  type="number"
                                  value={editForm.jersey_number || ''}
                                  onChange={e => setEditForm({ ...editForm, jersey_number: e.target.value ? parseInt(e.target.value) : null })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>포지션</Label>
                                <Select
                                  value={editForm.position}
                                  onValueChange={value => setEditForm({ ...editForm, position: value as any })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {POSITION_OPTIONS.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                                    {STATUS_OPTIONS.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {isSuperAdmin && (
                                <div className="space-y-2">
                                  <Label>팀</Label>
                                  <Select
                                    value={editForm.team_id}
                                    onValueChange={value => setEditForm({ ...editForm, team_id: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {teams.map(team => (
                                        <SelectItem key={team.id} value={team.id}>
                                          {team.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div className="space-y-2">
                                <Label>국적</Label>
                                <Input
                                  value={editForm.nationality}
                                  onChange={e => setEditForm({ ...editForm, nationality: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>생년월일</Label>
                                <Input
                                  type="date"
                                  value={editForm.birth_date}
                                  onChange={e => setEditForm({ ...editForm, birth_date: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>신장 (cm)</Label>
                                <Input
                                  type="number"
                                  value={editForm.height || ''}
                                  onChange={e => setEditForm({ ...editForm, height: e.target.value ? parseInt(e.target.value) : null })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>체중 (kg)</Label>
                                <Input
                                  type="number"
                                  value={editForm.weight || ''}
                                  onChange={e => setEditForm({ ...editForm, weight: e.target.value ? parseInt(e.target.value) : null })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>주발</Label>
                                <Select
                                  value={editForm.preferred_foot || 'right'}
                                  onValueChange={value => setEditForm({ ...editForm, preferred_foot: value as any })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">왼발</SelectItem>
                                    <SelectItem value="right">오른발</SelectItem>
                                    <SelectItem value="both">양발</SelectItem>
                                  </SelectContent>
                                </Select>
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
                        <div className="font-medium">{player.first_name} {player.last_name}</div>
                        {player.nationality && (
                          <p className="text-xs text-muted-foreground">{player.nationality}</p>
                        )}
                      </TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>{player.jersey_number || '-'}</TableCell>
                      <TableCell>{player.team?.name || '팀 없음'}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <div className="text-sm">
                            {player.creator?.full_name || player.creator?.username || player.creator?.email || '알 수 없음'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {player.creator?.email}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        {new Date(player.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/players/${player.id}`}>보기</Link>
                          </Button>
                          {isSuperAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(player)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(player.id, `${player.first_name} ${player.last_name}`)}
                                disabled={deletingId === player.id}
                              >
                                {deletingId === player.id ? (
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
