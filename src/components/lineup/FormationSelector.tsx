import React from 'react';
import { useLineupBuilderStore } from '../../store/useLineupBuilderStore';

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2'];

export function FormationSelector() {
  const { formation, applyFormationPreset } = useLineupBuilderStore();
  
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <span className="font-semibold text-gray-700">포메이션:</span>
      {FORMATIONS.map(f => (
        <button
          key={f}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            formation === f
              ? 'bg-green-600 text-white shadow-md scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => {
            applyFormationPreset(f);
          }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
