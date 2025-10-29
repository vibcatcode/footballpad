'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">오프라인 상태</CardTitle>
          <CardDescription>
            인터넷 연결을 확인하고 다시 시도해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>현재 오프라인 상태입니다.</p>
            <p>일부 기능은 제한될 수 있습니다.</p>
          </div>
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 시도
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            <p>오프라인에서도 기본 기능을 사용할 수 있습니다.</p>
            <p>연결이 복구되면 자동으로 동기화됩니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
