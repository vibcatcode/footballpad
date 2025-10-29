'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Plus, 
  Search,
  Play,
  Save,
  Share2,
  Download,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

const mockTactics = [
  {
    id: 'tactic1',
    name: '4-4-2 기본 포메이션',
    formation: '4-4-2',
    description: '균형잡힌 공격과 수비를 위한 기본 포메이션',
    team: '믿음',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-15',
    isPublic: true,
    tags: ['공격', '수비', '기본']
  },
  {
    id: 'tactic2',
    name: '3-5-2 미드필드 압박',
    formation: '3-5-2',
    description: '미드필드에서의 압박과 공격 전개',
    team: '소망',
    createdAt: '2025-01-12',
    updatedAt: '2025-01-14',
    isPublic: false,
    tags: ['압박', '미드필드', '공격']
  },
  {
    id: 'tactic3',
    name: '4-3-3 공격적 포메이션',
    formation: '4-3-3',
    description: '공격적인 플레이를 위한 4-3-3 포메이션',
    team: '사랑',
    createdAt: '2025-01-08',
    updatedAt: '2025-01-13',
    isPublic: true,
    tags: ['공격', '윙어', '압박']
  }
];

const formations = [
  { name: '4-4-2', players: [1, 4, 4, 2] },
  { name: '4-3-3', players: [1, 4, 3, 3] },
  { name: '3-5-2', players: [1, 3, 5, 2] },
  { name: '4-2-3-1', players: [1, 4, 2, 3, 1] },
  { name: '3-4-3', players: [1, 3, 4, 3] },
  { name: '5-3-2', players: [1, 5, 3, 2] }
];

export default function TacticsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('all');

  const filteredTactics = mockTactics.filter(tactic => {
    const matchesSearch = tactic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tactic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tactic.team.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormation = selectedFormation === 'all' || tactic.formation === selectedFormation;
    return matchesSearch && matchesFormation;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">전술보드</h1>
            <p className="text-muted-foreground">
              포메이션과 전술을 시뮬레이션하고 공유하세요
            </p>
          </div>
          <Button size="lg" asChild className="mt-4 sm:mt-0">
            <Link href="/tactics/create">
              <Plus className="w-5 h-5 mr-2" />
              새 전술 만들기
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="전술명, 팀명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedFormation === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFormation('all')}
            >
              전체
            </Button>
            {formations.map((formation) => (
              <Button
                key={formation.name}
                variant={selectedFormation === formation.name ? 'default' : 'outline'}
                onClick={() => setSelectedFormation(formation.name)}
              >
                {formation.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tactics Grid */}
        {filteredTactics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTactics.map((tactic) => (
              <Card key={tactic.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tactic.name}</CardTitle>
                        <CardDescription className="text-sm">{tactic.team}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={tactic.isPublic ? 'default' : 'secondary'}>
                        {tactic.isPublic ? '공개' : '비공개'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{tactic.formation}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {tactic.updatedAt}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {tactic.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tactic.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/tactics/${tactic.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        보기
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">전술이 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 전술을 만들어보세요!
              </p>
              <Button asChild>
                <Link href="/tactics/create">
                  <Plus className="w-4 h-4 mr-2" />
                  전술 만들기
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Formation Templates */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">포메이션 템플릿</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {formations.map((formation) => (
              <Card key={formation.name} className="group hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold mb-2">{formation.name}</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    {formation.players.join('-')}
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    사용하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
