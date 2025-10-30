'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  Filter,
  Search,
  User,
  Calendar,
  Reply
} from 'lucide-react';

const discussions = [
  {
    id: 1,
    title: 'K리그 2024 시즌 우승 후보는?',
    author: '축구분석가',
    content: '올해 시즌 우승 후보에 대해 의견을 나눠보세요. FC서울, 수원 삼성, 전북 현대 중 어디가 유력할까요?',
    replies: 24,
    views: 156,
    lastReply: '2024-01-15 14:30',
    category: '일반',
    isPinned: true,
    isHot: true
  },
  {
    id: 2,
    title: '김민수 선수 이적 가능성에 대해',
    author: '팬클럽회장',
    content: '김민수 선수가 해외 진출을 고려하고 있다는 소식이 있습니다. 여러분의 생각은 어떠신가요?',
    replies: 18,
    views: 89,
    lastReply: '2024-01-15 12:15',
    category: '선수',
    isPinned: false,
    isHot: false
  },
  {
    id: 3,
    title: '4-3-3 vs 4-4-2 포메이션 비교',
    author: '전술매니아',
    content: '두 포메이션의 장단점을 비교해보고, 어떤 상황에서 어떤 포메이션이 더 효과적인지 토론해보세요.',
    replies: 31,
    views: 203,
    lastReply: '2024-01-15 10:45',
    category: '전술',
    isPinned: false,
    isHot: true
  },
  {
    id: 4,
    title: 'K리그 규정 개선안 제안',
    author: '리그개선위원',
    content: 'K리그의 규정과 제도에 대한 개선안을 제안하고 의견을 수렴하고자 합니다.',
    replies: 12,
    views: 67,
    lastReply: '2024-01-14 16:20',
    category: '제안',
    isPinned: false,
    isHot: false
  },
  {
    id: 5,
    title: '경기 관람 후기 및 팁 공유',
    author: '관람팬',
    content: '직접 경기를 관람한 후기와 다른 팬들을 위한 팁을 공유해주세요.',
    replies: 8,
    views: 45,
    lastReply: '2024-01-14 14:10',
    category: '후기',
    isPinned: false,
    isHot: false
  }
];

export default function DiscussionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">토론방</h1>
            <p className="text-gray-600 dark:text-gray-300">축구에 대한 다양한 주제로 토론하고 의견을 나누세요</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              새 토론
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 토론</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+5 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 참여자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 댓글</CardTitle>
              <Reply className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+89 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">핫 토론</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">진행 중</p>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="default" className="cursor-pointer">전체</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">일반</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">선수</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">전술</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">제안</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">후기</Badge>
        </div>

        {/* 토론 목록 */}
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* 상태 표시 */}
                  <div className="flex-shrink-0 space-y-2">
                    {discussion.isPinned && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="고정됨" />
                    )}
                    {discussion.isHot && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" title="핫 토론" />
                    )}
                    {!discussion.isPinned && !discussion.isHot && (
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  
                  {/* 콘텐츠 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{discussion.author}</span>
                          <span>•</span>
                          <span>{discussion.lastReply}</span>
                          <Badge variant="secondary" className="ml-2">
                            {discussion.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {discussion.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Reply className="w-4 h-4" />
                          <span>{discussion.replies}개 댓글</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{discussion.views}회 조회</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>마지막 댓글: {discussion.lastReply}</span>
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        참여하기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">이전</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">다음</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
