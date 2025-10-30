'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark,
  Plus,
  Filter,
  Search,
  User,
  Calendar,
  Eye
} from 'lucide-react';

const posts = [
  {
    id: 1,
    title: 'FC서울 vs 수원 삼성 경기 하이라이트',
    author: '축구팬123',
    content: '오늘 경기 정말 재밌었네요! 김민수 선수의 골이 특히 인상적이었습니다.',
    likes: 24,
    comments: 8,
    views: 156,
    date: '2024-01-15',
    category: '하이라이트',
    image: '/api/placeholder/400/200'
  },
  {
    id: 2,
    title: 'K리그 2024 시즌 전망',
    author: '리그분석가',
    content: '올해 시즌은 정말 치열할 것 같습니다. 특히 상위권 경쟁이 눈에 띄네요.',
    likes: 18,
    comments: 12,
    views: 89,
    date: '2024-01-14',
    category: '분석',
    image: null
  },
  {
    id: 3,
    title: '전술 분석: 4-3-3 포메이션의 장단점',
    author: '전술가',
    content: '4-3-3 포메이션의 공격적 측면과 수비적 약점에 대해 분석해보겠습니다.',
    likes: 31,
    comments: 15,
    views: 203,
    date: '2024-01-13',
    category: '전술',
    image: '/api/placeholder/400/200'
  },
  {
    id: 4,
    title: '선수 이적 소식 모음',
    author: '이적뉴스',
    content: '겨울 이적시장에서 주목할 만한 이적 소식들을 정리했습니다.',
    likes: 12,
    comments: 6,
    views: 67,
    date: '2024-01-12',
    category: '뉴스',
    image: null
  }
];

export default function CommunityPostsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">커뮤니티 포스트</h1>
            <p className="text-gray-600 dark:text-gray-300">축구 팬들과 소통하고 정보를 공유하세요</p>
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
              글쓰기
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 포스트</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+23 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">이번 달</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 좋아요</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,678</div>
              <p className="text-xs text-muted-foreground">+156 이번 주</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 댓글</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,890</div>
              <p className="text-xs text-muted-foreground">+89 이번 주</p>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="default" className="cursor-pointer">전체</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">하이라이트</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">분석</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">전술</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">뉴스</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-accent">토론</Badge>
        </div>

        {/* 포스트 목록 */}
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  {/* 이미지 */}
                  {post.image && (
                    <div className="flex-shrink-0">
                      <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Eye className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                  
                  {/* 콘텐츠 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {post.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                          <Badge variant="secondary" className="ml-2">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Heart className="w-4 h-4 mr-1" />
                          좋아요
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          댓글
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="w-4 h-4 mr-1" />
                          공유
                        </Button>
                        <Button size="sm" variant="outline">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
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
