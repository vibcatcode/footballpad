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
  Eye,
  Play
} from 'lucide-react';

const analysisData = [
  {
    id: 1,
    formation: '4-3-3',
    team: 'FC 서울',
    opponent: '수원 삼성',
    date: '2024-01-15',
    result: '승',
    score: '2-1',
    possession: 58,
    shots: 12,
    passes: 456,
    effectiveness: 85,
    rating: 4.5
  },
  {
    id: 2,
    formation: '4-4-2',
    team: '전북 현대',
    opponent: '울산 현대',
    date: '2024-01-14',
    result: '패',
    score: '0-3',
    possession: 45,
    shots: 6,
    passes: 298,
    effectiveness: 62,
    rating: 3.2
  },
  {
    id: 3,
    formation: '3-5-2',
    team: '포항 스틸러스',
    opponent: '인천 유나이티드',
    date: '2024-01-13',
    result: '무',
    score: '1-1',
    possession: 52,
    shots: 8,
    passes: 378,
    effectiveness: 78,
    rating: 4.1
  }
];

export default function TacticsAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">전술 분석</h1>
            <p className="text-gray-600 dark:text-gray-300">포메이션별 성과와 효과를 분석하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              리포트
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
              <CardTitle className="text-sm font-medium">평균 효과성</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">+5% 이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">최고 포메이션</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4-3-3</div>
              <p className="text-xs text-muted-foreground">85% 효과성</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.2</div>
              <p className="text-xs text-muted-foreground">+0.3 이번 주</p>
            </CardContent>
          </Card>
        </div>

        {/* 전술 분석 목록 */}
        <div className="space-y-6">
          {analysisData.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{analysis.formation} 포메이션</CardTitle>
                    <CardDescription>{analysis.team} vs {analysis.opponent} • {analysis.date}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        analysis.result === '승' ? 'default' : 
                        analysis.result === '패' ? 'destructive' : 
                        'secondary'
                      }
                    >
                      {analysis.result}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{analysis.score}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* 점유율 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">점유율</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>우리팀</span>
                        <span>{analysis.possession}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analysis.possession}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>상대팀</span>
                        <span>{100 - analysis.possession}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 슈팅 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">슈팅</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>우리팀</span>
                        <span>{analysis.shots}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>상대팀</span>
                        <span>{Math.floor(analysis.shots * 0.8)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 패스 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">패스</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>우리팀</span>
                        <span>{analysis.passes}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>상대팀</span>
                        <span>{Math.floor(analysis.passes * 0.7)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 효과성 */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">효과성</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>효과성</span>
                        <span>{analysis.effectiveness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${analysis.effectiveness}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>평점</span>
                        <span>{analysis.rating}</span>
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
                    <Play className="w-4 h-4 mr-2" />
                    시뮬레이션
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    리포트
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
