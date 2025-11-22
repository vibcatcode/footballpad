'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Trophy, 
  Users, 
  Calendar, 
  BarChart3,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Lock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';

const SUPER_ADMIN_EMAILS = ['geedojo@gmail.com'] as const;
type MemberRole = 'admin' | 'manager' | 'user';
const ROLE_LABELS: Record<MemberRole, string> = {
  admin: '관리자',
  manager: '매니저',
  user: '일반 사용자',
};
const MEMBER_ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: '관리자' },
  { value: 'manager', label: '매니저' },
  { value: 'user', label: '일반 사용자' },
];

const formatKoreanDate = (value?: string | null) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return value;
  }
};

interface DashboardStats {
  totalLeagues: number;
  totalTeams: number;
  totalPlayers: number;
  totalMatches: number;
  publicLeagues: number;
  privateLeagues: number;
  publicTeams: number;
  privateTeams: number;
  publicPlayers: number;
  privatePlayers: number;
}

interface MemberProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: MemberRole;
  created_at: string;
  updated_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalMatches: 0,
    publicLeagues: 0,
    privateLeagues: 0,
    publicTeams: 0,
    privateTeams: 0,
    publicPlayers: 0,
    privatePlayers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [accountForm, setAccountForm] = useState({ username: '', full_name: '' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);

  const isSuperAdminEmail = (email?: string | null) =>
    !!email && SUPER_ADMIN_EMAILS.includes(email);

  const isSuperAdmin = useMemo(
    () => isSuperAdminEmail(user?.email) || profile?.role === 'admin',
    [user?.email, profile?.role]
  );

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const casted = data as MemberProfile;
        setProfile(casted);
        setAccountForm({
          username: casted.username ?? '',
          full_name: casted.full_name ?? '',
        });
        if (casted.role === 'admin' || isSuperAdminEmail(user.email)) {
          fetchMembers();
        }
      } else if (isSuperAdminEmail(user.email)) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      setMembers((data || []) as MemberProfile[]);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAccountSave = async () => {
    if (!user) return;
    setAccountSaving(true);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: accountForm.username,
          full_name: accountForm.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setProfile(prev =>
        prev
          ? {
              ...prev,
              username: accountForm.username,
              full_name: accountForm.full_name,
              updated_at: new Date().toISOString(),
            }
          : prev
      );

      setFeedback({
        type: 'success',
        message: '계정 정보가 업데이트되었습니다.',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      setFeedback({
        type: 'error',
        message: '계정 정보를 저장하지 못했습니다. 다시 시도해주세요.',
      });
    } finally {
      setAccountSaving(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    setRoleUpdatingId(memberId);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (error) {
      console.error('Error updating member role:', error);
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // 전체 통계
      const [leaguesResult, teamsResult, playersResult, matchesResult] = await Promise.all([
        supabase.from('leagues').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('matches').select('*'),
      ]);

      const leagues = leaguesResult.data || [];
      const teams = teamsResult.data || [];
      const players = playersResult.data || [];
      const matches = matchesResult.data || [];

      setStats({
        totalLeagues: leagues.length,
        totalTeams: teams.length,
        totalPlayers: players.length,
        totalMatches: matches.length,
        publicLeagues: leagues.filter(l => l.is_public).length,
        privateLeagues: leagues.filter(l => !l.is_public).length,
        publicTeams: teams.filter(t => t.is_public).length,
        privateTeams: teams.filter(t => !t.is_public).length,
        publicPlayers: players.filter(p => p.is_public).length,
        privatePlayers: players.filter(p => !p.is_public).length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    profile?.full_name ||
    profile?.username ||
    user?.user_metadata?.username ||
    user?.email;
  const roleBadgeLabel = isSuperAdmin
    ? '최고관리자'
    : ROLE_LABELS[profile?.role ?? 'user'];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>이 페이지에 접근하려면 로그인이 필요합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/auth/login">로그인하기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">관리자 대시보드</h1>
            <p className="text-gray-600 dark:text-gray-300">
              안녕하세요, {displayName}님!
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              새로 만들기
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>내 계정 관리</CardTitle>
              <CardDescription>
                {isSuperAdmin
                  ? '최고관리자 권한으로 전체 시스템을 관리할 수 있습니다.'
                  : '계정 정보를 최신 상태로 유지하세요.'}
              </CardDescription>
            </div>
            <Badge variant={isSuperAdmin ? 'default' : 'secondary'} className="w-fit">
              {roleBadgeLabel}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="account-email">이메일</Label>
                  <Input id="account-email" value={user.email ?? ''} disabled />
                </div>
                <div>
                  <Label htmlFor="account-username">사용자 이름</Label>
                  <Input
                    id="account-username"
                    value={accountForm.username}
                    onChange={event =>
                      setAccountForm(prev => ({ ...prev, username: event.target.value }))
                    }
                    placeholder="별칭 또는 핸들"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="account-fullname">이름/표시 이름</Label>
                  <Input
                    id="account-fullname"
                    value={accountForm.full_name}
                    onChange={event =>
                      setAccountForm(prev => ({ ...prev, full_name: event.target.value }))
                    }
                    placeholder="실명 또는 표시 이름"
                  />
                </div>
                <div>
                  <Label>계정 생성일</Label>
                  <Input value={formatKoreanDate(profile?.created_at)} disabled />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                최근 업데이트: {formatKoreanDate(profile?.updated_at)}
              </p>
              <div className="flex items-center gap-4">
                {feedback && (
                  <span
                    className={`text-sm ${
                      feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {feedback.message}
                  </span>
                )}
                <Button onClick={handleAccountSave} disabled={accountSaving}>
                  {accountSaving ? '저장 중...' : '변경사항 저장'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Card className="mb-8">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>회원 관리</CardTitle>
                <CardDescription>최고관리자가 전체 회원의 권한을 관리할 수 있습니다.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchMembers} disabled={membersLoading}>
                {membersLoading ? '새로고침 중...' : '목록 새로고침'}
              </Button>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  회원 목록을 불러오는 중입니다...
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  등록된 회원이 없습니다.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회원 정보</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>가입일</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="font-medium">
                            {member.full_name || member.username || '미정'}
                          </div>
                          <p className="text-xs text-muted-foreground">{member.username}</p>
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {isSuperAdminEmail(member.email) ? (
                            <Badge variant="outline">최고관리자</Badge>
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={value =>
                                handleRoleChange(member.id, value as MemberRole)
                              }
                              disabled={roleUpdatingId === member.id}
                            >
                              <SelectTrigger className="w-[160px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MEMBER_ROLE_OPTIONS.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>{formatKoreanDate(member.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 리그</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeagues}</div>
              <p className="text-xs text-muted-foreground">
                공개: {stats.publicLeagues} | 비공개: {stats.privateLeagues}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 팀</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeams}</div>
              <p className="text-xs text-muted-foreground">
                공개: {stats.publicTeams} | 비공개: {stats.privateTeams}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 선수</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                공개: {stats.publicPlayers} | 비공개: {stats.privatePlayers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 경기</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <p className="text-xs text-muted-foreground">이번 시즌</p>
            </CardContent>
          </Card>
        </div>

        {/* 공개/비공개 비율 차트 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">리그 공개 비율</CardTitle>
              <CardDescription>전체 리그 중 공개/비공개 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">공개</span>
                  </div>
                  <span className="font-semibold">{stats.publicLeagues}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalLeagues > 0 ? (stats.publicLeagues / stats.totalLeagues) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">비공개</span>
                  </div>
                  <span className="font-semibold">{stats.privateLeagues}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">팀 공개 비율</CardTitle>
              <CardDescription>전체 팀 중 공개/비공개 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">공개</span>
                  </div>
                  <span className="font-semibold">{stats.publicTeams}개</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalTeams > 0 ? (stats.publicTeams / stats.totalTeams) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">비공개</span>
                  </div>
                  <span className="font-semibold">{stats.privateTeams}개</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">선수 공개 비율</CardTitle>
              <CardDescription>전체 선수 중 공개/비공개 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm">공개</span>
                  </div>
                  <span className="font-semibold">{stats.publicPlayers}명</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.totalPlayers > 0 ? (stats.publicPlayers / stats.totalPlayers) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-red-600" />
                    <span className="text-sm">비공개</span>
                  </div>
                  <span className="font-semibold">{stats.privatePlayers}명</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>자주 사용하는 기능들에 빠르게 접근하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/leagues/create">
                  <Trophy className="h-6 w-6" />
                  <span>새 리그 만들기</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/teams/create">
                  <Users className="h-6 w-6" />
                  <span>새 팀 만들기</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/players/create">
                  <BarChart3 className="h-6 w-6" />
                  <span>선수 등록</span>
                </a>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <a href="/matches">
                  <Calendar className="h-6 w-6" />
                  <span>경기 관리</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
