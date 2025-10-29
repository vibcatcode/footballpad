'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HosannaPage() {
  const router = useRouter();

  useEffect(() => {
    // hpl.html 파일로 리다이렉트
    window.location.href = '/hpl.html';
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">호산나 프리미어리그</h1>
        <p className="text-muted-foreground mb-4">페이지를 로딩 중입니다...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
}
