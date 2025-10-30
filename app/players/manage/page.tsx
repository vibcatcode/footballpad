'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Trophy,
  Target,
  TrendingUp,
  Star
} from 'lucide-react';

const players = [
  {
    id: 1,
    name: '김민수',
    team: 'FC 서울',
    position: '공격수',
    jerseyNumber: 10,
    goals: 15,
    assists: 8,
    matches: 20,
    rating: 4.8,
    status: 'active',
    age: 28
  },
  {
    id: 2,
    name: '박지훈',
    team: '수원 삼성',
    position: '미드필더',
    jerseyNumber: 8,
    goals: 5,
    assists: 12,
    matches: 18,
    rating: 4.6,
    status: 'active',
    age: 25
  },
  {
    id: 3,
    name: '이준호',
    team: '전북 현대',
    position: '수비수',
    jerseyNumber: 4,
    goals: 2,
    assists: 3,
    matches: 16,
    rating: 4.4,
    status: 'injured',
    age: 30
  },
  {
    id: 4,
    name: '최영수',
    team: '울산 현대',
    position: '공격수',
    jerseyNumber: 9,
    goals: 12,
    assists: 6,
    matches: 19,
    rating: 4.3,
    status: 'active',
    age: 26
  },
  {
    id: 5,
    name: '정민호',
    team: '포항 스틸러스',
    position: '미드필더',
    jerseyNumber: 7,
    goals: 8,
    assists: 10,
    matches: 17,
    rating: 4.2,
    status: 'active',
    age: 24
  }
];

export default function ManagePlayersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">선수 관리</h1>
            <p className="text-gray-600 dark:text-gray-300">등록된 선수들을 관리하고 정보를 수정하세요</p>
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
              새 선수 추가
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 선수</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-muted-foreground">+12 이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 선수</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-muted-foreground">94.7%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">부상자</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">-2 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.5</div>
              <p className="text-xs text-muted-foreground">+0.2 이번 달</p>
            </CardContent>
          </Card>
        </div>

        {/* 선수 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>선수 목록</CardTitle>
            <CardDescription>등록된 모든 선수들의 정보를 관리할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{player.name}</h3>
                        <span className="text-sm text-muted-foreground">#{player.jerseyNumber}</span>
                        <Badge variant={player.status === 'active' ? 'default' : 'destructive'}>
                          {player.status === 'active' ? '활성' : '부상'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{player.team}</span>
                        <span>•</span>
                        <span>{player.position}</span>
                        <span>•</span>
                        <span>{player.age}세</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">골</p>
                      <p className="font-semibold">{player.goals}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">어시스트</p>
                      <p className="font-semibold">{player.assists}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">경기</p>
                      <p className="font-semibold">{player.matches}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">평점</p>
                      <p className="font-semibold">{player.rating}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
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

        {/* 팀별 선수 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>팀별 선수 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">FC 서울</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">25명</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">수원 삼성</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">23명</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">전북 현대</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm font-semibold">24명</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>포지션별 선수 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">공격수</span>
                  <span className="text-sm font-semibold">45명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">미드필더</span>
                  <span className="text-sm font-semibold">60명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">수비수</span>
                  <span className="text-sm font-semibold">35명</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">골키퍼</span>
                  <span className="text-sm font-semibold">10명</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
