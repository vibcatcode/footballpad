import React from 'react';
import { useLineupStore } from '../store/useLineupStore';
import { ExportButton } from './ExportButton';

const presets = {
  '4-4-2': [
    { x: 375, y: 400 },  // GK
    { x: 110, y: 320 }, { x: 240, y: 320 }, { x: 510, y: 320 }, { x: 640, y: 320 }, // DF
    { x: 160, y: 210 }, { x: 310, y: 210 }, { x: 440, y: 210 }, { x: 590, y: 210 }, // MF
    { x: 280, y: 90 }, { x: 470, y: 90 },  // FW
  ],
  '4-3-3': [
    { x: 375, y: 400 },
    { x: 110, y: 320 }, { x: 240, y: 320 }, { x: 510, y: 320 }, { x: 640, y: 320 },
    { x: 210, y: 200 }, { x: 375, y: 190 }, { x: 540, y: 200 },
    { x: 170, y: 70 }, { x: 375, y: 50 }, { x: 580, y: 70 }
  ],
  '3-5-2': [
    { x: 375, y: 400 },
    { x: 210, y: 320 }, { x: 375, y: 320 }, { x: 540, y: 320 },
    { x: 140, y: 210 }, { x: 250, y: 170 }, { x: 375, y: 150 }, { x: 500, y: 170 }, { x: 610, y: 210 },
    { x: 280, y: 60 }, { x: 470, y: 60 },
  ]
};

export function Toolbar() {
  const { players, formation, setFormation, updatePosition } = useLineupStore();

  const applyPreset = (presetKey: keyof typeof presets) => {
    setFormation(presetKey);
    const positions = presets[presetKey];
    players.forEach((p, i) => {
      if (positions[i]) updatePosition(p.id, positions[i].x, positions[i].y);
    });
  };

  return (
    <div className="flex gap-4 items-center mb-4">
      <span className="font-bold text-white mr-2">포메이션:</span>
      {Object.keys(presets).map((preset) => (
        <button
          className={`px-3 py-1 rounded ${formation === preset ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} hover:bg-blue-700 hover:text-white transition`}
          onClick={() => applyPreset(preset as keyof typeof presets)}
          key={preset}
        >
          {preset}
        </button>
      ))}
      <ExportButton />
    </div>
  );
}
