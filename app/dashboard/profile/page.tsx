'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { 
  User, 
  Save, 
  UserCircle, 
  Ruler, 
  Weight, 
  Calendar as CalendarIcon,
  MapPin,
  Footprints,
  Award,
  Target,
  Activity,
  Users
} from 'lucide-react';
import { Link } from 'next/navigation';

const POSITION_OPTIONS = [
  { value: 'GK', label: 'GK (골키퍼)', emoji: '🥅' },
  { value: 'CB', label: 'CB (중앙 수비수)', emoji: '🛡️' },
  { value: 'LB', label: 'LB (왼쪽 풀백)', emoji: '⬅️' },
  { value: 'RB', label: 'RB (오른쪽 풀백)', emoji: '➡️' },
  { value: 'CDM', label: 'CDM (수비형 미드필더)', emoji: '🔒' },
  { value: 'CM', label: 'CM (중앙 미드필더)', emoji: '⚙️' },
  { value: 'CAM', label: 'CAM (공격형 미드필더)', emoji: '🎯' },
  { value: 'LW', label: 'LW (왼쪽 윙어)', emoji: '💨' },
  { value: 'RW', label: 'RW (오른쪽 윙어)', emoji: '💨' },
  { value: 'ST', label: 'ST (스트라이커)', emoji: '⚽' },
];

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface PlayerProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  position: 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST';
  birth_date: string | null;
  nationality: string | null;
  height: number | null;
  weight: number | null;
  preferred_foot: 'left' | 'right' | 'both' | null;
  status: 'active' | 'injured' | 'suspended' | 'inactive';
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [hasPlayerProfile, setHasPlayerProfile] = useState(false);
  
  const [userForm, setUserForm] = useState({
    username: '',
    full_name: '',
  });

  const [playerForm, setPlayerForm] = useState({
    first_name: '',
    last_name: '',
    jersey_number: null as number | null,
    position: 'CM' as 'GK' | 'CB' | 'LB' | 'RB' | 'CDM' | 'CM' | 'CAM' | 'LW' | 'RW' | 'ST',
    birth_date: '',
    birth_year: '',
    birth_month: '',
    birth_day: '',
    nationality: '한국',
    height: null as number | null,
    weight: null as number | null,
    preferred_foot: 'right' as 'left' | 'right' | 'both',
    team_id: null as string | null,
  });

  const [availableTeams, setAvailableTeams] = useState<Array<{ id: string; name: string; short_name: string | null }>>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAvailableTeams();
    }
  }, [user]);

  const fetchAvailableTeams = async () => {
    if (!user) {
      setAvailableTeams([]);
      setLoadingTeams(false);
      return;
    }
    
    setLoadingTeams(true);
    try {
      // 사용자가 만든 팀 가져오기
      const { data: createdTeams, error: createdError } = await supabase
        .from('teams')
        .select('id, name, short_name')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      // 사용자가 등록된 팀 가져오기 (league_participants에서)
      const { data: participantData, error: participantError } = await supabase
        .from('league_participants')
        .select('team_id, team:teams!league_participants_team_id_fkey(id, name, short_name)')
        .eq('user_id', user.id)
        .not('team_id', 'is', null);

      if (createdError || participantError) {
        console.error('Error fetching teams:', createdError || participantError);
        setAvailableTeams(createdTeams || []);
        setLoadingTeams(false);
        return;
      }

      // 팀 ID를 Set으로 관리하여 중복 제거
      const teamMap = new Map<string, { id: string; name: string; short_name: string | null }>();
      
      // 사용자가 만든 팀 추가
      if (createdTeams) {
        createdTeams.forEach(team => {
          if (team && team.id) {
            teamMap.set(team.id, { id: team.id, name: team.name, short_name: team.short_name });
          }
        });
      }

      // 사용자가 등록된 팀 추가
      if (participantData) {
        participantData.forEach((participant: any) => {
          if (participant.team && participant.team.id) {
            teamMap.set(participant.team.id, {
              id: participant.team.id,
              name: participant.team.name,
              short_name: participant.team.short_name
            });
          }
        });
      }

      setAvailableTeams(Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error fetching available teams:', error);
      setAvailableTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 사용자 프로필 가져오기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user profile:', userError);
        setLoading(false);
        return;
      }

      if (userData) {
        setUserProfile(userData);
        setUserForm({
          username: userData.username || '',
          full_name: userData.full_name || '',
        });
      }

      // 선수 프로필 가져오기
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (playerError && playerError.code !== 'PGRST116') {
        console.error('Error fetching player profile:', playerError);
      }

      if (playerData) {
        setPlayerProfile(playerData);
        setHasPlayerProfile(true);
        const birthDate = playerData.birth_date ? new Date(playerData.birth_date) : null;
        setPlayerForm({
          first_name: playerData.first_name || '',
          last_name: playerData.last_name || '',
          jersey_number: playerData.jersey_number || null,
          position: playerData.position || 'CM',
          birth_date: playerData.birth_date || '',
          birth_year: birthDate ? birthDate.getFullYear().toString() : '',
          birth_month: birthDate ? (birthDate.getMonth() + 1).toString().padStart(2, '0') : '',
          birth_day: birthDate ? birthDate.getDate().toString().padStart(2, '0') : '',
          nationality: playerData.nationality || '한국',
          height: playerData.height || null,
          weight: playerData.weight || null,
          preferred_foot: playerData.preferred_foot || 'right',
          team_id: playerData.team_id || null,
        });
      } else {
        // 선수 프로필이 없으면 사용자 이름으로 초기화
        const nameParts = userData?.full_name?.split(' ') || userData?.username?.split(' ') || ['', ''];
        setPlayerForm(prev => ({
          ...prev,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUserProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: userForm.username,
          full_name: userForm.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      alert('프로필이 저장되었습니다.');
      fetchProfile();
    } catch (error) {
      console.error('Error saving user profile:', error);
      alert('프로필 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlayerProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (hasPlayerProfile && playerProfile) {
        // 선수 프로필 업데이트
        const { error } = await supabase
          .from('players')
          .update({
            first_name: playerForm.first_name,
            last_name: playerForm.last_name,
            jersey_number: playerForm.jersey_number,
            position: playerForm.position,
            birth_date: playerForm.birth_year && playerForm.birth_month && playerForm.birth_day 
              ? `${playerForm.birth_year}-${playerForm.birth_month}-${playerForm.birth_day}` 
              : null,
            nationality: playerForm.nationality || null,
            height: playerForm.height,
            weight: playerForm.weight,
            preferred_foot: playerForm.preferred_foot,
            team_id: playerForm.team_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', playerProfile.id);

        if (error) throw error;
      } else {
        // 새 선수 프로필 생성 (사용자를 선수로 자동 등록)
        const { error } = await supabase
          .from('players')
          .insert({
            user_id: user.id,
            first_name: playerForm.first_name,
            last_name: playerForm.last_name,
            jersey_number: playerForm.jersey_number,
            position: playerForm.position,
            birth_date: playerForm.birth_year && playerForm.birth_month && playerForm.birth_day 
              ? `${playerForm.birth_year}-${playerForm.birth_month}-${playerForm.birth_day}` 
              : null,
            nationality: playerForm.nationality || null,
            height: playerForm.height,
            weight: playerForm.weight,
            preferred_foot: playerForm.preferred_foot,
            team_id: playerForm.team_id || null,
            status: 'active',
          });

        if (error) throw error;
        setHasPlayerProfile(true);
      }

      alert('선수 프로필이 저장되었습니다.');
      fetchProfile();
    } catch (error) {
      console.error('Error saving player profile:', error);
      alert('선수 프로필 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  const positionOption = POSITION_OPTIONS.find(p => p.value === playerForm.position);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">내 프로필</h1>
        <p className="text-muted-foreground">프로필 정보와 선수 정보를 관리하세요</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">계정 정보</TabsTrigger>
          <TabsTrigger value="player">선수 프로필</TabsTrigger>
        </TabsList>

        {/* 계정 정보 */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-5 h-5" />
                계정 정보
              </CardTitle>
              <CardDescription>사용자 계정 정보를 수정할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>이메일</Label>
                <Input value={userProfile?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다</p>
              </div>

              <div className="space-y-2">
                <Label>사용자명</Label>
                <Input
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  placeholder="사용자명을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label>전체 이름</Label>
                <Input
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  placeholder="전체 이름을 입력하세요"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveUserProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 선수 프로필 */}
        <TabsContent value="player">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 선수 카드 미리보기 (EA FC26 스타일) */}
            <Card className="lg:col-span-1 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 border-0 shadow-xl">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                  {/* 상단 배경 패턴 */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '40px 40px'
                    }}></div>
                  </div>
                  
                  <div className="relative p-6">
                    {/* 포지션 배지 */}
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-white/20 text-white border-white/30 px-3 py-1 text-sm font-semibold">
                        {positionOption?.emoji} {playerForm.position}
                      </Badge>
                      {playerForm.jersey_number && (
                        <div className="text-4xl font-bold opacity-50">
                          #{playerForm.jersey_number}
                        </div>
                      )}
                    </div>

                    {/* 선수 이름 */}
                    <div className="mb-6">
                      <div className="text-sm opacity-80 mb-1">PLAYER</div>
                      <h3 className="text-2xl font-bold tracking-tight">
                        {playerForm.first_name || '이름'} {playerForm.last_name || '성'}
                      </h3>
                    </div>

                    {/* 피지컬 정보 */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {playerForm.height && (
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-xs opacity-80 mb-1">신장</div>
                          <div className="text-lg font-bold">{playerForm.height} cm</div>
                        </div>
                      )}
                      {playerForm.weight && (
                        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-xs opacity-80 mb-1">체중</div>
                          <div className="text-lg font-bold">{playerForm.weight} kg</div>
                        </div>
                      )}
                    </div>

                    {/* 주발 정보 */}
                    {playerForm.preferred_foot && (
                      <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <div className="text-xs opacity-80 mb-1">주발</div>
                        <div className="text-lg font-bold">
                          {playerForm.preferred_foot === 'left' ? '왼발' : 
                           playerForm.preferred_foot === 'right' ? '오른발' : '양발'}
                        </div>
                      </div>
                    )}

                    {/* 국적 */}
                    {playerForm.nationality && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="text-xs opacity-80 mb-1">국적</div>
                        <div className="text-sm font-semibold">{playerForm.nationality}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 선수 정보 입력 폼 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  선수 정보
                </CardTitle>
                <CardDescription>
                  {hasPlayerProfile 
                    ? '선수 프로필 정보를 수정할 수 있습니다' 
                    : '선수 프로필을 생성하여 자신을 선수로 등록하세요'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>이름 *</Label>
                      <Input
                        value={playerForm.first_name}
                        onChange={(e) => setPlayerForm({ ...playerForm, first_name: e.target.value })}
                        placeholder="이름"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>성 *</Label>
                      <Input
                        value={playerForm.last_name}
                        onChange={(e) => setPlayerForm({ ...playerForm, last_name: e.target.value })}
                        placeholder="성"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>등번호</Label>
                      <Input
                        type="number"
                        value={playerForm.jersey_number || ''}
                        onChange={(e) => setPlayerForm({ 
                          ...playerForm, 
                          jersey_number: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        placeholder="등번호"
                        min="1"
                        max="99"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>국적</Label>
                      <Input
                        value={playerForm.nationality}
                        onChange={(e) => setPlayerForm({ ...playerForm, nationality: e.target.value })}
                        placeholder="예: 한국"
                      />
                    </div>
                  </div>
                </div>

                {/* 포지션 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">포지션</h3>
                  <div className="space-y-2">
                    <Label>주 포지션 *</Label>
                    <Select
                      value={playerForm.position}
                      onValueChange={(value) => setPlayerForm({ 
                        ...playerForm, 
                        position: value as any 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.emoji} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 소속 팀 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    소속 팀
                  </h3>
                  <div className="space-y-2">
                    <Label>소속 팀</Label>
                    {loadingTeams ? (
                      <div className="text-sm text-muted-foreground">팀 목록을 불러오는 중...</div>
                    ) : availableTeams.length === 0 ? (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          소속 가능한 팀이 없습니다. 먼저 팀을 생성하거나 팀에 등록해주세요.
                        </div>
                        <Link href="/teams/create">
                          <Button variant="outline" size="sm" className="w-full">
                            새 팀 생성하기
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <Select
                        value={playerForm.team_id || ''}
                        onValueChange={(value) => {
                          setPlayerForm({ ...playerForm, team_id: value || null });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="소속 팀을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">소속 없음</SelectItem>
                          {availableTeams.map(team => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name} {team.short_name ? `(${team.short_name})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* 피지컬 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    피지컬 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Ruler className="w-4 h-4" />
                        신장 (cm)
                      </Label>
                      <Input
                        type="number"
                        value={playerForm.height || ''}
                        onChange={(e) => setPlayerForm({ 
                          ...playerForm, 
                          height: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        placeholder="예: 175"
                        min="100"
                        max="250"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Weight className="w-4 h-4" />
                        체중 (kg)
                      </Label>
                      <Input
                        type="number"
                        value={playerForm.weight || ''}
                        onChange={(e) => setPlayerForm({ 
                          ...playerForm, 
                          weight: e.target.value ? parseInt(e.target.value) : null 
                        })}
                        placeholder="예: 70"
                        min="30"
                        max="200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Footprints className="w-4 h-4" />
                        주발 *
                      </Label>
                      <Select
                        value={playerForm.preferred_foot}
                        onValueChange={(value) => setPlayerForm({ 
                          ...playerForm, 
                          preferred_foot: value as any 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">왼발</SelectItem>
                          <SelectItem value="right">오른발</SelectItem>
                          <SelectItem value="both">양발</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 생년월일 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    개인 정보
                  </h3>
                  <div className="space-y-2">
                    <Label>생년월일</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Select
                          value={playerForm.birth_year}
                          onValueChange={(value) => {
                            setPlayerForm({ ...playerForm, birth_year: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="년도" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => {
                              const year = new Date().getFullYear() - i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}년
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Select
                          value={playerForm.birth_month}
                          onValueChange={(value) => {
                            setPlayerForm({ ...playerForm, birth_month: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="월" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => {
                              const month = (i + 1).toString().padStart(2, '0');
                              return (
                                <SelectItem key={month} value={month}>
                                  {i + 1}월
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Select
                          value={playerForm.birth_day}
                          onValueChange={(value) => {
                            setPlayerForm({ ...playerForm, birth_day: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="일" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {(() => {
                              const year = parseInt(playerForm.birth_year) || new Date().getFullYear();
                              const month = parseInt(playerForm.birth_month) || 1;
                              const daysInMonth = new Date(year, month, 0).getDate();
                              return Array.from({ length: daysInMonth }, (_, i) => {
                                const day = (i + 1).toString().padStart(2, '0');
                                return (
                                  <SelectItem key={day} value={day}>
                                    {i + 1}일
                                  </SelectItem>
                                );
                              });
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {playerForm.birth_year && playerForm.birth_month && playerForm.birth_day && (
                      <p className="text-xs text-muted-foreground">
                        선택된 날짜: {playerForm.birth_year}년 {parseInt(playerForm.birth_month)}월 {parseInt(playerForm.birth_day)}일
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSavePlayerProfile} 
                    disabled={saving || !playerForm.first_name || !playerForm.last_name}
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        저장 중...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {hasPlayerProfile ? '프로필 업데이트' : '선수로 등록하기'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
