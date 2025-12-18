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
  FileText,
  Image,
  Video,
  Trophy,
  Calendar,
  User as UserIcon,
  BarChart3,
  TrendingUp,
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

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  type: 'text' | 'image' | 'video';
  thumbnail_url: string | null;
  media_url: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  tags: string[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    username: string;
    full_name: string | null;
  };
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | 'all'>('all');

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

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, full_name, role, created_at, updated_at, banned_until, email_confirmed_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        // 프로필이 없어도 최고관리자 이메일이면 계속 진행
        if (!isSuperAdminEmail(user.email)) {
          router.push('/dashboard');
        }
        setLoading(false);
        return;
      }

      if (data) {
        const casted = data as MemberProfile;
        console.log('Admin profile loaded:', {
          id: casted.id,
          email: casted.email,
          role: casted.role,
          created_at: casted.created_at,
        });
        setProfile(casted);
        if (!isSuperAdminEmail(user.email) && casted.role !== 'admin') {
          router.push('/dashboard');
          setLoading(false);
          return;
        }
      } else if (!isSuperAdminEmail(user.email)) {
        router.push('/dashboard');
        setLoading(false);
        return;
      }
      
      // 최고 관리자인 경우 회원 목록과 게시물 목록도 함께 불러오기
      if (isSuperAdminEmail(user.email) || data?.role === 'admin') {
        fetchMembers();
        fetchPosts();
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
      // RLS 정책이 제대로 작동하는지 확인하기 위해 에러를 상세히 로깅
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, full_name, role, created_at, updated_at, banned_until, email_confirmed_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setFeedback({
          type: 'error',
          message: `회원 목록을 불러오는데 실패했습니다: ${error.message}`,
        });
        return;
      }

      console.log('Fetched members:', data?.length || 0);
      console.log('Members data:', data);
      
      // email_confirmed_at는 public.users에 저장되어 있거나 null일 수 있음
      setMembers((data || []) as MemberProfile[]);
      
      if (!data || data.length === 0) {
        console.warn('No members found. This might be an RLS policy issue.');
        setFeedback({
          type: 'error',
          message: '회원 목록이 비어있습니다. RLS 정책을 확인해주세요.',
        });
      } else {
        // 성공 시 피드백 초기화
        setFeedback(null);
      }
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setFeedback({
        type: 'error',
        message: `회원 목록을 불러오는데 실패했습니다: ${error?.message || '알 수 없는 오류'}`,
      });
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
    if (!confirm(`정말로 ${memberEmail} 회원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 해당 회원이 작성한 모든 게시물도 함께 삭제됩니다.`)) {
      return;
    }

    if (isSuperAdminEmail(memberEmail)) {
      alert('최고관리자 계정은 삭제할 수 없습니다.');
      return;
    }

    setDeletingId(memberId);
    setFeedback(null);
    try {
      // 먼저 해당 회원의 게시물 수 확인
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', memberId);

      // public.users 테이블에서 삭제 (CASCADE로 게시물도 자동 삭제됨)
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', memberId);

      if (userError) {
        throw userError;
      }

      // auth.users에서도 삭제 (Supabase Admin API 필요, 여기서는 public.users만 삭제)
      setMembers(prev => prev.filter(member => member.id !== memberId));
      setPosts(prev => prev.filter(post => post.user_id !== memberId));

      setFeedback({
        type: 'success',
        message: `회원이 삭제되었습니다.${postsCount ? ` (관련 게시물 ${postsCount}개도 함께 삭제됨)` : ''}`,
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

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          user:users(id, email, username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (selectedUserId !== 'all') {
        query = query.eq('user_id', selectedUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching posts:', error);
        setFeedback({
          type: 'error',
          message: `게시물 목록을 불러오는데 실패했습니다: ${error.message}`,
        });
        return;
      }

      const postsWithUser = (data || []).map((post: any) => ({
        ...post,
        user: post.user ? {
          email: post.user.email,
          username: post.user.username,
          full_name: post.user.full_name,
        } : undefined,
      }));

      setPosts(postsWithUser as Post[]);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      setFeedback({
        type: 'error',
        message: `게시물 목록을 불러오는데 실패했습니다: ${error?.message || '알 수 없는 오류'}`,
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`정말로 "${postTitle}" 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    setDeletingPostId(postId);
    setFeedback(null);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        throw error;
      }

      setPosts(prev => prev.filter(post => post.id !== postId));

      setFeedback({
        type: 'success',
        message: '게시물이 삭제되었습니다.',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      setFeedback({
        type: 'error',
        message: '게시물 삭제에 실패했습니다.',
      });
    } finally {
      setDeletingPostId(null);
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

  // 게시물 필터링은 렌더링 시점에 처리 (useMemo 대신)

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

        {/* 데이터 관리 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                모든 리그 관리
              </CardTitle>
              <CardDescription>사이트의 모든 리그를 조회하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/my-leagues">
                  리그 관리하기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                모든 팀 관리
              </CardTitle>
              <CardDescription>사이트의 모든 팀을 조회하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/my-teams">
                  팀 관리하기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                모든 경기 관리
              </CardTitle>
              <CardDescription>사이트의 모든 경기를 조회하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/my-matches">
                  경기 관리하기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                모든 선수 관리
              </CardTitle>
              <CardDescription>사이트의 모든 선수를 조회하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/my-players">
                  선수 관리하기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                모든 전술 관리
              </CardTitle>
              <CardDescription>사이트의 모든 전술을 조회하고 관리합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/my-tactics">
                  전술 관리하기
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                모든 통계 관리
              </CardTitle>
              <CardDescription>사이트의 모든 통계를 조회합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a href="/dashboard/my-reports">
                  통계 보기
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 게시물 관리 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>게시물 관리</CardTitle>
            <CardDescription>
              총 {posts.length}개의 게시물이 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* 게시물 검색 및 필터 */}
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="space-y-2">
                <Label htmlFor="post-search">게시물 검색</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="post-search"
                    placeholder="제목, 내용으로 검색..."
                    value={postSearchQuery}
                    onChange={e => setPostSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-user-filter">작성자 필터</Label>
                <Select value={selectedUserId} onValueChange={value => setSelectedUserId(value as string | 'all')}>
                  <SelectTrigger id="post-user-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 작성자</SelectItem>
                    {members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name || member.username || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={fetchPosts} disabled={postsLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${postsLoading ? 'animate-spin' : ''}`} />
                새로고침
              </Button>
            </div>

            {postsLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                게시물 목록을 불러오는 중입니다...
              </div>
            ) : (() => {
              const filteredPosts = posts.filter(post => {
                const matchesSearch =
                  post.title.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
                  post.content?.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
                  post.user?.username?.toLowerCase().includes(postSearchQuery.toLowerCase());
                const matchesUser = selectedUserId === 'all' || post.user_id === selectedUserId;
                return matchesSearch && matchesUser;
              });

              return filteredPosts.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {postSearchQuery || selectedUserId !== 'all' ? '검색 결과가 없습니다.' : '등록된 게시물이 없습니다.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>게시물 정보</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>통계</TableHead>
                        <TableHead>작성일</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPosts.map(post => (
                        <TableRow key={post.id}>
                          <TableCell>
                            <div className="font-medium line-clamp-2">{post.title}</div>
                            {post.content && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {post.content}
                              </p>
                            )}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.slice(0, 3).map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {post.user?.full_name || post.user?.username || post.user?.email || '알 수 없음'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.user?.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              {post.type === 'video' ? (
                                <>
                                  <Video className="h-3 w-3" />
                                  영상
                                </>
                              ) : post.type === 'image' ? (
                                <>
                                  <Image className="h-3 w-3" />
                                  사진
                                </>
                              ) : (
                                <>
                                  <FileText className="h-3 w-3" />
                                  글
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>👍 {post.likes_count}</div>
                              <div>💬 {post.comments_count}</div>
                              <div>📤 {post.shares_count}</div>
                            </div>
                          </TableCell>
                          <TableCell>{formatKoreanDate(post.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePost(post.id, post.title)}
                                disabled={deletingPostId === post.id}
                              >
                                {deletingPostId === post.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    삭제
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

