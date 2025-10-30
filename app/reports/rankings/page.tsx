'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Users,
  Download,
  Filter,
  Calendar,
  Star
} from 'lucide-react';

const playerRankings = [
  {
    position: 1,
    name: '김민수',
    team: 'FC 서울',
    position: '공격수',
    goals: 15,
    assists: 8,
    rating: 4.8,
    change: 'up'
  },
  {
    position: 2,
    name: '박지훈',
    team: '수원 삼성',
    position: '미드필더',
    goals: 5,
    assists: 12,
    rating: 4.6,
    change: 'up'
  },
  {
    position: 3,
    name: '이준호',
    team: '전북 현대',
    position: '수비수',
    goals: 2,
    assists: 3,
    rating: 4.4,
    change: 'down'
  },
  {
    position: 4,
    name: '최영수',
    team: '울산 현대',
    position: '공격수',
    goals: 12,
    assists: 6,
    rating: 4.3,
    change: 'same'
  },
  {
    position: 5,
    name: '정민호',
    team: '포항 스틸러스',
    position: '미드필더',
    goals: 8,
    assists: 10,
    rating: 4.2,
    change: 'up'
  }
];

const teamRankings = [
  {
    position: 1,
    team: 'FC 서울',
    points: 46,
    goals: 38,
    assists: 28,
    rating: 4.7,
    change: 'up'
  },
  {
    position: 2,
    team: '수원 삼성',
    points: 42,
    goals: 35,
    assists: 25,
    rating: 4.5,
    change: 'up'
  },
  {
    position: 3,
    team: '전북 현대',
    points: 38,
    goals: 32,
    assists: 22,
    rating: 4.3,
    change: 'down'
  }
];

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">선수 랭킹</h1>
            <p className="text-gray-600 dark:text-gray-300">K리그 2024 시즌 선수별 순위를 확인하세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              기간 선택
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
              <CardTitle className="text-sm font-medium">총 선수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div>
              <p className="text-xs text-muted-foreground">활성 선수</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">최다 골</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15골</div>
              <p className="text-xs text-muted-foreground">김민수 (FC서울)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">최다 어시스트</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12개</div>
              <p className="text-xs text-muted-foreground">박지훈 (수원)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">최고 평점</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">김민수 (FC서울)</p>
            </CardContent>
          </Card>
        </div>

        {/* 선수 랭킹 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>선수 랭킹</CardTitle>
            <CardDescription>골, 어시스트, 평점을 종합한 선수 순위</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {playerRankings.map((player) => (
                <div key={player.position} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{player.position}</span>
                      {player.position <= 3 && (
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">{player.team} • {player.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">골</p>
                      <p className="font-semibold text-lg">{player.goals}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">어시스트</p>
                      <p className="font-semibold text-lg">{player.assists}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">평점</p>
                      <p className="font-semibold text-lg">{player.rating}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {player.change === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {player.change === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                      {player.change === 'same' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 팀 랭킹 */}
        <Card>
          <CardHeader>
            <CardTitle>팀 랭킹</CardTitle>
            <CardDescription>팀별 종합 성과 순위</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamRankings.map((team) => (
                <div key={team.position} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{team.position}</span>
                      {team.position <= 3 && (
                        <Trophy className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{team.team}</h3>
                      <p className="text-sm text-muted-foreground">K리그 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">승점</p>
                      <p className="font-semibold text-lg">{team.points}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">골</p>
                      <p className="font-semibold text-lg">{team.goals}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">어시스트</p>
                      <p className="font-semibold text-lg">{team.assists}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">평점</p>
                      <p className="font-semibold text-lg">{team.rating}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {team.change === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                      {team.change === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                      {team.change === 'same' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
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
