'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Trophy, 
  Users,
  Plus,
  Filter,
  Search,
  Play
} from 'lucide-react';

const matches = [
  {
    id: 1,
    homeTeam: 'FC 서울',
    awayTeam: '수원 삼성',
    homeScore: 2,
    awayScore: 1,
    date: '2024-01-15',
    time: '19:30',
    status: 'completed',
    league: 'K리그 2024'
  },
  {
    id: 2,
    homeTeam: '전북 현대',
    awayTeam: '울산 현대',
    homeScore: 0,
    awayScore: 3,
    date: '2024-01-14',
    time: '16:00',
    status: 'completed',
    league: 'K리그 2024'
  },
  {
    id: 3,
    homeTeam: '포항 스틸러스',
    awayTeam: '인천 유나이티드',
    homeScore: 1,
    awayScore: 1,
    date: '2024-01-13',
    time: '19:00',
    status: 'completed',
    league: 'K리그 2024'
  }
];

export default function MatchResultsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">경기 결과</h1>
            <p className="text-gray-600 dark:text-gray-300">완료된 경기들의 결과를 확인하세요</p>
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
              결과 입력
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 경기</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">132</div>
              <p className="text-xs text-muted-foreground">이번 시즌</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">완료된 경기</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">97% 완료</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 골</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4</div>
              <p className="text-xs text-muted-foreground">경기당</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">무승부</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">18.8%</p>
            </CardContent>
          </Card>
        </div>

        {/* 경기 결과 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 경기 결과</CardTitle>
            <CardDescription>완료된 경기들의 상세 결과를 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{match.date}</p>
                      <p className="text-xs text-muted-foreground">{match.time}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold">{match.homeTeam}</p>
                        <p className="text-sm text-muted-foreground">{match.league}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{match.homeScore}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-2xl font-bold">{match.awayScore}</span>
                        </div>
                        <Badge variant="outline" className="mt-1">
                          완료
                        </Badge>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{match.awayTeam}</p>
                        <p className="text-sm text-muted-foreground">원정</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      하이라이트
                    </Button>
                    <Button size="sm" variant="outline">
                      상세보기
                    </Button>
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
