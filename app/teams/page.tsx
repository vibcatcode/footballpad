'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search,
  Trophy,
  Calendar,
  Target,
  MoreHorizontal,
  Star
} from 'lucide-react';

const mockTeams = [
  {
    id: 'team1',
    name: '믿음',
    logo: '⚽',
    color: '#3B82F6',
    league: '호산나 프리미어리그 2025',
    players: 15,
    matches: 10,
    wins: 7,
    draws: 2,
    losses: 1,
    points: 23,
    goalsFor: 25,
    goalsAgainst: 10,
    goalDifference: 15,
    position: 1
  },
  {
    id: 'team2',
    name: '소망',
    logo: '⚽',
    color: '#10B981',
    league: '호산나 프리미어리그 2025',
    players: 14,
    matches: 10,
    wins: 5,
    draws: 3,
    losses: 2,
    points: 18,
    goalsFor: 18,
    goalsAgainst: 15,
    goalDifference: 3,
    position: 2
  },
  {
    id: 'team3',
    name: '사랑',
    logo: '⚽',
    color: '#F59E0B',
    league: '호산나 프리미어리그 2025',
    players: 16,
    matches: 10,
    wins: 3,
    draws: 2,
    losses: 5,
    points: 11,
    goalsFor: 12,
    goalsAgainst: 20,
    goalDifference: -8,
    position: 3
  }
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.league.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">팀 관리</h1>
            <p className="text-muted-foreground">
              팀 정보와 선수 관리를 하세요
            </p>
          </div>
          <Button size="lg" asChild className="mt-4 sm:mt-0">
            <Link href="/teams/create">
              <Plus className="w-5 h-5 mr-2" />
              팀 생성
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="팀명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Card key={team.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.logo}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription className="text-sm">{team.league}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {team.position}위
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* 팀 통계 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{team.players}</div>
                      <div className="text-xs text-muted-foreground">선수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{team.matches}</div>
                      <div className="text-xs text-muted-foreground">경기</div>
                    </div>
                  </div>

                  {/* 경기 결과 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>승점</span>
                      <span className="font-semibold">{team.points}점</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>승/무/패</span>
                      <span>{team.wins}승 {team.draws}무 {team.losses}패</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>득실차</span>
                      <span className={team.goalDifference > 0 ? 'text-green-600' : team.goalDifference < 0 ? 'text-red-600' : ''}>
                        {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>득점/실점</span>
                      <span>{team.goalsFor}/{team.goalsAgainst}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/teams/${team.id}`}>
                        <Users className="w-4 h-4 mr-2" />
                        팀 상세
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/teams/${team.id}/players`}>
                        <Target className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">팀이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 팀을 만들어보세요!
              </p>
              <Button asChild>
                <Link href="/teams/create">
                  <Plus className="w-4 h-4 mr-2" />
                  팀 생성
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
