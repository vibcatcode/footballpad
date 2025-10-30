'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Plus, 
  Edit, 
  Play,
  Download,
  Share,
  Target,
  Users
} from 'lucide-react';

const formations = [
  {
    id: 1,
    name: '4-3-3',
    description: '공격적인 포메이션으로 측면 공격에 강점',
    players: 11,
    difficulty: '중급',
    category: '공격형',
    usage: 45,
    rating: 4.5
  },
  {
    id: 2,
    name: '4-4-2',
    description: '균형잡힌 포메이션으로 안정적인 플레이',
    players: 11,
    difficulty: '초급',
    category: '균형형',
    usage: 38,
    rating: 4.2
  },
  {
    id: 3,
    name: '3-5-2',
    description: '미드필드 장악에 특화된 포메이션',
    players: 11,
    difficulty: '고급',
    category: '전술형',
    usage: 25,
    rating: 4.7
  },
  {
    id: 4,
    name: '5-3-2',
    description: '수비에 강점을 둔 안정적인 포메이션',
    players: 11,
    difficulty: '중급',
    category: '수비형',
    usage: 18,
    rating: 4.0
  }
];

export default function FormationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">포메이션</h1>
            <p className="text-gray-600 dark:text-gray-300">다양한 포메이션을 탐색하고 팀에 적용하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              새 포메이션
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 포메이션</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">인기 포메이션</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4-3-3</div>
              <p className="text-xs text-muted-foreground">45% 사용률</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.3</div>
              <p className="text-xs text-muted-foreground">+0.2 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">사용된 경기</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">이번 시즌</p>
            </CardContent>
          </Card>
        </div>

        {/* 포메이션 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <Card key={formation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{formation.name}</CardTitle>
                  <Badge 
                    variant={
                      formation.difficulty === '초급' ? 'default' : 
                      formation.difficulty === '중급' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {formation.difficulty}
                  </Badge>
                </div>
                <CardDescription>{formation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">카테고리</p>
                      <p className="font-semibold">{formation.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">선수 수</p>
                      <p className="font-semibold">{formation.players}명</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>사용률</span>
                      <span>{formation.usage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${formation.usage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-muted-foreground">평점:</span>
                      <span className="font-semibold">{formation.rating}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-1" />
                        시뮬레이션
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 포메이션 생성 가이드 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>포메이션 생성 가이드</CardTitle>
            <CardDescription>나만의 포메이션을 만들어보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">1. 선수 배치</h3>
                  <p className="text-sm text-muted-foreground">11명의 선수를 필드에 배치하세요</p>
                </div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. 전술 설정</h3>
                  <p className="text-sm text-muted-foreground">공격과 수비 전술을 설정하세요</p>
                </div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                  <Share className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. 저장 및 공유</h3>
                  <p className="text-sm text-muted-foreground">포메이션을 저장하고 팀과 공유하세요</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
