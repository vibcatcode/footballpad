'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLeague, saveLeague, generateId } from '@/lib/data';
import { League, Team, Season, Match } from '@/types';

export default function LeagueDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    const leagueId = params.id as string;
    const loadedLeague = getLeague(leagueId);
    if (!loadedLeague) {
      router.push('/admin');
      return;
    }
    setLeague(loadedLeague);
    loadLeagueData(loadedLeague);
  }, [params.id, router]);

  const loadLeagueData = (leagueData: League) => {
    // 팀 데이터 로드
    const teamsData = (typeof window !== 'undefined' && localStorage.getItem(`teams_${leagueData.id}`))
      ? JSON.parse(localStorage.getItem(`teams_${leagueData.id}`)!)
      : [];
    setTeams(teamsData);

    // 시즌 데이터 로드
    const seasonsData = (typeof window !== 'undefined' && localStorage.getItem(`seasons_${leagueData.id}`))
      ? JSON.parse(localStorage.getItem(`seasons_${leagueData.id}`)!)
      : [];
    setSeasons(seasonsData);
  };

  if (!league) return <div className="min-h-screen bg-[#0b0f14] p-8">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#e8eef7] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{league.name}</h1>
            <p className="text-[#9aa7b8]">리그 관리</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 border border-[#1e2633] rounded-lg hover:bg-[#121821] transition-colors"
            >
              뒤로
            </button>
            <button
              onClick={() => router.push(`/league/${league.id}`)}
              className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
            >
              리그 보기
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <TeamManager league={league} teams={teams} onUpdate={() => loadLeagueData(league)} />
          <SeasonManager league={league} seasons={seasons} teams={teams} onUpdate={() => loadLeagueData(league)} />
        </div>
      </div>
    </div>
  );
}

function TeamManager({ league, teams, onUpdate }: { league: League; teams: Team[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState<Team['color']>('white');

  const saveTeam = () => {
    if (!teamName.trim()) return;
    
    const newTeam: Team = {
      id: generateId(),
      clubId: league.id, // 임시로 league.id를 clubId로 사용
      name: teamName,
      color: teamColor,
      level: 'intermediate',
      eloRating: 1200,
      preferredDays: [],
      preferredTimes: [],
      createdAt: new Date().toISOString()
    };
    
    const updatedTeams = [...teams, newTeam];
    localStorage.setItem(`teams_${league.id}`, JSON.stringify(updatedTeams));
    
    const updatedLeague: League = {
      ...league,
      teamIds: [...league.teamIds, newTeam.id]
    };
    saveLeague(updatedLeague);
    
    setTeamName('');
    setTeamColor('white');
    setShowForm(false);
    onUpdate();
  };

  const deleteTeam = (teamId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    const updatedTeams = teams.filter(t => t.id !== teamId);
    localStorage.setItem(`teams_${league.id}`, JSON.stringify(updatedTeams));
    
    const updatedLeague: League = {
      ...league,
      teamIds: league.teamIds.filter(id => id !== teamId)
    };
    saveLeague(updatedLeague);
    onUpdate();
  };

  const colorClasses = {
    white: 'bg-white text-[#0b0f14]',
    blue: 'bg-blue-900 text-white',
    red: 'bg-red-700 text-white',
    green: 'bg-green-700 text-white',
    yellow: 'bg-yellow-600 text-white',
    purple: 'bg-purple-700 text-white',
    black: 'bg-black text-white',
    orange: 'bg-orange-600 text-white'
  };

  return (
    <div className="bg-[#121821] border border-[#1e2633] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">팀 관리</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
          >
            + 팀 추가
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-[#0f1520] rounded-lg p-4 mb-4">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm text-[#9aa7b8]">팀 이름</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
                placeholder="예: 믿음, 소망, 사랑"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-[#9aa7b8]">팀 색상</label>
              <div className="grid grid-cols-3 gap-2">
                {(['white', 'blue', 'red', 'green', 'yellow', 'purple', 'black', 'orange'] as Team['color'][]).map(color => (
                  <button
                    key={color}
                    onClick={() => setTeamColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      teamColor === color ? 'border-[#00d18f]' : 'border-transparent'
                    } ${colorClasses[color]}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={saveTeam}
                className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
              >
                추가
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setTeamName('');
                }}
                className="px-4 py-2 border border-[#1e2633] rounded-lg hover:bg-[#121821] transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {teams.map(team => (
          <div key={team.id} className="bg-[#0f1520] border border-[#1e2633] rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${colorClasses[team.color]}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                {team.name}
              </span>
              <button
                onClick={() => deleteTeam(team.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonManager({ league, seasons, teams, onUpdate }: { league: League; seasons: Season[]; teams: Team[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [seasonLabel, setSeasonLabel] = useState('');
  const [yearMonth, setYearMonth] = useState('');

  const saveSeason = () => {
    if (!seasonLabel.trim() || !yearMonth.trim()) return;
    
    const newSeason: Season = {
      id: generateId(),
      clubId: league.id, // 임시로 league.id를 clubId로 사용
      name: seasonLabel,
      type: 'league',
      startDate: yearMonth + '-01',
      endDate: yearMonth + '-31',
      status: 'upcoming',
      teams: [],
      rounds: [],
      matches: [],
      settings: {
        pointsForWin: 3,
        pointsForDraw: 1,
        maxPlayersPerTeam: 11,
        allowSubstitutions: true,
        extraTime: false,
        penalties: false
      },
      createdAt: new Date().toISOString()
    };
    
    const updatedSeasons = [...seasons, newSeason];
    localStorage.setItem(`seasons_${league.id}`, JSON.stringify(updatedSeasons));
    
    const updatedLeague: League = {
      ...league,
      seasonIds: [...league.seasonIds, newSeason.id]
    };
    saveLeague(updatedLeague);
    
    setSeasonLabel('');
    setYearMonth('');
    setShowForm(false);
    onUpdate();
  };

  return (
    <div className="bg-[#121821] border border-[#1e2633] rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">시즌 관리</h2>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
        >
          + 시즌 추가
        </button>
      ) : (
        <div className="bg-[#0f1520] rounded-lg p-4 space-y-4">
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">시즌 이름</label>
            <input
              type="text"
              value={seasonLabel}
              onChange={(e) => setSeasonLabel(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
              placeholder="예: 2025년 1월"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-[#9aa7b8]">연도-월 (YYYY-MM)</label>
            <input
              type="text"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
              className="w-full px-4 py-2 bg-[#121821] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
              placeholder="예: 2025-01"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={saveSeason}
              className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
            >
              추가
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSeasonLabel('');
                setYearMonth('');
              }}
              className="px-4 py-2 border border-[#1e2633] rounded-lg hover:bg-[#121821] transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {seasons.map(season => (
          <div key={season.id} className="bg-[#0f1520] border border-[#1e2633] rounded-lg p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{season.name}</h3>
              <p className="text-sm text-[#9aa7b8]">{season.startDate}</p>
            </div>
            <a
              href={`/admin/season/${season.id}`}
              className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors inline-block"
            >
              관리
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
