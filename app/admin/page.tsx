'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllLeagues, saveLeague, generateId } from '@/lib/data';
import { League, Team, Season } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [showLeagueForm, setShowLeagueForm] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueDesc, setLeagueDesc] = useState('');

  useEffect(() => {
    setLeagues(getAllLeagues());
  }, []);

  const createLeague = () => {
    if (!leagueName.trim()) return;
    
    const newLeague: League = {
      id: generateId(),
      name: leagueName,
      description: leagueDesc || undefined,
      createdAt: new Date().toISOString(),
      teamIds: [],
      seasonIds: []
    };
    
    saveLeague(newLeague);
    setLeagues(getAllLeagues());
    setLeagueName('');
    setLeagueDesc('');
    setShowLeagueForm(false);
    setSelectedLeague(newLeague);
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-[#e8eef7] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">리그 관리</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 border border-[#1e2633] rounded-lg hover:bg-[#121821] transition-colors"
            >
              홈으로
            </button>
            {selectedLeague && (
              <button
                onClick={() => router.push(`/league/${selectedLeague.id}`)}
                className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
              >
                리그 보기
              </button>
            )}
          </div>
        </div>

        {!showLeagueForm ? (
          <div className="mb-8">
            <button
              onClick={() => setShowLeagueForm(true)}
              className="px-6 py-3 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
            >
              + 새 리그 만들기
            </button>
          </div>
        ) : (
          <div className="bg-[#121821] border border-[#1e2633] rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">새 리그 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-[#9aa7b8]">리그 이름</label>
                <input
                  type="text"
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f1520] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
                  placeholder="예: 호산나 프리미어리그"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-[#9aa7b8]">설명 (선택)</label>
                <input
                  type="text"
                  value={leagueDesc}
                  onChange={(e) => setLeagueDesc(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0f1520] border border-[#1e2633] rounded-lg text-[#e8eef7] focus:outline-none focus:border-[#00d18f]"
                  placeholder="리그에 대한 간단한 설명"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={createLeague}
                  className="px-6 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
                >
                  생성
                </button>
                <button
                  onClick={() => {
                    setShowLeagueForm(false);
                    setLeagueName('');
                    setLeagueDesc('');
                  }}
                  className="px-6 py-2 border border-[#1e2633] rounded-lg hover:bg-[#121821] transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {leagues.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">리그 선택</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leagues.map(league => (
                <button
                  key={league.id}
                  onClick={() => setSelectedLeague(league)}
                  className={`p-6 bg-[#121821] border rounded-xl text-left transition-colors ${
                    selectedLeague?.id === league.id
                      ? 'border-[#00d18f] bg-[#121821]'
                      : 'border-[#1e2633] hover:bg-[#121821]'
                  }`}
                >
                  <h3 className="text-lg font-bold mb-1">{league.name}</h3>
                  {league.description && (
                    <p className="text-sm text-[#9aa7b8] mb-2">{league.description}</p>
                  )}
                  <div className="text-sm text-[#9aa7b8]">
                    팀 {league.teamIds.length}개 · 시즌 {league.seasonIds.length}개
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedLeague && (
          <div className="mt-8">
            <LeagueEditor league={selectedLeague} onUpdate={(league) => {
              saveLeague(league);
              setLeagues(getAllLeagues());
              setSelectedLeague(league);
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function LeagueEditor({ league, onUpdate }: { league: League; onUpdate: (league: League) => void }) {
  const router = useRouter();
  return (
    <div className="bg-[#121821] border border-[#1e2633] rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{league.name} 관리</h2>
        <button
          onClick={() => router.push(`/admin/league/${league.id}`)}
          className="px-4 py-2 bg-[#00d18f] text-[#0b0f14] font-bold rounded-lg hover:bg-[#0aa77f] transition-colors"
        >
          상세 관리
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0f1520] rounded-lg p-4">
          <div className="text-sm text-[#9aa7b8] mb-2">팀</div>
          <div className="text-2xl font-bold">{league.teamIds.length}</div>
        </div>
        <div className="bg-[#0f1520] rounded-lg p-4">
          <div className="text-sm text-[#9aa7b8] mb-2">시즌</div>
          <div className="text-2xl font-bold">{league.seasonIds.length}</div>
        </div>
        <div className="bg-[#0f1520] rounded-lg p-4">
          <div className="text-sm text-[#9aa7b8] mb-2">생성일</div>
          <div className="text-sm">{new Date(league.createdAt).toLocaleDateString('ko-KR')}</div>
        </div>
      </div>
    </div>
  );
}
