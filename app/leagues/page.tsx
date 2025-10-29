'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Plus, 
  Calendar, 
  Users, 
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react';

const mockLeagues = [
  {
    id: 'hpl2025',
    name: '호산나 프리미어리그 2025',
    season: '2025 시즌',
    status: 'active',
    teams: 3,
    matches: 20,
    startDate: '2025-09-01',
    endDate: '2026-01-31',
    description: '호산나축구선교회 프리미어리그'
  },
  {
    id: 'kpl2025',
    name: 'KPL 2025',
    season: '2025 시즌',
    status: 'upcoming',
    teams: 8,
    matches: 56,
    startDate: '2025-03-01',
    endDate: '2025-11-30',
    description: '한국 프리미어리그'
  },
  {
    id: 'wcl2024',
    name: '월드컵 리그 2024',
    season: '2024 시즌',
    status: 'completed',
    teams: 16,
    matches: 48,
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    description: '월드컵 스타일 리그'
  }
];

const statusConfig = {
  active: { label: '진행중', color: 'bg-green-500', icon: Play },
  upcoming: { label: '예정', color: 'bg-blue-500', icon: Calendar },
  completed: { label: '완료', color: 'bg-gray-500', icon: CheckCircle }
};

export default function LeaguesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLeagues = mockLeagues.filter(league => {
    const matchesSearch = league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         league.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || league.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">리그 관리</h1>
            <p className="text-muted-foreground">
              축구 리그를 생성하고 관리하세요
            </p>
          </div>
          <Button size="lg" asChild className="mt-4 sm:mt-0">
            <Link href="/leagues/create">
              <Plus className="w-5 h-5 mr-2" />
              새 리그 만들기
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="리그 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              전체
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
            >
              진행중
            </Button>
            <Button
              variant={statusFilter === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('upcoming')}
            >
              예정
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
            >
              완료
            </Button>
          </div>
        </div>

        {/* Leagues Grid */}
        {filteredLeagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map((league) => {
              const status = statusConfig[league.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              
              return (
                <Card key={league.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{league.name}</CardTitle>
                          <CardDescription>{league.season}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {league.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{league.teams}</div>
                        <div className="text-xs text-muted-foreground">팀</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{league.matches}</div>
                        <div className="text-xs text-muted-foreground">경기</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-4">
                      <div className="flex justify-between">
                        <span>시작일</span>
                        <span>{league.startDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>종료일</span>
                        <span>{league.endDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/leagues/${league.id}/dashboard`}>
                          대시보드
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/leagues/${league.id}/matches`}>
                          경기
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">리그가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 축구 리그를 만들어보세요!
              </p>
              <Button asChild>
                <Link href="/leagues/create">
                  <Plus className="w-4 h-4 mr-2" />
                  리그 만들기
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
