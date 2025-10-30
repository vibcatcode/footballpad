import React from 'react';
import { useLineupBuilderStore } from '../../store/useLineupBuilderStore';

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2'];

export function FormationSelector() {
  const { formation, applyFormationPreset } = useLineupBuilderStore();
  return (
    <div className="flex gap-2 items-center mb-2">
      <span className="font-bold">포메이션:</span>
      {FORMATIONS.map(f => (
        <button
          key={f}
          className={`px-3 py-1 rounded-2xl text-sm ${formation===f?'bg-green-700 text-white':'bg-gray-100'}`}
          onClick={()=>applyFormationPreset(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
