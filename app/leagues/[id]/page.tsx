'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function LeaguesRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const leagueId = params.id as string;

  useEffect(() => {
    // /leagues/[id]를 /league/[id]로 리다이렉트
    if (leagueId) {
      router.replace(`/league/${leagueId}`);
    } else {
      router.replace('/leagues');
    }
  }, [leagueId, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">리다이렉트 중...</p>
      </div>
    </div>
  );
}
