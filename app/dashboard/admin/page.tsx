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
  Shield,
  Users,
  Trash2,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const SUPER_ADMIN_EMAILS: readonly string[] = ['geedojo@gmail.com'];
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

interface MemberProfile {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: MemberRole;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string | null;
  banned_until?: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSuperAdminEmail = (email?: string | null) =>
    !!email && SUPER_ADMIN_EMAILS.includes(email);

  const isSuperAdmin = useMemo(
    () => isSuperAdminEmail(user?.email) || profile?.role === 'admin',
    [user?.email, profile?.role]
  );

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchMembers();
    }
  }, [isSuperAdmin]);

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
        if (!isSuperAdminEmail(user.email) && casted.role !== 'admin') {
          router.push('/dashboard');
        }
      } else if (!isSuperAdminEmail(user.email)) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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

      // email_confirmed_at는 public.users에 저장되어 있거나 null일 수 있음
      setMembers((data || []) as MemberProfile[]);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
    setRoleUpdatingId(memberId);
    setFeedback(null);
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

      setFeedback({
        type: 'success',
        message: '회원 등급이 변경되었습니다.',
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      setFeedback({
        type: 'error',
        message: '회원 등급 변경에 실패했습니다.',
      });
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const handleDeleteMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`정말로 ${memberEmail} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    if (isSuperAdminEmail(memberEmail)) {
      alert('최고관리자 계정은 삭제할 수 없습니다.');
      return;
    }

    setDeletingId(memberId);
    setFeedback(null);
    try {
      // public.users 테이블에서 삭제
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId);

      if (userError) {
        throw userError;
      }

      // auth.users에서도 삭제 (Supabase Admin API 필요, 여기서는 public.users만 삭제)
      setMembers(prev => prev.filter(member => member.id !== memberId));

      setFeedback({
        type: 'success',
        message: '회원이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      setFeedback({
        type: 'error',
        message: '회원 삭제에 실패했습니다.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleBanMember = async (memberId: string, ban: boolean) => {
    setBanningId(memberId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          banned_until: ban ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', memberId);

      if (error) {
        throw error;
      }

      setMembers(prev =>
        prev.map(member =>
          member.id === memberId
            ? { ...member, banned_until: ban ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null }
            : member
        )
      );

      setFeedback({
        type: 'success',
        message: ban ? '회원이 차단되었습니다.' : '회원 차단이 해제되었습니다.',
      });
    } catch (error) {
      console.error('Error banning member:', error);
      setFeedback({
        type: 'error',
        message: '회원 차단 처리에 실패했습니다.',
      });
    } finally {
      setBanningId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch =
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, searchQuery, roleFilter]);

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

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>이 페이지는 최고관리자만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/dashboard">대시보드로 돌아가기</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              최고 관리자 페이지
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              회원 관리, 등급 관리, 인증 관리를 수행할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={fetchMembers} disabled={membersLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${membersLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard">대시보드</a>
            </Button>
          </div>
        </div>

        {/* 피드백 메시지 */}
        {feedback && (
          <Card className={`mb-6 border-2 ${feedback.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-2 ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertTriangle className="h-5 w-5" />
                )}
                <span>{feedback.message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 회원</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">관리자</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {members.filter(m => m.role === 'admin' || isSuperAdminEmail(m.email)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">매니저</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.filter(m => m.role === 'manager').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">일반 회원</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.filter(m => m.role === 'user').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* 검색 및 필터 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>회원 검색 및 필터</CardTitle>
            <CardDescription>이메일, 사용자명, 이름으로 검색하고 등급별로 필터링할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search">검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="이메일, 사용자명, 이름으로 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-filter">등급 필터</Label>
                <Select value={roleFilter} onValueChange={value => setRoleFilter(value as MemberRole | 'all')}>
                  <SelectTrigger id="role-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    {MEMBER_ROLE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 회원 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>회원 관리</CardTitle>
            <CardDescription>
              총 {filteredMembers.length}명의 회원이 표시됩니다. (전체 {members.length}명)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                회원 목록을 불러오는 중입니다...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {searchQuery || roleFilter !== 'all' ? '검색 결과가 없습니다.' : '등록된 회원이 없습니다.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>회원 정보</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>등급</TableHead>
                      <TableHead>인증 상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead className="text-right">관리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map(member => {
                      const isBanned = member.banned_until && new Date(member.banned_until) > new Date();
                      const isEmailConfirmed = !!member.email_confirmed_at;
                      const isSuperAdmin = isSuperAdminEmail(member.email);

                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="font-medium">
                              {member.full_name || member.username || '미정'}
                            </div>
                            <p className="text-xs text-muted-foreground">{member.username}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {member.email}
                              {isEmailConfirmed ? (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  인증됨
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs text-yellow-600">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  미인증
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isSuperAdmin ? (
                              <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                최고관리자
                              </Badge>
                            ) : (
                              <Select
                                value={member.role}
                                onValueChange={value => handleRoleChange(member.id, value as MemberRole)}
                                disabled={roleUpdatingId === member.id}
                              >
                                <SelectTrigger className="w-[140px]">
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
                          <TableCell>
                            {isBanned ? (
                              <Badge variant="destructive">차단됨</Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600">
                                활성
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{formatKoreanDate(member.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {!isSuperAdmin && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleBanMember(member.id, !isBanned)}
                                    disabled={banningId === member.id}
                                  >
                                    {isBanned ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        해제
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="h-4 w-4 mr-1" />
                                        차단
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteMember(member.id, member.email)}
                                    disabled={deletingId === member.id}
                                  >
                                    {deletingId === member.id ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        삭제
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

