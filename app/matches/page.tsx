'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Plus, 
  Search,
  Filter,
  Play,
  Clock,
  MapPin,
  Users,
  Video,
  BarChart3
} from 'lucide-react';

const mockMatches = [
  {
    id: 'match1',
    homeTeam: '믿음',
    awayTeam: '소망',
    homeScore: 2,
    awayScore: 1,
    date: '2025-01-15',
    time: '19:00',
    venue: '호산나축구장',
    status: 'completed',
    round: 1,
    hasVideo: true
  },
  {
    id: 'match2',
    homeTeam: '사랑',
    awayTeam: '믿음',
    homeScore: null,
    awayScore: null,
    date: '2025-01-22',
    time: '19:00',
    venue: '호산나축구장',
    status: 'scheduled',
    round: 2,
    hasVideo: false
  },
  {
    id: 'match3',
    homeTeam: '소망',
    awayTeam: '사랑',
    homeScore: null,
    awayScore: null,
    date: '2025-01-29',
    time: '19:00',
    venue: '호산나축구장',
    status: 'scheduled',
    round: 3,
    hasVideo: false
  }
];

const statusConfig = {
  completed: { label: '완료', color: 'bg-green-500' },
  scheduled: { label: '예정', color: 'bg-blue-500' },
  live: { label: '진행중', color: 'bg-red-500' }
};

export default function MatchesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredMatches = mockMatches.filter(match => {
    const matchesSearch = match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         match.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">경기 관리</h1>
            <p className="text-muted-foreground">
              경기 일정과 결과를 관리하세요
            </p>
          </div>
          <Button size="lg" asChild className="mt-4 sm:mt-0">
            <Link href="/matches/create">
              <Plus className="w-5 h-5 mr-2" />
              경기 추가
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="팀명, 경기장으로 검색..."
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
              variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('scheduled')}
            >
              예정
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
            >
              완료
            </Button>
            <Button
              variant={statusFilter === 'live' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('live')}
            >
              진행중
            </Button>
          </div>
        </div>

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const status = statusConfig[match.status as keyof typeof statusConfig];
              
              return (
                <Card key={match.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* 팀 정보 */}
                        <div className="text-center">
                          <div className="text-lg font-semibold">{match.homeTeam}</div>
                          <div className="text-sm text-muted-foreground">홈</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {match.status === 'completed' 
                              ? `${match.homeScore} - ${match.awayScore}`
                              : 'vs'
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {match.status === 'completed' ? '완료' : '예정'}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-semibold">{match.awayTeam}</div>
                          <div className="text-sm text-muted-foreground">어웨이</div>
                        </div>
                      </div>

                      {/* 경기 정보 */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Calendar className="w-4 h-4" />
                            {match.date}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="w-4 h-4" />
                            {match.time}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {match.venue}
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <Badge className={`${status.color} text-white`}>
                            {status.label}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {match.round}라운드
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {match.hasVideo && (
                            <Button variant="outline" size="sm">
                              <Video className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/matches/${match.id}`}>
                              <BarChart3 className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">경기가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 경기를 추가해보세요!
              </p>
              <Button asChild>
                <Link href="/matches/create">
                  <Plus className="w-4 h-4 mr-2" />
                  경기 추가
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
