'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Trophy, Lock, Users, Calendar, AlertCircle, Play, Settings } from 'lucide-react';
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
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    username: string;
    full_name: string | null;
  };
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
  created_at: string;
  home_team?: {
    id: string;
    name: string;
  };
  away_team?: {
    id: string;
    name: string;
  };
}

interface Team {
  id: string;
  name: string;
  short_name: string | null;
}

interface TeamStats {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  teamName: string;
  goals: number;
  assists: number;
  points: number;
}

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [activeTab, setActiveTab] = useState('standings');

  useEffect(() => {
    if (params.id) {
      fetchLeague();
    }
  }, [params.id, user]);

  const fetchLeague = async () => {
    const leagueId = params.id as string;
    setLoading(true);

    try {
      // 리그 정보 가져오기
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select(`
          *,
          creator:users!leagues_created_by_fkey(id, email, username, full_name)
        `)
        .eq('id', leagueId)
        .single();

      if (leagueError) {
        console.error('Error fetching league:', leagueError);
        setLoading(false);
        return;
      }

      if (!leagueData) {
        router.push('/leagues');
        return;
      }

      setLeague(leagueData as League);

      // 권한 체크
      const hasAccessResult = await checkAccess(leagueData as League);

      // 권한이 있으면 데이터 로드
      if (hasAccessResult) {
        await fetchLeagueData(leagueId);
      }
    } catch (error) {
      console.error('Error fetching league:', error);
    } finally {
      setLoading(false);
    }
  };

  const isApprovedParticipant = async (leagueId: string): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from('league_participants')
      .select('id')
      .eq('league_id', leagueId)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();
    return !!data;
  };

  const checkAccess = async (leagueData: League): Promise<boolean> => {
    // 공개 리그는 모두 볼 수 있음
    if (leagueData.visibility === 'public' || leagueData.is_public) {
      setHasAccess(true);
      return true;
    }

    // 비공개 리그는 권한 체크 필요
    if (!user) {
      setHasAccess(false);
      return false;
    }

    // 리그 생성자는 항상 접근 가능
    if (leagueData.created_by === user.id) {
      setHasAccess(true);
      setIsParticipant(true);
      return true;
    }

    // 리그 참여자 확인
    const { data: participant } = await supabase
      .from('league_participants')
      .select('*')
      .eq('league_id', leagueData.id)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();

    if (participant) {
      setHasAccess(true);
      setIsParticipant(true);
      return true;
    } else {
      setHasAccess(false);
      setIsParticipant(false);
      return false;
    }
  };

  const fetchLeagueData = async (leagueId: string) => {
    try {
      // 경기 데이터 가져오기
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name),
          away_team:teams!matches_away_team_id_fkey(id, name)
        `)
        .eq('league_id', leagueId)
        .order('match_date', { ascending: true });

      if (!matchesError && matchesData) {
        setMatches(matchesData as Match[]);

        // 팀 데이터 가져오기 (리그에 참여한 팀들)
        const matchTeamIds = new Set<string>();
        matchesData.forEach(match => {
          if (match.home_team_id) matchTeamIds.add(match.home_team_id);
          if (match.away_team_id) matchTeamIds.add(match.away_team_id);
        });

        if (matchTeamIds.size > 0) {
          const { data: teamsData } = await supabase
            .from('teams')
            .select('id, name, short_name')
            .in('id', Array.from(matchTeamIds));

          if (teamsData) {
            setTeams(teamsData as Team[]);
            // 순위표 계산
            calculateStandings(matchesData as Match[], teamsData as Team[]);
          }
        }

        // 선수 기록 계산
        await calculatePlayerStats(matchesData as Match[]);
      }
    } catch (error) {
      console.error('Error fetching league data:', error);
    }
  };

  const calculateStandings = (matchesData: Match[], teamsData: Team[]) => {
    const teamMap = new Map<string, TeamStats>();

    // 팀 초기화
    teamsData.forEach(team => {
      teamMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0
      });
    });

    // 경기 결과 처리
    matchesData.forEach(match => {
      if (match.home_score !== null && match.away_score !== null && match.status === 'completed') {
        const homeStats = teamMap.get(match.home_team_id);
        const awayStats = teamMap.get(match.away_team_id);

        if (homeStats && awayStats) {
          // 경기 수 증가
          homeStats.played++;
          awayStats.played++;

          // 골 수 업데이트
          homeStats.goalsFor += match.home_score;
          homeStats.goalsAgainst += match.away_score;
          awayStats.goalsFor += match.away_score;
          awayStats.goalsAgainst += match.home_score;

          // 승부 결정 (승리 3점, 무승부 1점, 패배 0점)
          if (match.home_score > match.away_score) {
            homeStats.won++;
            awayStats.lost++;
            homeStats.points += 3;
          } else if (match.home_score < match.away_score) {
            homeStats.lost++;
            awayStats.won++;
            awayStats.points += 3;
          } else {
            homeStats.drawn++;
            awayStats.drawn++;
            homeStats.points += 1;
            awayStats.points += 1;
          }
        }
      }
    });

    // 골득실차 계산
    teamMap.forEach(stats => {
      stats.goalDiff = stats.goalsFor - stats.goalsAgainst;
    });

    // 순위 정렬 (승점 > 골득실차 > 다득점)
    const standings = Array.from(teamMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });

    setTeamStats(standings);
  };

  const calculatePlayerStats = async (matchesData: Match[]) => {
    try {
      const matchIds = matchesData.map(m => m.id);
      
      // 경기 이벤트 가져오기
      const { data: events } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players(id, first_name, last_name, team_id),
          team:teams(id, name)
        `)
        .in('match_id', matchIds)
        .in('event_type', ['goal', 'assist']);

      const playerMap = new Map<string, PlayerStats>();

      events?.forEach(event => {
        if (!event.player) return;
        
        const playerId = event.player.id;
        const playerName = `${event.player.first_name} ${event.player.last_name}`;
        const teamName = event.team?.name || '알 수 없음';

        if (!playerMap.has(playerId)) {
          playerMap.set(playerId, {
            playerId,
            playerName,
            teamName,
            goals: 0,
            assists: 0,
            points: 0
          });
        }

        const stats = playerMap.get(playerId)!;
        if (event.event_type === 'goal') {
          stats.goals++;
          stats.points++;
        } else if (event.event_type === 'assist') {
          stats.assists++;
          stats.points++;
        }
      });

      // 공격포인트 순으로 정렬
      const sortedStats = Array.from(playerMap.values()).sort((a, b) => b.points - a.points);
      setPlayerStats(sortedStats);
    } catch (error) {
      console.error('Error calculating player stats:', error);
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
            <CardDescription>요청하신 리그가 존재하지 않거나 삭제되었습니다.</CardDescription>
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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-6 h-6 text-muted-foreground" />
              <CardTitle>접근 권한이 없습니다</CardTitle>
            </div>
            <CardDescription>
              이 리그는 비공개 리그입니다. 리그 관리자에게 참여 요청을 해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-semibold mb-2">{league.name}</p>
              <p className="text-sm text-muted-foreground">{league.description || '설명이 없습니다.'}</p>
            </div>
            {!user ? (
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                로그인하여 참여 요청하기
              </Button>
            ) : (
              <Button onClick={() => router.push('/leagues')} className="w-full" variant="outline">
                리그 목록으로 돌아가기
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-3xl">{league.name}</CardTitle>
                    {league.visibility === 'private' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        비공개
                      </Badge>
                    )}
                    <Badge
                      variant={
                        league.status === 'active'
                          ? 'default'
                          : league.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {league.status === 'active'
                        ? '진행중'
                        : league.status === 'completed'
                        ? '완료'
                        : league.status === 'cancelled'
                        ? '취소'
                        : '초안'}
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{league.season}</CardDescription>
                  {league.description && (
                    <p className="text-muted-foreground mt-2">{league.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isParticipant && (
                  <Button onClick={() => router.push(`/admin/league/${league.id}`)}>
                    <Settings className="w-4 h-4 mr-2" />
                    리그 관리
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">시즌 시작일</p>
                  <p className="font-medium">
                    {league.start_date
                      ? new Date(league.start_date).toLocaleDateString('ko-KR')
                      : '미정'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">시즌 종료일</p>
                  <p className="font-medium">
                    {league.end_date
                      ? new Date(league.end_date).toLocaleDateString('ko-KR')
                      : '미정'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">생성자</p>
                  <p className="font-medium">
                    {league.creator?.full_name || league.creator?.username || league.creator?.email || '알 수 없음'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 리그 콘텐츠 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="standings">순위</TabsTrigger>
            <TabsTrigger value="matches">경기 동영상</TabsTrigger>
            <TabsTrigger value="players">선수 기록</TabsTrigger>
            <TabsTrigger value="info">리그 정보</TabsTrigger>
          </TabsList>

          {/* 순위표 */}
          <TabsContent value="standings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 경기 요약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">경기 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">경기</TableHead>
                          <TableHead className="text-center">날짜</TableHead>
                          <TableHead className="text-center">스코어</TableHead>
                          <TableHead className="text-center">득점</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.slice(0, 10).map((match, index) => (
                          <TableRow key={match.id}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="text-center">
                              {new Date(match.match_date).toLocaleDateString('ko-KR', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="text-center">
                              {match.home_score !== null && match.away_score !== null
                                ? `${match.home_score} - ${match.away_score}`
                                : <span className="text-muted-foreground">예정</span>}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {match.home_team?.name || '홈'} vs {match.away_team?.name || '어웨이'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {matches.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              아직 경기가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* 순위표 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">순위표</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-center">#</TableHead>
                          <TableHead className="text-center">팀</TableHead>
                          <TableHead className="text-center">경기</TableHead>
                          <TableHead className="text-center">승</TableHead>
                          <TableHead className="text-center">무</TableHead>
                          <TableHead className="text-center">패</TableHead>
                          <TableHead className="text-center">득</TableHead>
                          <TableHead className="text-center">실</TableHead>
                          <TableHead className="text-center">득실</TableHead>
                          <TableHead className="text-center">승점</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamStats.map((stats, i) => (
                          <TableRow
                            key={stats.teamId}
                            className={`${
                              i === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                              i === 1 ? 'bg-gray-50 dark:bg-gray-900/20' :
                              i === 2 ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                            }`}
                          >
                            <TableCell className="text-center font-bold">
                              {i + 1 === 1 ? '👑' : i + 1}
                            </TableCell>
                            <TableCell className="text-center font-bold">{stats.teamName}</TableCell>
                            <TableCell className="text-center">{stats.played}</TableCell>
                            <TableCell className="text-center">{stats.won}</TableCell>
                            <TableCell className="text-center">{stats.drawn}</TableCell>
                            <TableCell className="text-center">{stats.lost}</TableCell>
                            <TableCell className="text-center">{stats.goalsFor}</TableCell>
                            <TableCell className="text-center">{stats.goalsAgainst}</TableCell>
                            <TableCell className="text-center">{stats.goalDiff > 0 ? `+${stats.goalDiff}` : stats.goalDiff}</TableCell>
                            <TableCell className="text-center font-bold">{stats.points}</TableCell>
                          </TableRow>
                        ))}
                        {teamStats.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                              아직 순위 데이터가 없습니다.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 경기 동영상 */}
          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  경기 동영상
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.filter(m => m.youtube).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches
                      .filter(match => match.youtube)
                      .map(match => (
                        <Card key={match.id}>
                          <CardContent className="p-4">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                              <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${match.youtube}`}
                                allowFullScreen
                                title={`${match.home_team?.name || '홈'} vs ${match.away_team?.name || '어웨이'}`}
                              />
                            </div>
                            <h3 className="text-lg font-bold mb-2">
                              {match.home_team?.name || '홈'} {match.home_score !== null && match.away_score !== null ? `${match.home_score} - ${match.away_score}` : 'vs'} {match.away_team?.name || '어웨이'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(match.match_date).toLocaleDateString('ko-KR')}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="w-full"
                            >
                              <a
                                href={`https://youtu.be/${match.youtube}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                YouTube에서 보기
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>아직 경기 동영상이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 선수 기록 */}
          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle>선수 기록</CardTitle>
                <CardDescription>리그 전체 기록</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">순위</TableHead>
                        <TableHead className="text-center">선수</TableHead>
                        <TableHead className="text-center">팀</TableHead>
                        <TableHead className="text-center">득점</TableHead>
                        <TableHead className="text-center">도움</TableHead>
                        <TableHead className="text-center">공격포인트</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerStats.map((player, i) => (
                        <TableRow
                          key={player.playerId}
                          className={`${
                            i === 0 ? 'bg-green-50 dark:bg-green-950/20' :
                            i === 1 ? 'bg-blue-50 dark:bg-blue-950/20' :
                            i === 2 ? 'bg-purple-50 dark:bg-purple-950/20' : ''
                          }`}
                        >
                          <TableCell className="text-center font-bold">
                            {i + 1 === 1 ? '🥇' : i + 1 === 2 ? '🥈' : i + 1 === 3 ? '🥉' : i + 1}
                          </TableCell>
                          <TableCell className="text-center font-bold">{player.playerName}</TableCell>
                          <TableCell className="text-center">{player.teamName}</TableCell>
                          <TableCell className="text-center">{player.goals}</TableCell>
                          <TableCell className="text-center">{player.assists}</TableCell>
                          <TableCell className="text-center font-bold">{player.points}</TableCell>
                        </TableRow>
                      ))}
                      {playerStats.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            아직 선수 기록이 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 리그 정보 */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>리그 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">리그 상태</p>
                    <Badge
                      variant={
                        league.status === 'active'
                          ? 'default'
                          : league.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {league.status === 'active'
                        ? '진행중'
                        : league.status === 'completed'
                        ? '완료'
                        : league.status === 'cancelled'
                        ? '취소'
                        : '초안'}
                    </Badge>
                  </div>
                  {league.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">설명</p>
                      <p>{league.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">생성일</p>
                    <p>{new Date(league.created_at).toLocaleDateString('ko-KR')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
