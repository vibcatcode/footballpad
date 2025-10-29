'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllLeagues } from '@/lib/data';
import { League } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trophy, Users, Calendar } from 'lucide-react';

export default function Home() {
  const [leagues, setLeagues] = useState<League[]>([]);

  useEffect(() => {
    setLeagues(getAllLeagues());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            FootballPad
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            축구 리그를 쉽게 만들고 관리하세요
          </p>
          <Button size="lg" asChild>
            <Link href="/admin">
              <Plus className="w-4 h-4 mr-2" />
              새 리그 만들기
            </Link>
          </Button>
        </div>

        {/* 리그 목록 */}
        {leagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <Card key={league.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      {league.name}
                    </CardTitle>
                    <Badge variant="secondary">
                      축구
                    </Badge>
                  </div>
                  <CardDescription>
                    {league.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {league.teamIds.length}개 팀
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {league.seasonIds.length}개 시즌
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/league/${league.id}`}>
                      리그 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">아직 리그가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 축구 리그를 만들어보세요!
              </p>
              <Button asChild>
                <Link href="/admin">
                  <Plus className="w-4 h-4 mr-2" />
                  리그 만들기
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}