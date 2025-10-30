'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Settings, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Trophy,
  Calendar,
  BarChart3
} from 'lucide-react';

const teams = [
  {
    id: 1,
    name: 'FC 서울',
    shortName: 'FC서울',
    location: '서울특별시',
    founded: 1983,
    players: 25,
    staff: 8,
    status: 'active',
    league: 'K리그 2024',
    wins: 12,
    draws: 5,
    losses: 3
  },
  {
    id: 2,
    name: '수원 삼성',
    shortName: '수원',
    location: '수원시',
    founded: 1995,
    players: 23,
    staff: 7,
    status: 'active',
    league: 'K리그 2024',
    wins: 10,
    draws: 7,
    losses: 3
  },
  {
    id: 3,
    name: '전북 현대',
    shortName: '전북',
    location: '전주시',
    founded: 1994,
    players: 24,
    staff: 9,
    status: 'inactive',
    league: 'K리그 2024',
    wins: 8,
    draws: 6,
    losses: 6
  }
];

export default function ManageTeamsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">팀 관리</h1>
            <p className="text-gray-600 dark:text-gray-300">등록된 팀들을 관리하고 정보를 수정하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              새 팀 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 팀</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">72</div>
              <p className="text-xs text-muted-foreground">+3 이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 팀</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68</div>
              <p className="text-xs text-muted-foreground">94.4%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 선수</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,728</div>
              <p className="text-xs text-muted-foreground">평균 24명/팀</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 스태프</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">216</div>
              <p className="text-xs text-muted-foreground">평균 3명/팀</p>
            </CardContent>
          </Card>
        </div>

        {/* 팀 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>팀 목록</CardTitle>
            <CardDescription>등록된 모든 팀들의 정보를 관리할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{team.name}</h3>
                        <span className="text-sm text-muted-foreground">({team.shortName})</span>
                        <Badge variant={team.status === 'active' ? 'default' : 'secondary'}>
                          {team.status === 'active' ? '활성' : '비활성'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{team.location}</span>
                        <span>•</span>
                        <span>창단: {team.founded}</span>
                        <span>•</span>
                        <span>{team.league}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">선수</p>
                      <p className="font-semibold">{team.players}명</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">스태프</p>
                      <p className="font-semibold">{team.staff}명</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">전적</p>
                      <p className="font-semibold">{team.wins}승 {team.draws}무 {team.losses}패</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
