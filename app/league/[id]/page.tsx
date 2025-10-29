'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLeague } from '@/lib/data';
import { League, Team, Season, Match } from '@/types';
import { formatDateSlash, roundToWeek, medalFor, computePlayerStats, computeStandings, parseTokenList } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LeaguePage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedRound, setSelectedRound] = useState<string>('ALL');

  useEffect(() => {
    const loadData = () => {
      const leagueId = params.id as string;
      const loadedLeague = getLeague(leagueId);
      if (!loadedLeague) {
        router.push('/');
        return;
      }
      setLeague(loadedLeague);
      
      // 데이터 로드
      const teamsData = (typeof window !== 'undefined' && localStorage.getItem(`teams_${leagueId}`))
        ? JSON.parse(localStorage.getItem(`teams_${leagueId}`)!)
        : [];
      setTeams(teamsData);

      const seasonsData = (typeof window !== 'undefined' && localStorage.getItem(`seasons_${leagueId}`))
        ? JSON.parse(localStorage.getItem(`seasons_${leagueId}`)!)
        : [];
      setSeasons(seasonsData);
      
      if (seasonsData.length > 0) {
        setSelectedSeason(seasonsData[seasonsData.length - 1]);
      }
    };

    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      loadData();
    }
  }, [params.id, router]);

  if (!league) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!selectedSeason) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{league.name}</h1>
          <p className="text-muted-foreground mb-4">아직 시즌이 없습니다.</p>
          <a 
            href="/admin" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            관리 페이지로 이동
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LeagueView 
        league={league}
        teams={teams}
        season={selectedSeason}
        selectedSeason={selectedSeason}
        onSeasonChange={setSelectedSeason}
        seasons={seasons}
      />
    </div>
  );
}

function LeagueView({ 
  league, 
  teams, 
  season, 
  selectedSeason,
  onSeasonChange,
  seasons 
}: { 
  league: League; 
  teams: Team[]; 
  season: Season; 
  selectedSeason: Season;
  onSeasonChange: (s: Season) => void;
  seasons: Season[];
}) {
  const [selectedRound, setSelectedRound] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name || teamId;
  const getTeamColor = (teamId: string) => teams.find(t => t.id === teamId)?.color || 'white';
  
  const matchesByRound = season.rounds.reduce((acc, round) => {
    acc[round.code] = season.matches
      .filter(m => m.round === round.code)
      .sort((a, b) => a.game_no - b.game_no);
    return acc;
  }, {} as Record<string, Match[]>);

  const standings = computeStandings(season, teams);
  const playerStats = computePlayerStats(season);

  const filteredMatches = Object.values(matchesByRound).flat().filter(m => {
    if (selectedRound !== 'ALL' && m.round !== selectedRound) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const text = `${m.round} ${roundToWeek(m.round)} ${getTeamName(m.home)} ${getTeamName(m.away)} ${m.homeScore ?? ''}-${m.awayScore ?? ''} ${m.scorers ?? ''}`.toLowerCase();
    return text.includes(query);
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* 헤더 */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <CardTitle className="text-3xl font-bold text-primary">
                {league.name}
              </CardTitle>
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center">
                  <label className="text-sm text-muted-foreground">시즌</label>
                  <Select
                    value={selectedSeason.id}
                    onValueChange={(value) => {
                      const season = seasons.find(s => s.id === value);
                      if (season) onSeasonChange(season);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative min-w-[260px] flex-1 max-w-[400px]">
                  <Input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="선수 이름을 입력하세요.."
                    className="pr-10"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 001.48-4.23C15.91 6.01 12.9 3 9.45 3S3 6.01 3 9.5 6.01 16 9.45 16a6.5 6.5 0 004.23-1.48l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6.05 0C7 14 5 12 5 9.5S7 5 9.45 5 13.9 7 13.9 9.5 11.9 14 9.45 14z"/>
                  </svg>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 순위 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 경기 요약 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">경기 요약</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {season.rounds.length > 0 && matchesByRound[season.rounds[0].code]?.map(match => (
                    <TableRow key={match.id}>
                      <TableCell className="text-center">{match.game_no}</TableCell>
                      <TableCell className="text-center">{formatDateSlash(season.rounds.find(r => r.code === match.round)?.date || '')}</TableCell>
                      <TableCell className="text-center">
                        {match.homeScore !== null && match.awayScore !== null 
                          ? `${match.homeScore} - ${match.awayScore}`
                          : <span className="text-muted-foreground">예정</span>}
                      </TableCell>
                      <TableCell className="text-center text-sm">{match.scorers || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 순위표 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">순위표</CardTitle>
            </CardHeader>
            <CardContent>
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
                  {standings.map((s, i) => (
                    <TableRow 
                      key={s.teamId} 
                      className={`${
                        i === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20' : 
                        i === 1 ? 'bg-gray-50 dark:bg-gray-900/20' : 
                        i === 2 ? 'bg-orange-50 dark:bg-orange-950/20' : ''
                      }`}
                    >
                      <TableCell className="text-center font-bold">
                        {i + 1 === 1 ? '👑' : i + 1}
                      </TableCell>
                      <TableCell className="text-center font-bold">{getTeamName(s.teamId)}</TableCell>
                      <TableCell className="text-center">{s.played}</TableCell>
                      <TableCell className="text-center">{s.won}</TableCell>
                      <TableCell className="text-center">{s.drawn}</TableCell>
                      <TableCell className="text-center">{s.lost}</TableCell>
                      <TableCell className="text-center">{s.goalsFor}</TableCell>
                      <TableCell className="text-center">{s.goalsAgainst}</TableCell>
                      <TableCell className="text-center">{s.goalDiff}</TableCell>
                      <TableCell className="text-center font-bold">{s.points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* 경기 동영상 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">▶</span>
              경기 동영상
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 라운드 탭 */}
            <div className="flex gap-2 flex-wrap mb-6">
              <Button
                variant={selectedRound === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRound('ALL')}
              >
                전체
              </Button>
              {season.rounds.map(round => (
                <Button
                  key={round.code}
                  variant={selectedRound === round.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedRound(round.code)}
                >
                  {roundToWeek(round.code)} ({round.date.slice(5)})
                </Button>
              ))}
            </div>

            {/* 경기 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.map(match => (
                <Card key={match.id}>
                  <CardContent className="p-4">
                    {match.youtube && (
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube-nocookie.com/embed/${match.youtube}`}
                          allowFullScreen
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-2">
                      {getTeamName(match.home)} {match.homeScore !== null && match.awayScore !== null ? `${match.homeScore} - ${match.awayScore}` : 'vs'} {getTeamName(match.away)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {season.rounds.find(r => r.code === match.round)?.date} · {match.game_no}경기
                    </p>
                    {match.scorers && (
                      <p className="text-sm text-muted-foreground mb-3">득점: {match.scorers}</p>
                    )}
                    {match.youtube && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={`https://youtu.be/${match.youtube}`}
                          target="_blank"
                          rel="noopener"
                        >
                          YouTube에서 보기
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 선수 기록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-primary">⭐</span>
              선수 기록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">순위</TableHead>
                  <TableHead className="text-center">선수</TableHead>
                  <TableHead className="text-center">득점</TableHead>
                  <TableHead className="text-center">도움</TableHead>
                  <TableHead className="text-center">공격포인트</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerStats.map((player, i) => (
                  <TableRow 
                    key={player.name} 
                    className={`${
                      i === 0 ? 'bg-green-50 dark:bg-green-950/20' : 
                      i === 1 ? 'bg-blue-50 dark:bg-blue-950/20' : 
                      i === 2 ? 'bg-purple-50 dark:bg-purple-950/20' : ''
                    }`}
                  >
                    <TableCell className="text-center font-bold">
                      {medalFor(i + 1)} {i + 1}
                    </TableCell>
                    <TableCell className="text-center font-bold">{player.name}</TableCell>
                    <TableCell className="text-center">{player.goals}</TableCell>
                    <TableCell className="text-center">{player.assists}</TableCell>
                    <TableCell className="text-center font-bold">{player.points}</TableCell>
                  </TableRow>
                ))}
                {playerStats.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      아직 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
