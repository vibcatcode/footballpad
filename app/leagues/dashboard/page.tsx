'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Calendar, 
  Users, 
  BarChart3,
  Plus,
  Settings,
  TrendingUp,
  Award
} from 'lucide-react';

const leagues = [
  {
    id: 1,
    name: 'K리그 2024',
    teams: 12,
    matches: 132,
    status: 'active',
    season: '2024',
    description: 'K리그 정규 시즌'
  },
  {
    id: 2,
    name: 'FA컵 2024',
    teams: 32,
    matches: 31,
    status: 'upcoming',
    season: '2024',
    description: 'FA컵 토너먼트'
  },
  {
    id: 3,
    name: '챔피언스리그',
    teams: 16,
    matches: 48,
    status: 'completed',
    season: '2024',
    description: '아시아 챔피언스리그'
  }
];

export default function LeaguesDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">리그 대시보드</h1>
            <p className="text-gray-600 dark:text-gray-300">모든 리그의 현황을 한눈에 확인하세요</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 리그 만들기
          </Button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 리그</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 리그</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">진행 중</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 경기</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">+23 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">참가 팀</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">180</div>
              <p className="text-xs text-muted-foreground">+15 이번 달</p>
            </CardContent>
          </Card>
        </div>

        {/* 리그 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leagues.map((league) => (
            <Card key={league.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{league.name}</CardTitle>
                  <Badge 
                    variant={
                      league.status === 'active' ? 'default' : 
                      league.status === 'upcoming' ? 'secondary' : 
                      'outline'
                    }
                  >
                    {league.status === 'active' ? '진행중' : 
                     league.status === 'upcoming' ? '예정' : 
                     '완료'}
                  </Badge>
                </div>
                <CardDescription>{league.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">참가 팀</p>
                      <p className="text-lg font-semibold">{league.teams}팀</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">총 경기</p>
                      <p className="text-lg font-semibold">{league.matches}경기</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      상세보기
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
