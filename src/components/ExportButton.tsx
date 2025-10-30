import React from 'react';
import { toPng } from 'html-to-image';

export function ExportButton() {
  const exportPng = () => {
    const node = document.getElementById('lineup-canvas');
    if (node) {
      toPng(node).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `lineup_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  };
  return (
    <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded ml-4" onClick={exportPng}>
      PNG 내보내기
    </button>
  );
}
