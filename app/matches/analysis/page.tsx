'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users,
  Calendar,
  Filter,
  Download,
  Eye
} from 'lucide-react';

const analysisData = [
  {
    id: 1,
    match: 'FC 서울 vs 수원 삼성',
    date: '2024-01-15',
    homeScore: 2,
    awayScore: 1,
    possession: { home: 58, away: 42 },
    shots: { home: 12, away: 8 },
    passes: { home: 456, away: 312 },
    rating: 4.2
  },
  {
    id: 2,
    match: '전북 현대 vs 울산 현대',
    date: '2024-01-14',
    homeScore: 0,
    awayScore: 3,
    possession: { home: 45, away: 55 },
    shots: { home: 6, away: 15 },
    passes: { home: 298, away: 445 },
    rating: 4.5
  }
];

export default function MatchAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">경기 분석</h1>
            <p className="text-gray-600 dark:text-gray-300">경기별 상세한 통계와 분석 데이터를 확인하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">분석된 경기</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128</div>
              <p className="text-xs text-muted-foreground">이번 시즌</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">+0.3 이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 점유율</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">52%</div>
              <p className="text-xs text-muted-foreground">홈팀 기준</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 슈팅</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,456</div>
              <p className="text-xs text-muted-foreground">평균 11.4/경기</p>
            </CardContent>
          </Card>
        </div>

        {/* 경기 분석 목록 */}
        <div className="space-y-6">
          {analysisData.map((match) => (
            <Card key={match.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{match.match}</CardTitle>
                    <CardDescription>{match.date}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">분석 완료</Badge>
                    <span className="text-sm text-muted-foreground">평점: {match.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 점수 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">최종 점수</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold">{match.homeScore}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-2xl font-bold">{match.awayScore}</span>
                    </div>
                  </div>

                  {/* 점유율 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">점유율</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>홈</span>
                        <span>{match.possession.home}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${match.possession.home}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>원정</span>
                        <span>{match.possession.away}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 슈팅 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">슈팅</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>홈</span>
                        <span>{match.shots.home}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>원정</span>
                        <span>{match.shots.away}</span>
                      </div>
                    </div>
                  </div>

                  {/* 패스 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">패스</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>홈</span>
                        <span>{match.passes.home}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>원정</span>
                        <span>{match.passes.away}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    상세 분석
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    리포트 다운로드
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
