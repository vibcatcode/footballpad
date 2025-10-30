import React, { useState } from 'react';
import { useLineupStore } from '../store/useLineupStore';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export function TeamManager() {
  const {
    teamName, setTeamName, formation, logoUrl, setLogoUrl, players,
    addPlayer, removePlayer, reset, saveTeamToDB, loadTeamFromDB, saveLineupToDB, loadLineupFromDB,
  } = useLineupStore();
  const [loadTeamId, setLoadTeamId] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // 팀 저장 버튼 핸들러
  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const team = await saveTeamToDB();
      toast.success('팀 저장 성공!');
    } catch(e:any) {
      toast.error('팀 저장 실패: ' + (e?.message || e));
    } finally { setSaveLoading(false); }
  };
  const handleLoad = async () => {
    try {
      await loadTeamFromDB(loadTeamId);
      toast.success('팀 불러오기 성공!');
    } catch(e:any) {
      toast.error('팀 불러오기 실패: ' + (e?.message || e));
    }
  };

  return (
    <section className="bg-white rounded shadow p-4 w-80">
      <div className="mb-2 flex flex-col gap-2">
        <input className="border rounded p-2" placeholder="팀명" value={teamName} onChange={e=>setTeamName(e.target.value)} />
        <input className="border rounded p-2" placeholder="로고 URL (선택)" value={logoUrl||''} onChange={e=>setLogoUrl(e.target.value)} />
      </div>
      <h2 className="font-semibold mb-1">선수 목록</h2>
      <ul className="divide-y divide-gray-100 mb-2">
        {players.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-1">
            <span>{p.number} {p.name} ({p.position})</span>
            <button className="text-xs text-red-500" onClick={()=>removePlayer(p.id)}>삭제</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mb-2">
        <button className="text-xs px-2 py-1 bg-red-100 rounded hover:bg-red-200" onClick={reset}>전체 삭제</button>
        <button className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
         onClick={handleSave} disabled={saveLoading}>
          {saveLoading ? '저장 중...' : 'DB 저장하기'}
        </button>
      </div>
      <div className="flex items-center gap-1 mt-2 mb-2"><input className="border rounded px-2 py-1 flex-1" placeholder="팀ID로 불러오기" value={loadTeamId} onChange={e=>setLoadTeamId(e.target.value)} /><button className="text-xs px-2 py-1 bg-sky-100 rounded hover:bg-sky-200" onClick={handleLoad}>불러오기</button></div>
    </section>
  );
}
