'use client';

import React, { useEffect, useState } from 'react';
import { useLineupBuilderStore } from '@/src/store/useLineupBuilderStore';
import { useAuth } from '@/lib/auth-context';
import { Users, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export function TeamSelector() {
  const { user } = useAuth();
  const { teams, selectedTeamId, loadUserTeams, loadTeamPlayers, setSelectedTeamId, clear } = useLineupBuilderStore();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserTeams(user.id).catch((err) => {
        console.error('Failed to load teams:', err);
      });
    }
  }, [user?.id, loadUserTeams]);

  const handleTeamSelect = async (teamId: string) => {
    try {
      setLoading(true);
      setSelectedTeamId(teamId);
      await loadTeamPlayers(teamId);
      setIsOpen(false);
      toast.success('선수 목록을 불러왔습니다!');
    } catch (error) {
      console.error('Failed to load team players:', error);
      toast.error('선수 불러오기 실패');
      setSelectedTeamId(undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    clear();
    setSelectedTeamId(undefined);
    setIsOpen(false);
    toast.success('라인업 초기화');
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="text-center py-4 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">로그인 후 팀을 불러올 수 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          팀 선택
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-green-600" />
          <p className="text-sm text-gray-600">불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 선택된 팀 표시 */}
          {selectedTeam && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedTeam.logo_url && (
                    <img 
                      src={selectedTeam.logo_url} 
                      alt={selectedTeam.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">{selectedTeam.name}</p>
                    <p className="text-xs text-gray-500">활성화됨</p>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          )}

          {/* 팀 목록 */}
          {!selectedTeam && (
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-between"
                disabled={teams.length === 0}
              >
                <span className={teams.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                  {teams.length === 0 ? '등록된 팀이 없습니다' : '팀을 선택하세요'}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && teams.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0"
                    >
                      {team.logo_url && (
                        <img 
                          src={team.logo_url} 
                          alt={team.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{team.name}</p>
                        <p className="text-xs text-gray-500">선수 불러오기</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 팀이 없을 때 */}
          {!isOpen && teams.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">먼저 팀을 생성해주세요</p>
              <a 
                href="/teams/create" 
                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
              >
                팀 만들기 →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

