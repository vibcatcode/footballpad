'use client';

import React, { useState } from 'react';
import { useLineupBuilderStore } from '@/src/store/useLineupBuilderStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const POSITIONS = ['GK', 'DF', 'MF', 'FW'];

export function LineupPlayerManager() {
  const { players, addPlayer, removePlayer, selectedPlayerId } = useLineupBuilderStore();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [role, setRole] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !number.trim() || !role.trim()) {
      toast.error('모든 정보를 입력해주세요');
      return;
    }

    const playerId = uuidv4();
    addPlayer({
      player_id: playerId,
      name: name.trim(),
      number: parseInt(number),
      role: role.trim(),
      position: { x: 0.5, y: 0.5 }, // 중앙에 배치
    });

    toast.success('선수 추가 완료!');
    setName('');
    setNumber('');
    setRole('');
  };

  const handleRemove = (playerId: string) => {
    removePlayer(playerId);
    toast.success('선수 제거 완료');
  };

  const selectedCount = players.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5" />
          선수 관리
        </h2>
        <span className="text-sm text-gray-500">
          {selectedCount}명
        </span>
      </div>

      {/* 선수 추가 폼 */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="선수 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="등번호"
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">포지션</option>
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          onClick={handleAdd}
        >
          <Plus className="w-4 h-4" />
          선수 추가
        </button>
      </div>

      {/* 선수 목록 */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">선수를 추가하세요</p>
          </div>
        ) : (
          players.map((player) => (
            <div
              key={player.player_id}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlayerId === player.player_id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{player.number}</span>
                  <span className="text-gray-700">{player.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {player.role}
                  </span>
                  <button
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    onClick={() => handleRemove(player.player_id)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

