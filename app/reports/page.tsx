'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Trophy, 
  Users, 
  Calendar,
  TrendingUp,
  Download,
  Eye,
  Star,
  Target,
  Award
} from 'lucide-react';

const mockStandings = [
  {
    position: 1,
    team: '믿음',
    played: 10,
    won: 7,
    drawn: 2,
    lost: 1,
    goalsFor: 25,
    goalsAgainst: 10,
    goalDifference: 15,
    points: 23
  },
  {
    position: 2,
    team: '소망',
    played: 10,
    won: 5,
    drawn: 3,
    lost: 2,
    goalsFor: 18,
    goalsAgainst: 15,
    goalDifference: 3,
    points: 18
  },
  {
    position: 3,
    team: '사랑',
    played: 10,
    won: 3,
    drawn: 2,
    lost: 5,
    goalsFor: 12,
    goalsAgainst: 20,
    goalDifference: -8,
    points: 11
  }
];

const mockPlayerRankings = [
  {
    position: 1,
    name: '김민수',
    team: '믿음',
    goals: 8,
    assists: 3,
    totalPoints: 11,
    matches: 10
  },
  {
    position: 2,
    name: '이준호',
    team: '소망',
    goals: 6,
    assists: 4,
    totalPoints: 10,
    matches: 9
  },
  {
    position: 3,
    name: '박지훈',
    team: '믿음',
    goals: 5,
    assists: 5,
    totalPoints: 10,
    matches: 10
  }
];

const reportTypes = [
  {
    id: 'standings',
    title: '리그 순위',
    description: '팀별 승점과 순위를 확인하세요',
    icon: Trophy,
    href: '/reports/standings',
    color: 'bg-yellow-500'
  },
  {
    id: 'players',
    title: '선수 랭킹',
    description: '득점왕, 어시스트왕을 확인하세요',
    icon: Users,
    href: '/reports/rankings',
    color: 'bg-blue-500'
  },
  {
    id: 'matches',
    title: '경기 리포트',
    description: '경기별 상세 리포트를 확인하세요',
    icon: Calendar,
    href: '/reports/matches',
    color: 'bg-green-500'
  },
  {
    id: 'analytics',
    title: '분석 대시보드',
    description: '고급 통계와 분석을 확인하세요',
    icon: BarChart3,
    href: '/reports/analytics',
    color: 'bg-purple-500'
  }
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('standings');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">통계 & 리포트</h1>
          <p className="text-muted-foreground">
            리그와 선수들의 상세한 통계를 확인하세요
          </p>
        </div>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm">{report.description}</CardDescription>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={report.href}>
                      <Eye className="w-4 h-4 mr-2" />
                      보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">참가 팀</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">30</div>
              <div className="text-sm text-muted-foreground">총 경기</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">등록 선수</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">55</div>
              <div className="text-sm text-muted-foreground">총 득점</div>
            </CardContent>
          </Card>
        </div>

        {/* Standings Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              리그 순위 (상위 3팀)
            </CardTitle>
            <CardDescription>
              호산나 프리미어리그 2025 현재 순위
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">순위</th>
                    <th className="text-left p-2">팀</th>
                    <th className="text-center p-2">경기</th>
                    <th className="text-center p-2">승</th>
                    <th className="text-center p-2">무</th>
                    <th className="text-center p-2">패</th>
                    <th className="text-center p-2">득점</th>
                    <th className="text-center p-2">실점</th>
                    <th className="text-center p-2">득실차</th>
                    <th className="text-center p-2">승점</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStandings.map((team) => (
                    <tr key={team.position} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-bold">{team.position}</td>
                      <td className="p-2 font-medium">{team.team}</td>
                      <td className="p-2 text-center">{team.played}</td>
                      <td className="p-2 text-center text-green-600">{team.won}</td>
                      <td className="p-2 text-center text-yellow-600">{team.drawn}</td>
                      <td className="p-2 text-center text-red-600">{team.lost}</td>
                      <td className="p-2 text-center">{team.goalsFor}</td>
                      <td className="p-2 text-center">{team.goalsAgainst}</td>
                      <td className={`p-2 text-center font-medium ${team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : ''}`}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </td>
                      <td className="p-2 text-center font-bold">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/reports/standings">
                  전체 순위 보기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player Rankings Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              선수 랭킹 (공격포인트 TOP 3)
            </CardTitle>
            <CardDescription>
              득점과 어시스트를 합친 공격포인트 순위
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPlayerRankings.map((player, index) => (
                <div key={player.position} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold">
                      {player.position}
                    </div>
                    <div>
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-sm text-muted-foreground">{player.team}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">득점</div>
                      <div className="font-bold">{player.goals}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">어시스트</div>
                      <div className="font-bold">{player.assists}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">공격포인트</div>
                      <div className="font-bold text-primary">{player.totalPoints}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">경기</div>
                      <div className="font-bold">{player.matches}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/reports/rankings">
                  전체 랭킹 보기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
