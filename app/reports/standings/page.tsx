'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Download,
  Filter,
  Calendar,
  Target
} from 'lucide-react';

const standings = [
  {
    position: 1,
    team: 'FC 서울',
    played: 20,
    won: 14,
    drawn: 4,
    lost: 2,
    goalsFor: 38,
    goalsAgainst: 15,
    goalDifference: 23,
    points: 46,
    form: ['W', 'W', 'D', 'W', 'W'],
    change: 'up'
  },
  {
    position: 2,
    team: '수원 삼성',
    played: 20,
    won: 12,
    drawn: 6,
    lost: 2,
    goalsFor: 35,
    goalsAgainst: 18,
    goalDifference: 17,
    points: 42,
    form: ['W', 'D', 'W', 'W', 'D'],
    change: 'up'
  },
  {
    position: 3,
    team: '전북 현대',
    played: 20,
    won: 11,
    drawn: 5,
    lost: 4,
    goalsFor: 32,
    goalsAgainst: 20,
    goalDifference: 12,
    points: 38,
    form: ['L', 'W', 'W', 'D', 'W'],
    change: 'down'
  },
  {
    position: 4,
    team: '울산 현대',
    played: 20,
    won: 10,
    drawn: 7,
    lost: 3,
    goalsFor: 30,
    goalsAgainst: 22,
    goalDifference: 8,
    points: 37,
    form: ['D', 'W', 'L', 'W', 'D'],
    change: 'same'
  },
  {
    position: 5,
    team: '포항 스틸러스',
    played: 20,
    won: 9,
    drawn: 8,
    lost: 3,
    goalsFor: 28,
    goalsAgainst: 19,
    goalDifference: 9,
    points: 35,
    form: ['W', 'D', 'D', 'L', 'W'],
    change: 'up'
  }
];

export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">리그 순위</h1>
            <p className="text-gray-600 dark:text-gray-300">K리그 2024 시즌 순위표를 확인하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              시즌 선택
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 팀</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">K리그 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">진행된 경기</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">120</div>
              <p className="text-xs text-muted-foreground">총 132경기 중</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">1위 팀</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">FC 서울</div>
              <p className="text-xs text-muted-foreground">46점</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">평균 골</CardTitle>
              <Minus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4</div>
              <p className="text-xs text-muted-foreground">경기당</p>
            </CardContent>
          </Card>
        </div>

        {/* 순위표 */}
        <Card>
          <CardHeader>
            <CardTitle>K리그 2024 순위표</CardTitle>
            <CardDescription>현재 시즌의 팀 순위와 통계를 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">순위</th>
                    <th className="text-left p-4 font-medium">팀</th>
                    <th className="text-center p-4 font-medium">경기</th>
                    <th className="text-center p-4 font-medium">승</th>
                    <th className="text-center p-4 font-medium">무</th>
                    <th className="text-center p-4 font-medium">패</th>
                    <th className="text-center p-4 font-medium">득점</th>
                    <th className="text-center p-4 font-medium">실점</th>
                    <th className="text-center p-4 font-medium">득실차</th>
                    <th className="text-center p-4 font-medium">승점</th>
                    <th className="text-center p-4 font-medium">최근 5경기</th>
                    <th className="text-center p-4 font-medium">변동</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team) => (
                    <tr key={team.position} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{team.position}</span>
                          {team.position <= 3 && (
                            <Trophy className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{team.team}</div>
                      </td>
                      <td className="p-4 text-center">{team.played}</td>
                      <td className="p-4 text-center font-semibold text-green-600">{team.won}</td>
                      <td className="p-4 text-center">{team.drawn}</td>
                      <td className="p-4 text-center font-semibold text-red-600">{team.lost}</td>
                      <td className="p-4 text-center">{team.goalsFor}</td>
                      <td className="p-4 text-center">{team.goalsAgainst}</td>
                      <td className="p-4 text-center">
                        <span className={team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : ''}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-lg">{team.points}</td>
                      <td className="p-4 text-center">
                        <div className="flex space-x-1">
                          {team.form.map((result, index) => (
                            <span
                              key={index}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                result === 'W' ? 'bg-green-500 text-white' :
                                result === 'D' ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {team.change === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {team.change === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                        {team.change === 'same' && <Minus className="w-4 h-4 text-gray-400" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 리그 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>리그 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">리그명</span>
                <span className="font-semibold">K리그 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">시즌</span>
                <span className="font-semibold">2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 경기</span>
                <span className="font-semibold">132경기</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">진행률</span>
                <span className="font-semibold">90.9%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>다음 경기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">FC 서울 vs 수원 삼성</p>
                  <p className="text-sm text-muted-foreground">2024-01-20 19:30</p>
                </div>
                <Badge variant="outline">예정</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">전북 현대 vs 울산 현대</p>
                  <p className="text-sm text-muted-foreground">2024-01-21 16:00</p>
                </div>
                <Badge variant="outline">예정</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
