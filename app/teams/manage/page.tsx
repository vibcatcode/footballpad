'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Settings, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Trophy,
  Calendar,
  BarChart3,
  Send,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Team {
  id: string;
  name: string;
  short_name: string | null;
  location: string | null;
  founded_year: number | null;
  description: string | null;
  created_by: string;
}

interface League {
  id: string;
  name: string;
  description: string | null;
  season: string | null;
  status: string;
  visibility: string;
  created_by: string;
}

interface TeamStats {
  totalTeams: number;
  activeTeams: number;
  totalPlayers: number;
  totalStaff: number;
}

export default function ManageTeamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<TeamStats>({
    totalTeams: 0,
    activeTeams: 0,
    totalPlayers: 0,
    totalStaff: 0,
  });
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchTeams();
      fetchStats();
    }
  }, [user]);

  const fetchTeams = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      // 사용자가 생성한 팀 ID 목록 가져오기
      const { data: userTeams } = await supabase
        .from('teams')
        .select('id')
        .eq('created_by', user.id);

      const userTeamIds = userTeams?.map(t => t.id) || [];
      const totalTeams = userTeamIds.length;

      if (totalTeams === 0) {
        setStats({
          totalTeams: 0,
          activeTeams: 0,
          totalPlayers: 0,
          totalStaff: 0,
        });
        return;
      }

      // 선수 수 계산
      const { count: playersCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .in('team_id', userTeamIds);

      setStats({
        totalTeams,
        activeTeams: totalTeams, // 모든 팀을 활성으로 간주
        totalPlayers: playersCount || 0,
        totalStaff: 0, // 스태프 테이블이 없으므로 0으로 설정
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeagues = async () => {
    if (!user) return;
    setLoadingLeagues(true);
    try {
      // 사용자가 만든 리그
      const { data: myLeaguesData, error: myError } = await supabase
        .from('leagues')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      // 공개 리그 (사용자가 만든 것 제외)
      const { data: publicLeaguesData, error: publicError } = await supabase
        .from('leagues')
        .select('*')
        .eq('visibility', 'public')
        .neq('created_by', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (myError || publicError) {
        console.error('Error fetching leagues:', myError || publicError);
        return;
      }

      setMyLeagues(myLeaguesData || []);
      setPublicLeagues(publicLeaguesData || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const searchPublicLeagues = async (query: string) => {
    if (!user || !query.trim()) {
      setPublicLeagues([]);
      return;
    }

    setLoadingLeagues(true);
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('visibility', 'public')
        .neq('created_by', user.id)
        .eq('status', 'active')
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching leagues:', error);
        return;
      }

      setPublicLeagues(data || []);
    } catch (error) {
      console.error('Error searching leagues:', error);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // 기존 타이머가 있으면 취소
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // 검색어가 비어있으면 즉시 클리어
    if (!query.trim()) {
      setPublicLeagues([]);
      return;
    }

    // 500ms 후에 검색 실행
    const timeout = setTimeout(() => {
      searchPublicLeagues(query);
    }, 500);

    setSearchTimeout(timeout);
  };

  const handleOpenDialog = (team: Team) => {
    setSelectedTeam(team);
    setSelectedLeagues([]);
    setSearchQuery('');
    setPublicLeagues([]);
    fetchLeagues();
    setDialogOpen(true);
  };

  const handleLeagueToggle = (leagueId: string) => {
    setSelectedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleSendLeagueRequests = async () => {
    if (!user || !selectedTeam || selectedLeagues.length === 0) return;

    setSubmitting(true);
    try {
      // 이미 참여 중인 리그 확인
      const { data: existingParticipants } = await supabase
        .from('league_participants')
        .select('league_id')
        .eq('team_id', selectedTeam.id)
        .in('league_id', selectedLeagues);

      const existingLeagueIds = new Set(existingParticipants?.map(p => p.league_id) || []);
      const newLeagueIds = selectedLeagues.filter(id => !existingLeagueIds.has(id));

      if (newLeagueIds.length === 0) {
        alert('이미 선택한 리그에 모두 참여 중입니다.');
        setSubmitting(false);
        return;
      }

      const participantRequests = newLeagueIds.map(leagueId => ({
        league_id: leagueId,
        user_id: user.id,
        team_id: selectedTeam.id,
        role: 'participant' as const,
        status: 'pending' as const,
      }));

      const { error: requestError } = await supabase
        .from('league_participants')
        .insert(participantRequests);

      if (requestError) {
        console.error('Error sending league requests:', requestError);
        alert('리그 참여 요청 전송에 실패했습니다.');
        setSubmitting(false);
        return;
      }

      alert(`${newLeagueIds.length}개의 리그에 참여 요청을 보냈습니다!`);
      setDialogOpen(false);
      setSelectedTeam(null);
      setSelectedLeagues([]);
      setSubmitting(false);
    } catch (error) {
      console.error('Error sending league requests:', error);
      alert('리그 참여 요청 전송에 실패했습니다.');
      setSubmitting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">팀 관리</h1>
            <p className="text-gray-600 dark:text-gray-300">등록된 팀들을 관리하고 정보를 수정하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button size="sm" asChild>
              <Link href="/teams/create">
                <Plus className="w-4 h-4 mr-2" />
                새 팀 추가
              </Link>
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 팀</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">내가 만든 팀</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 팀</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTeams}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTeams > 0 ? '100%' : '0%'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 선수</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTeams > 0
                  ? `평균 ${Math.round(stats.totalPlayers / stats.totalTeams)}명/팀`
                  : '팀 없음'
                }
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 스태프</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTeams > 0
                  ? `평균 ${Math.round(stats.totalStaff / stats.totalTeams)}명/팀`
                  : '팀 없음'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 팀 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>내 팀 목록</CardTitle>
            <CardDescription>내가 생성한 팀들을 관리하고 리그에 참여 요청을 보낼 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            {teams.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">팀이 없습니다</h3>
                <p className="text-muted-foreground mb-6">
                  첫 번째 팀을 만들어보세요!
                </p>
                <Button asChild>
                  <Link href="/teams/create">
                    <Plus className="w-4 h-4 mr-2" />
                    팀 생성
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{team.name}</h3>
                          {team.short_name && (
                            <span className="text-sm text-muted-foreground">({team.short_name})</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {team.location && <span>{team.location}</span>}
                          {team.location && team.founded_year && <span>•</span>}
                          {team.founded_year && <span>창단: {team.founded_year}</span>}
                        </div>
                        {team.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {team.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog open={dialogOpen && selectedTeam?.id === team.id} onOpenChange={(open) => {
                        if (!open) {
                          setDialogOpen(false);
                          setSelectedTeam(null);
                          setSelectedLeagues([]);
                          setSearchQuery('');
                          setPublicLeagues([]);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenDialog(team)}
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            리그 참여
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>리그 참여 요청 보내기</DialogTitle>
                            <DialogDescription>
                              "{team.name}" 팀을 리그에 참여시키기 위한 요청을 보냅니다.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 mt-4">
                            {/* 내가 만든 리그 */}
                            {myLeagues.length > 0 && (
                              <div className="space-y-2">
                                <Label>내가 만든 리그</Label>
                                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                                  {myLeagues.map(league => (
                                    <div
                                      key={league.id}
                                      className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                                      onClick={() => handleLeagueToggle(league.id)}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{league.name}</span>
                                          {league.season && (
                                            <Badge variant="outline" className="text-xs">
                                              {league.season}
                                            </Badge>
                                          )}
                                        </div>
                                        {league.description && (
                                          <p className="text-xs text-muted-foreground truncate">
                                            {league.description}
                                          </p>
                                        )}
                                      </div>
                                      {selectedLeagues.includes(league.id) ? (
                                        <CheckCircle2 className="w-5 h-5 text-primary" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-muted" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 공개 리그 검색 */}
                            <div className="space-y-2">
                              <Label>공개 리그 검색</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="리그 이름으로 검색..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                              {searchQuery && (
                                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                                  {loadingLeagues ? (
                                    <div className="text-sm text-muted-foreground text-center py-2">
                                      검색 중...
                                    </div>
                                  ) : publicLeagues.length > 0 ? (
                                    publicLeagues.map(league => (
                                      <div
                                        key={league.id}
                                        className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                                        onClick={() => handleLeagueToggle(league.id)}
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{league.name}</span>
                                            {league.season && (
                                              <Badge variant="outline" className="text-xs">
                                                {league.season}
                                              </Badge>
                                            )}
                                          </div>
                                          {league.description && (
                                            <p className="text-xs text-muted-foreground truncate">
                                              {league.description}
                                            </p>
                                          )}
                                        </div>
                                        {selectedLeagues.includes(league.id) ? (
                                          <CheckCircle2 className="w-5 h-5 text-primary" />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full border-2 border-muted" />
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm text-muted-foreground text-center py-2">
                                      검색 결과가 없습니다
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {selectedLeagues.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-primary p-3 bg-primary/10 rounded-lg">
                                <Send className="w-4 h-4" />
                                <span>{selectedLeagues.length}개의 리그에 참여 요청을 보냅니다</span>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4 border-t">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setDialogOpen(false);
                                  setSelectedTeam(null);
                                  setSelectedLeagues([]);
                                  setSearchQuery('');
                                  setPublicLeagues([]);
                                }}
                              >
                                취소
                              </Button>
                              <Button 
                                onClick={handleSendLeagueRequests}
                                disabled={selectedLeagues.length === 0 || submitting}
                              >
                                {submitting ? (
                                  <>
                                    <Users className="w-4 h-4 mr-2 animate-spin" />
                                    전송 중...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    참여 요청 보내기
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/teams/${team.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/teams/${team.id}`}>
                          <Settings className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
