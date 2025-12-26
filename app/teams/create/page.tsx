'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  Upload,
  MapPin,
  Calendar,
  Trophy,
  Search,
  CheckCircle2,
  Send
} from 'lucide-react';
import { PrivacySelect } from '@/components/ui/privacy-select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface League {
  id: string;
  name: string;
  description: string | null;
  season: string | null;
  status: string;
  visibility: string;
  created_by: string;
}

export default function CreateTeamPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    foundedYear: '',
    location: '',
    website: '',
    primaryColor: '#1E40AF',
    secondaryColor: '#F3F4F6',
    visibility: 'public' as 'public' | 'private'
  });
  
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLeagues, setLoadingLeagues] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLeagues();
    }
  }, [user]);

  const fetchLeagues = async () => {
    if (!user) return;
    setLoadingLeagues(true);
    try {
      // 사용자가 만든 리그
      const { data: myLeaguesData, error: myError } = await supabase
        .from('leagues')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      // 공개 리그 (사용자가 만든 것 제외)
      const { data: publicLeaguesData, error: publicError } = await supabase
        .from('leagues')
        .select('*')
        .eq('visibility', 'public')
        .neq('created_by', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (myError || publicError) {
        console.error('Error fetching leagues:', myError || publicError);
        return;
      }

      setMyLeagues(myLeaguesData || []);
      setPublicLeagues(publicLeaguesData || []);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const searchPublicLeagues = async (query: string) => {
    if (!user || !query.trim()) {
      setPublicLeagues([]);
      return;
    }

    setLoadingLeagues(true);
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('visibility', 'public')
        .neq('created_by', user.id)
        .eq('status', 'active')
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching leagues:', error);
        return;
      }

      setPublicLeagues(data || []);
    } catch (error) {
      console.error('Error searching leagues:', error);
    } finally {
      setLoadingLeagues(false);
    }
  };

  const handleLeagueToggle = (leagueId: string) => {
    setSelectedLeagues(prev => 
      prev.includes(leagueId) 
        ? prev.filter(id => id !== leagueId)
        : [...prev, leagueId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setSubmitting(true);
    try {
      // 팀 생성
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name,
          short_name: formData.shortName,
          description: formData.description,
          founded_year: formData.foundedYear ? parseInt(formData.foundedYear) : null,
          location: formData.location,
          website_url: formData.website,
          primary_color: formData.primaryColor,
          secondary_color: formData.secondaryColor,
          created_by: user.id,
          is_public: formData.visibility === 'public',
          visibility: formData.visibility,
        })
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        alert('팀 생성 중 오류가 발생했습니다.');
        setSubmitting(false);
        return;
      }

      // 선택한 리그에 참여 요청 전송
      if (selectedLeagues.length > 0 && teamData) {
        const participantRequests = selectedLeagues.map(leagueId => ({
          league_id: leagueId,
          user_id: user.id,
          team_id: teamData.id,
          role: 'participant' as const,
          status: 'pending' as const,
        }));

        const { error: requestError } = await supabase
          .from('league_participants')
          .insert(participantRequests);

        if (requestError) {
          console.error('Error sending league requests:', requestError);
          // 팀은 생성되었지만 리그 참여 요청 실패
          alert('팀은 생성되었지만 일부 리그 참여 요청 전송에 실패했습니다.');
        } else {
          alert(`팀이 성공적으로 생성되었고 ${selectedLeagues.length}개의 리그에 참여 요청을 보냈습니다!`);
        }
      } else {
        alert('팀이 성공적으로 생성되었습니다!');
      }

      router.push('/teams');
    } catch (error) {
      console.error('Error creating team:', error);
      alert('팀 생성 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">팀 생성</h1>
          <p className="text-gray-600 dark:text-gray-300">새로운 팀을 등록하고 관리하세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 팀 정보 입력 폼 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>팀 기본 정보</CardTitle>
                  <CardDescription>팀의 기본 정보를 입력해주세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName">팀명 *</Label>
                      <Input
                        id="teamName"
                        placeholder="팀명을 입력하세요"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shortName">팀 약칭</Label>
                      <Input
                        id="shortName"
                        placeholder="예: FC서울"
                        value={formData.shortName}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">팀 소개</Label>
                    <Textarea
                      id="description"
                      placeholder="팀에 대한 간단한 소개를 작성해주세요"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">연고지</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="예: 서울특별시"
                          className="pl-10"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="founded">창단년도</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="founded"
                          placeholder="예: 1983"
                          className="pl-10"
                          value={formData.foundedYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, foundedYear: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">웹사이트</Label>
                    <Input
                      id="website"
                      placeholder="https://example.com"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>

                  {/* 공개 설정 */}
                  <div className="space-y-2">
                    <PrivacySelect
                      value={formData.visibility}
                      onChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                      label="팀 공개 설정"
                    />
                  </div>

                  {/* 리그 참여 요청 */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">리그 참여 요청</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      팀 생성과 동시에 리그 참여 요청을 보낼 수 있습니다.
                    </p>

                    {/* 내가 만든 리그 */}
                    {myLeagues.length > 0 && (
                      <div className="space-y-2">
                        <Label>내가 만든 리그</Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                          {myLeagues.map(league => (
                            <div
                              key={league.id}
                              className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                              onClick={() => handleLeagueToggle(league.id)}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{league.name}</span>
                                  {league.season && (
                                    <Badge variant="outline" className="text-xs">
                                      {league.season}
                                    </Badge>
                                  )}
                                </div>
                                {league.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {league.description}
                                  </p>
                                )}
                              </div>
                              {selectedLeagues.includes(league.id) && (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 공개 리그 검색 */}
                    <div className="space-y-2">
                      <Label>공개 리그 검색</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="리그 이름으로 검색..."
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              searchPublicLeagues(e.target.value);
                            }}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      {searchQuery && (
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                          {loadingLeagues ? (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              검색 중...
                            </div>
                          ) : publicLeagues.length > 0 ? (
                            publicLeagues.map(league => (
                              <div
                                key={league.id}
                                className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer"
                                onClick={() => handleLeagueToggle(league.id)}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{league.name}</span>
                                    {league.season && (
                                      <Badge variant="outline" className="text-xs">
                                        {league.season}
                                      </Badge>
                                    )}
                                  </div>
                                  {league.description && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {league.description}
                                    </p>
                                  )}
                                </div>
                                {selectedLeagues.includes(league.id) && (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              검색 결과가 없습니다
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedLeagues.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-primary">
                        <Send className="w-4 h-4" />
                        <span>{selectedLeagues.length}개의 리그에 참여 요청을 보냅니다</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>팀 로고</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">클릭하여 로고 업로드</p>
                      <p className="text-xs text-gray-500">PNG, JPG 최대 2MB</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>팀 색상</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">주 색상</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={formData.primaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondaryColor">보조 색상</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={formData.secondaryColor}
                            onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 팀 미리보기 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">팀 미리보기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{formData.name || '팀명'}</h3>
                      <p className="text-sm text-muted-foreground">{formData.location || '연고지'}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>창단: {formData.foundedYear || '2024'}</p>
                      <p>선수: 0명</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 액션 버튼 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Users className="w-4 h-4 mr-2 animate-spin" />
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          팀 생성하기
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                      미리보기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 도움말 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">도움말</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• 팀명은 고유해야 합니다</p>
                  <p>• 로고는 정사각형 비율을 권장합니다</p>
                  <p>• 팀 생성 후 선수와 스태프를 추가할 수 있습니다</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}