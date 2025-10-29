'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLeague, generateId } from '@/lib/data';
import { League, Team, Season, Match, Round } from '@/types';

export default function SeasonAdminPage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const seasonId = params.id as string;
    
    // 모든 리그의 시즌 데이터를 찾아봅니다
    const allLeagues = (typeof window !== 'undefined' && localStorage.getItem('footballpad_leagues'))
      ? JSON.parse(localStorage.getItem('footballpad_leagues')!)
      : [];
    
    let foundSeason: Season | null = null;
    let leagueId: string = '';
    
    for (const lg of allLeagues) {
      const seasonsData = (typeof window !== 'undefined' && localStorage.getItem(`seasons_${lg.id}`))
        ? JSON.parse(localStorage.getItem(`seasons_${lg.id}`)!)
        : [];
      const season = seasonsData.find((s: Season) => s.id === seasonId);
      if (season) {
        foundSeason = season;
        leagueId = lg.id;
        break;
      }
    }
    
    if (!foundSeason) {
      router.push('/admin');
      return;
    }
    
    setSeason(foundSeason);
    const loadedLeague = getLeague(leagueId);
    setLeague(loadedLeague);
    
    if (loadedLeague) {
      const teamsData = (typeof window !== 'undefined' && localStorage.getItem(`teams_${leagueId}`))
        ? JSON.parse(localStorage.getItem(`teams_${leagueId}`)!)
        : [];
      setTeams(teamsData);
    }
  }, [params.id, router]);

  const saveSeason = (updatedSeason: Season) => {
    if (!season) return;
    const seasonsData = (typeof window !== 'undefined' && localStorage.getItem(`seasons_${season.leagueId}`))
      ? JSON.parse(localStorage.getItem(`seasons_${season.leagueId}`)!)
      : [];
    const updated = seasonsData.map((s: Season) => s.id === updatedSeason.id ? updatedSeason : s);
    localStorage.setItem(`seasons_${season.leagueId}`, JSON.stringify(updated));
    setSeason(updatedSeason);
  };

  if (!season || !league) return <div className="min-h-screen bg-[#0b0f14] p-8">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#e8eef7] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{season.label}</h1>
            <p className="text-[#9aa7b8]">시즌 관리</p>
          </div>
          <button
            onClick={() => router.push(`/admin/league/${league.id}`)}
            className="px-4 py-2 border border-[#1e2633] rounded-lg hover:bg-[#121821] transition-colors"
          >
            뒤로
          </button>
        </div>

        <RoundManager season={season} teams={teams} onUpdate={saveSeason} />
        <MatchManager season={season} teams={teams} onUpdate={saveSeason} />
      </div>
    </div>
  );
}

function RoundManager({ season, teams, onUpdate }: { season: Season; teams: Team[]; onUpdate: (season: Season) => void }) {
  const [roundCode, setRoundCode] = useState('');
  const [roundDate, setRoundDate] = useState('');

  const addRound = () => {
    if (!roundCode.trim() || !roundDate.trim()) return;
    
    const newRound: Round = {
      code: roundCode,
      date: roundDate
    };
    
    const updatedSeason: Season = {
      ...season,
      rounds: [...season.rounds, newRound]
    };
    
    onUpdate(updatedSeason);
    setRoundCode('');
    setRoundDate('');
  };

  const deleteRound = (code: string) => {
    if (!confirm('라운드를 삭제하면 해당 경기도 모두 삭제됩니다. 계속하시겠습니까?')) return;
    
    const updatedSeason: Season = {
      ...season,
      rounds: season.rounds.filter(r => r.code !== code),
      matches: season.matches.filter(m => m.round !== code)
    };
    
    onUpdate(updatedSeason);
  };

  return (
    <div className="bg-[#121821] border border-[#1e2633] rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">라운드 관리</h2>
      <div className="bg-[#0f1520] rounded-lg p-4 mb-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">라운드 코드</label>
            <input
              type="text"
              value={roundCode}
              onChange={(e) => setRoundCode(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
              placeholder="예: R1, R2, R3"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">경기일</label>
            <input
              type="date"
              value={roundDate}
              onChange={(e) => setRoundDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
            />
          </div>
        </div>
        <button
          onClick={addRound}
          className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
        >
          라운드 추가
        </button>
      </div>

      <div className="space-y-2">
        {season.rounds.map(round => (
          <div key={round.code} className="bg-[#0f1520] border border-[#1e2633] rounded-lg p-4 flex justify-between items-center">
            <div>
              <span className="font-bold">{round.code}</span>
              <span className="mx-4 text-[#9aa7b8]">{round.date}</span>
            </div>
            <button
              onClick={() => deleteRound(round.code)}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchManager({ season, teams, onUpdate }: { season: Season; teams: Team[]; onUpdate: (season: Season) => void }) {
  const [selectedRound, setSelectedRound] = useState('');
  const [matchRound, setMatchRound] = useState('');
  const [matchHome, setMatchHome] = useState('');
  const [matchAway, setMatchAway] = useState('');
  const [matchHomeScore, setMatchHomeScore] = useState<number | null>(null);
  const [matchAwayScore, setMatchAwayScore] = useState<number | null>(null);
  const [matchScorers, setMatchScorers] = useState('');
  const [matchYoutube, setMatchYoutube] = useState('');

  const addMatch = () => {
    if (!matchRound || !matchHome || !matchAway) return;
    
    const existingMatches = season.matches.filter(m => m.round === matchRound);
    const gameNo = existingMatches.length + 1;
    
    const newMatch: Match = {
      id: generateId(),
      round: matchRound,
      game_no: gameNo,
      home: matchHome,
      away: matchAway,
      homeScore: matchHomeScore,
      awayScore: matchAwayScore,
      youtube: matchYoutube || undefined,
      scorers: matchScorers || undefined
    };
    
    const updatedSeason: Season = {
      ...season,
      matches: [...season.matches, newMatch]
    };
    
    onUpdate(updatedSeason);
    setMatchRound('');
    setMatchHome('');
    setMatchAway('');
    setMatchHomeScore(null);
    setMatchAwayScore(null);
    setMatchScorers('');
    setMatchYoutube('');
  };

  const deleteMatch = (matchId: string) => {
    const updatedSeason: Season = {
      ...season,
      matches: season.matches.filter(m => m.id !== matchId)
    };
    onUpdate(updatedSeason);
  };

  const getMatchesByRound = (roundCode: string) => {
    return season.matches.filter(m => m.round === roundCode).sort((a, b) => a.game_no - b.game_no);
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || teamId;
  };

  return (
    <div className="bg-[#121821] border border-[#1e2633] rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">경기 결과 관리</h2>
      
      <div className="bg-[#0f1520] rounded-lg p-4 mb-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">라운드</label>
            <select
              value={matchRound}
              onChange={(e) => setMatchRound(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
            >
              <option value="">선택</option>
              {season.rounds.map(r => (
                <option key={r.code} value={r.code}>{r.code}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">홈 팀</label>
            <select
              value={matchHome}
              onChange={(e) => setMatchHome(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
            >
              <option value="">선택</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">어웨이 팀</label>
            <select
              value={matchAway}
              onChange={(e) => setMatchAway(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
            >
              <option value="">선택</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">홈 득점</label>
            <input
              type="number"
              value={matchHomeScore ?? ''}
              onChange={(e) => setMatchHomeScore(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
              min="0"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">어웨이 득점</label>
            <input
              type="number"
              value={matchAwayScore ?? ''}
              onChange={(e) => setMatchAwayScore(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
              min="0"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 text-sm text-[#9aa7b8]">득점자 (쉼표로 구분)</label>
          <input
            type="text"
            value={matchScorers}
            onChange={(e) => setMatchScorers(e.target.value)}
            className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
            placeholder="예: 이근희, 김정룡, 하종필(2)"
          />
        </div>
        <div>
          <label className="block mb-2 text-sm text-[#9aa7b8]">YouTube ID</label>
          <input
            type="text"
            value={matchYoutube}
            onChange={(e) => setMatchYoutube(e.target.value)}
            className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
            placeholder="예: bAzkBDe359I"
          />
        </div>
        <button
          onClick={addMatch}
          className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
        >
          경기 추가
        </button>
      </div>

      <div className="space-y-6">
        {season.rounds.map(round => (
          <div key={round.code} className="bg-[#0f1520] rounded-lg p-4">
            <h3 className="font-bold mb-4">{round.code} - {round.date}</h3>
            <div className="space-y-2">
              {getMatchesByRound(round.code).map(match => (
                <div key={match.id} className="bg-[#121821] border border-[#1e2633] rounded-lg p-4 flex justify-between items-center">
                  <div className="flex gap-4">
                    <span className="text-[#9aa7b8]">{match.game_no}경기</span>
                    <span>{getTeamName(match.home)}</span>
                    <span className="text-[#9aa7b8]">vs</span>
                    <span>{getTeamName(match.away)}</span>
                    {match.homeScore !== null && match.awayScore !== null && (
                      <span className="font-bold">{match.homeScore} - {match.awayScore}</span>
                    )}
                    {match.scorers && (
                      <span className="text-sm text-[#9aa7b8]">득점: {match.scorers}</span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMatch(match.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
