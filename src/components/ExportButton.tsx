'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const exportPng = async () => {
    try {
      setIsExporting(true);
      const node = document.getElementById('lineup-canvas');
      
      if (!node) {
        toast.error('캔버스를 찾을 수 없습니다');
        return;
      }

      const dataUrl = await toPng(node, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#f0fdf4',
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.download = `lineup_${timestamp}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('PNG 파일로 내보냈습니다!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('내보내기 실패');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={exportPng}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          내보내는 중...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          PNG 내보내기
        </>
      )}
    </button>
  );
}
