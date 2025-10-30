import React, { useState } from 'react';
import { useLineupStore } from '../store/useLineupStore';
import type { Player } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function PlayerCard() {
  const { addPlayer } = useLineupStore();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [position, setPosition] = useState('');

  const handleAdd = () => {
    if (!name || !number) return;
    addPlayer({
      id: uuidv4(),
      name,
      number: Number(number),
      position,
      x: 100 + Math.random()*200,
      y: 100 + Math.random()*200,
    });
    setName(''); setNumber(''); setPosition('');
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-2 flex flex-col gap-2 w-56">
      <input className="border rounded p-1" placeholder="이름" value={name} onChange={e=>setName(e.target.value)} />
      <input className="border rounded p-1" placeholder="등번호" value={number} onChange={e=>setNumber(e.target.value.replace(/\D/g, ''))} maxLength={2}/>
      <input className="border rounded p-1" placeholder="포지션 (DF, MF...)" value={position} onChange={e=>setPosition(e.target.value)} maxLength={6} />
      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded py-1 mt-1 transition" onClick={handleAdd}>선수 추가</button>
    </div>
  );
}
