'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KoreanCalendar } from '@/components/ui/korean-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Trophy,
  ArrowLeft,
  Calendar as CalendarIcon,
  Users,
  Settings,
  Save,
  Plus
} from 'lucide-react';
import { PrivacySelect } from '@/components/ui/privacy-select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Team {
  id: string;
  name: string;
  short_name: string | null;
}

export default function CreateLeaguePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    season: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    gameCycle: 'weekly',
    venue: '',
    timeSlot: '19:00',
    visibility: 'public' as 'public' | 'private'
  });

  useEffect(() => {
    if (user) {
      fetchUserTeams();
    }
  }, [user]);

  // 페이지가 포커스를 받을 때 팀 목록 새로고침 (팀 생성 후 돌아올 때를 위해)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchUserTeams();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchUserTeams = async () => {
    if (!user) return;
    
    setLoadingTeams(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 리그 생성
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .insert({
          name: formData.name,
          description: formData.description,
          season: formData.season,
          start_date: formData.startDate?.toISOString().split('T')[0],
          end_date: formData.endDate?.toISOString().split('T')[0],
          created_by: user.id,
          is_public: formData.visibility === 'public',
          visibility: formData.visibility,
        })
        .select()
        .single();

      if (leagueError) {
        console.error('Error creating league:', leagueError);
        alert('리그 생성 중 오류가 발생했습니다.');
        return;
      }

      // 선택된 팀들을 league_participants에 추가
      if (selectedTeamIds.length > 0 && leagueData) {
        const participants = selectedTeamIds.map(teamId => ({
          league_id: leagueData.id,
          user_id: user.id,
          team_id: teamId,
          role: 'admin' as const,
          status: 'approved' as const,
        }));

        const { error: participantsError } = await supabase
          .from('league_participants')
          .insert(participants);

        if (participantsError) {
          console.error('Error adding teams to league:', participantsError);
          // 리그는 생성되었지만 팀 추가에 실패한 경우에도 계속 진행
        }
      }

      alert('리그가 성공적으로 생성되었습니다!');
      router.push('/leagues');
    } catch (error) {
      console.error('Error creating league:', error);
      alert('리그 생성 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">리그 생성</h1>
            <p className="text-muted-foreground">
              새로운 축구 리그를 만들어보세요
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 기본 정보 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    기본 정보
                  </CardTitle>
                  <CardDescription>
                    리그의 기본 정보를 입력하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">리그명 *</Label>
                    <Input
                      id="name"
                      placeholder="리그명을 입력하세요"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">리그 설명</Label>
                    <Textarea
                      id="description"
                      placeholder="리그에 대한 간단한 설명을 입력하세요"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="season">시즌명</Label>
                    <Input
                      id="season"
                      placeholder="예: 2025 시즌"
                      value={formData.season}
                      onChange={(e) => handleInputChange('season', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시즌 시작일 *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.startDate ? format(formData.startDate, 'PPP', { locale: ko }) : '날짜 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <KoreanCalendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => handleInputChange('startDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>시즌 종료일 *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, 'PPP', { locale: ko }) : '날짜 선택'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <KoreanCalendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => handleInputChange('endDate', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 경기 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    경기 설정
                  </CardTitle>
                  <CardDescription>
                    경기 주기와 규칙을 설정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="gameCycle">경기 주기</Label>
                    <Select value={formData.gameCycle} onValueChange={(value) => handleInputChange('gameCycle', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">주간</SelectItem>
                        <SelectItem value="biweekly">격주</SelectItem>
                        <SelectItem value="monthly">월간</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venue">기본 경기장</Label>
                    <Input
                      id="venue"
                      placeholder="예: 풋볼 아레나"
                      value={formData.venue}
                      onChange={(e) => handleInputChange('venue', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">기본 경기 시간</Label>
                    <Input
                      id="timeSlot"
                      type="time"
                      value={formData.timeSlot}
                      onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 공개 설정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    공개 설정
                  </CardTitle>
                  <CardDescription>
                    리그의 공개 범위를 설정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PrivacySelect
                    value={formData.visibility}
                    onChange={(value) => handleInputChange('visibility', value)}
                    label="리그 공개 설정"
                  />
                </CardContent>
              </Card>

              {/* 팀 선택 */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    참가 팀 선택
                  </CardTitle>
                  <CardDescription>
                    리그에 참가할 팀을 선택하세요 (선택사항)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingTeams ? (
                    <div className="text-center py-8 text-muted-foreground">
                      팀 목록을 불러오는 중...
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <p className="text-muted-foreground">
                        생성하신 팀이 없습니다. 먼저 팀을 생성해주세요.
                      </p>
                      <Link href="/teams/create">
                        <Button type="button" variant="default">
                          <Plus className="w-4 h-4 mr-2" />
                          팀 생성하기
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teams.map((team) => (
                          <label
                            key={team.id}
                            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTeamIds.includes(team.id)}
                              onChange={() => handleTeamToggle(team.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{team.name}</div>
                              {team.short_name && (
                                <div className="text-sm text-muted-foreground">{team.short_name}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                      {teams.length > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            {selectedTeamIds.length}개 팀 선택됨
                          </p>
                          <Link href="/teams/create">
                            <Button type="button" variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              새 팀 생성
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-8">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                취소
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                리그 생성
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
