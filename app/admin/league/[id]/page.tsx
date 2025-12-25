'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Trophy, ArrowLeft, Users, Calendar, Settings, Plus, Trash2, Edit, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
}

interface Team {
  id: string;
  name: string;
  short_name: string | null;
}

interface Match {
  id: string;
  league_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  venue: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  youtube: string | null;
  home_team?: {
    id: string;
    name: string;
  };
  away_team?: {
    id: string;
    name: string;
  };
}

interface Participant {
  id: string;
  league_id: string;
  user_id: string;
  team_id: string | null;
  role: 'participant' | 'manager' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'banned';
  user?: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
  };
  team?: {
    id: string;
    name: string;
  };
}

export default function LeagueDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [addingTeam, setAddingTeam] = useState(false);

  useEffect(() => {
    if (params.id && user) {
      fetchLeague();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user]);

  // 팀 관리 탭을 열 때 사용 가능한 팀 목록 새로고침
  useEffect(() => {
    if (activeTab === 'teams' && user && league) {
      fetchAvailableTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user, league]);

  const fetchLeague = async () => {
    const leagueId = params.id as string;
    setLoading(true);

    try {
      // 리그 정보 가져오기
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();

      if (leagueError || !leagueData) {
        router.push('/leagues');
        return;
      }

      // 권한 체크
      if (leagueData.created_by !== user?.id) {
        router.push(`/league/${leagueId}`);
        return;
      }

      setLeague(leagueData as League);

      // 관련 데이터 가져오기
      await Promise.all([
        fetchTeams(leagueId),
        fetchMatches(leagueId),
        fetchParticipants(leagueId),
        fetchAvailableTeams()
      ]);
    } catch (error) {
      console.error('Error fetching league:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (leagueId: string) => {
    // 리그에 참여한 팀들 가져오기 (league_participants에서 team_id가 있는 것들)
    const { data: participantsData } = await supabase
      .from('league_participants')
      .select('team_id')
      .eq('league_id', leagueId)
      .not('team_id', 'is', null);

    const teamIds = new Set<string>();
    participantsData?.forEach(p => {
      if (p.team_id) teamIds.add(p.team_id);
    });

    // 경기에서 사용된 팀들도 추가
    const { data: matchesData } = await supabase
      .from('matches')
      .select('home_team_id, away_team_id')
      .eq('league_id', leagueId);

    matchesData?.forEach(match => {
      if (match.home_team_id) teamIds.add(match.home_team_id);
      if (match.away_team_id) teamIds.add(match.away_team_id);
    });

    if (teamIds.size > 0) {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .in('id', Array.from(teamIds));

      if (teamsData) {
        setTeams(teamsData as Team[]);
      }
    } else {
      setTeams([]);
    }
  };

  const fetchAvailableTeams = async () => {
    if (!user) {
      setAvailableTeams([]);
      return;
    }
    
    setLoadingTeams(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching available teams:', error);
        setAvailableTeams([]);
        return;
      }

      setAvailableTeams(data || []);
    } catch (error) {
      console.error('Error fetching available teams:', error);
      setAvailableTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchMatches = async (leagueId: string) => {
    const { data: matchesData } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name),
        away_team:teams!matches_away_team_id_fkey(id, name)
      `)
      .eq('league_id', leagueId)
      .order('match_date', { ascending: true });

    if (matchesData) {
      setMatches(matchesData as Match[]);
    }
  };

  const fetchParticipants = async (leagueId: string) => {
    const { data: participantsData } = await supabase
      .from('league_participants')
      .select(`
        *,
        user:users!league_participants_user_id_fkey(id, email, username, full_name),
        team:teams(id, name)
      `)
      .eq('league_id', leagueId)
      .order('created_at', { ascending: false });

    if (participantsData) {
      setParticipants(participantsData as Participant[]);
    }
  };

  const handleUpdateLeague = async (updates: Partial<League>) => {
    if (!league) return;

    try {
      const { error } = await supabase
        .from('leagues')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', league.id);

      if (error) throw error;

      setLeague({ ...league, ...updates });
    } catch (error) {
      console.error('Error updating league:', error);
      alert('리그 업데이트에 실패했습니다.');
    }
  };

  const handleApproveParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('league_participants')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);

      if (error) throw error;

      fetchParticipants(league!.id);
    } catch (error) {
      console.error('Error approving participant:', error);
      alert('참여자 승인에 실패했습니다.');
    }
  };

  const handleRejectParticipant = async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('league_participants')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);

      if (error) throw error;

      fetchParticipants(league!.id);
    } catch (error) {
      console.error('Error rejecting participant:', error);
      alert('참여자 거부에 실패했습니다.');
    }
  };

  const handleAddTeam = async () => {
    if (!selectedTeamId || !league || !user) {
      alert('팀을 선택해주세요.');
      return;
    }

    setAddingTeam(true);
    try {
      // 이미 리그에 참여 중인지 확인
      const { data: existingParticipant } = await supabase
        .from('league_participants')
        .select('id')
        .eq('league_id', league.id)
        .eq('team_id', selectedTeamId)
        .single();

      if (existingParticipant) {
        alert('이미 리그에 참여 중인 팀입니다.');
        setAddingTeam(false);
        return;
      }

      // 리그에 팀 추가 (league_participants에 추가)
      const { error } = await supabase
        .from('league_participants')
        .insert({
          league_id: league.id,
          user_id: user.id,
          team_id: selectedTeamId,
          role: 'admin',
          status: 'approved',
        });

      if (error) throw error;

      alert('팀이 리그에 추가되었습니다.');
      setSelectedTeamId('');
      await Promise.all([
        fetchTeams(league.id),
        fetchParticipants(league.id),
        fetchAvailableTeams()
      ]);
    } catch (error) {
      console.error('Error adding team:', error);
      alert('팀 추가에 실패했습니다.');
    } finally {
      setAddingTeam(false);
    }
  };

  const handleRemoveTeam = async (teamId: string, teamName: string) => {
    if (!league) return;

    if (!confirm(`정말로 "${teamName}" 팀을 리그에서 제거하시겠습니까?`)) {
      return;
    }

    try {
      // league_participants에서 해당 팀 제거
      const { error } = await supabase
        .from('league_participants')
        .delete()
        .eq('league_id', league.id)
        .eq('team_id', teamId);

      if (error) throw error;

      alert('팀이 리그에서 제거되었습니다.');
      await Promise.all([
        fetchTeams(league.id),
        fetchParticipants(league.id),
        fetchAvailableTeams()
      ]);
    } catch (error) {
      console.error('Error removing team:', error);
      alert('팀 제거에 실패했습니다.');
    }
  };

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

  if (!league) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>리그를 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/leagues')} className="w-full">
              리그 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{league.name}</h1>
            <p className="text-muted-foreground">리그 관리</p>
          </div>
          <Button onClick={() => router.push(`/league/${league.id}`)}>
            <Trophy className="w-4 h-4 mr-2" />
            리그 보기
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="teams">팀 관리</TabsTrigger>
            <TabsTrigger value="matches">경기 관리</TabsTrigger>
            <TabsTrigger value="participants">참여자 관리</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* 개요 */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    팀 수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{teams.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    경기 수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{matches.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    참여자 수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{participants.filter(p => p.status === 'approved').length}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 팀 관리 */}
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>팀 관리</CardTitle>
                    <CardDescription>
                      리그에 참여하는 팀을 추가하거나 제거할 수 있습니다.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 팀 추가 */}
                <div className="space-y-4">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>팀 추가</Label>
                      <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                        <SelectTrigger>
                          <SelectValue placeholder="추가할 팀을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingTeams ? (
                            <SelectItem value="" disabled>로딩 중...</SelectItem>
                          ) : !availableTeams || availableTeams.length === 0 ? (
                            <SelectItem value="" disabled>사용 가능한 팀이 없습니다</SelectItem>
                          ) : availableTeams
                              .filter(team => team && !teams.some(t => t && t.id === team.id))
                              .length === 0 ? (
                            <SelectItem value="" disabled>추가할 수 있는 팀이 없습니다</SelectItem>
                          ) : (
                            availableTeams
                              .filter(team => team && !teams.some(t => t && t.id === team.id))
                              .map(team => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name} {team.short_name && `(${team.short_name})`}
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleAddTeam} 
                      disabled={!selectedTeamId || addingTeam}
                    >
                      {addingTeam ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          추가 중...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          팀 추가
                        </>
                      )}
                    </Button>
                  </div>
                  {(!availableTeams || availableTeams.length === 0) && !loadingTeams && (
                    <p className="text-sm text-muted-foreground">
                      추가할 팀이 없습니다. <Link href="/teams/create" className="text-primary underline">팀을 생성</Link>해주세요.
                    </p>
                  )}
                </div>

                {/* 현재 팀 목록 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">참여 중인 팀 ({teams?.length || 0})</h3>
                    {!teams || teams.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        아직 참여 중인 팀이 없습니다.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>팀명</TableHead>
                              <TableHead>약칭</TableHead>
                              <TableHead className="text-right">관리</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teams?.map(team => team ? (
                              <TableRow key={team.id}>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell>{team.short_name || '-'}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleRemoveTeam(team.id, team.name)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    제거
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ) : null)}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 경기 관리 */}
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>경기 관리</CardTitle>
                  <Button onClick={() => router.push(`/matches?league=${league.id}`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    경기 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>날짜</TableHead>
                        <TableHead>홈 팀</TableHead>
                        <TableHead>어웨이 팀</TableHead>
                        <TableHead>스코어</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map(match => (
                        <TableRow key={match.id}>
                          <TableCell>
                            {new Date(match.match_date).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell>{match.home_team?.name || '알 수 없음'}</TableCell>
                          <TableCell>{match.away_team?.name || '알 수 없음'}</TableCell>
                          <TableCell>
                            {match.home_score !== null && match.away_score !== null
                              ? `${match.home_score} - ${match.away_score}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {match.status === 'completed' ? '완료' :
                               match.status === 'live' ? '진행중' :
                               match.status === 'cancelled' ? '취소' :
                               match.status === 'postponed' ? '연기' : '예정'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/matches/${match.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {matches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            아직 경기가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 참여자 관리 */}
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>참여자 관리</CardTitle>
                <CardDescription>
                  리그 참여 요청을 승인하거나 거부할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자</TableHead>
                        <TableHead>팀</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map(participant => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <div className="font-medium">
                              {participant.user?.full_name || participant.user?.username || participant.user?.email || '알 수 없음'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {participant.user?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            {participant.team?.name || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {participant.role === 'admin' ? '관리자' :
                               participant.role === 'manager' ? '매니저' : '참여자'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                participant.status === 'approved' ? 'default' :
                                participant.status === 'pending' ? 'secondary' :
                                participant.status === 'rejected' ? 'destructive' : 'outline'
                              }
                            >
                              {participant.status === 'approved' ? '승인됨' :
                               participant.status === 'pending' ? '대기중' :
                               participant.status === 'rejected' ? '거부됨' : '차단됨'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {participant.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproveParticipant(participant.id)}
                                >
                                  승인
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectParticipant(participant.id)}
                                >
                                  거부
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {participants.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            아직 참여자가 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 설정 */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>리그 설정</CardTitle>
                <CardDescription>리그 정보를 수정할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>리그명</Label>
                  <Input
                    value={league.name}
                    onChange={(e) => handleUpdateLeague({ name: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value !== league.name) {
                        handleUpdateLeague({ name: e.target.value });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>시즌명</Label>
                  <Input
                    value={league.season}
                    onChange={(e) => handleUpdateLeague({ season: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value !== league.season) {
                        handleUpdateLeague({ season: e.target.value });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>설명</Label>
                  <Textarea
                    value={league.description || ''}
                    onChange={(e) => handleUpdateLeague({ description: e.target.value })}
                    onBlur={(e) => {
                      if (e.target.value !== (league.description || '')) {
                        handleUpdateLeague({ description: e.target.value || null });
                      }
                    }}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Select
                    value={league.status}
                    onValueChange={(value) => handleUpdateLeague({ status: value as any })}
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
                  <Label>공개 설정</Label>
                  <Select
                    value={league.visibility}
                    onValueChange={(value) => handleUpdateLeague({ visibility: value as any, is_public: value === 'public' })}
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
