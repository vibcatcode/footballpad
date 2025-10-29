'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Search,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Play,
  Image as ImageIcon,
  Video,
  TrendingUp,
  Filter
} from 'lucide-react';

const mockPosts = [
  {
    id: 'post1',
    title: '믿음 vs 소망 경기 하이라이트',
    content: '오늘 경기에서 김민수 선수의 환상적인 골을 보여드립니다!',
    author: '축구팬123',
    team: '믿음',
    type: 'video',
    thumbnail: 'https://via.placeholder.com/300x200',
    likes: 24,
    comments: 8,
    shares: 3,
    createdAt: '2025-01-15',
    tags: ['하이라이트', '골', '믿음']
  },
  {
    id: 'post2',
    title: '호산나 프리미어리그 2025 시즌 개막!',
    content: '드디어 새로운 시즌이 시작되었습니다. 모든 팀의 화이팅을 응원합니다!',
    author: '리그관리자',
    team: '전체',
    type: 'text',
    likes: 45,
    comments: 12,
    shares: 7,
    createdAt: '2025-01-10',
    tags: ['시즌개막', '응원', '전체']
  },
  {
    id: 'post3',
    title: '사랑팀 새로운 유니폼 공개',
    content: '사랑팀의 새로운 시즌 유니폼을 공개합니다. 어떤가요?',
    author: '사랑팀매니저',
    team: '사랑',
    type: 'image',
    thumbnail: 'https://via.placeholder.com/300x200',
    likes: 18,
    comments: 5,
    shares: 2,
    createdAt: '2025-01-12',
    tags: ['유니폼', '사랑', '새시즌']
  }
];

const postTypes = [
  { id: 'all', label: '전체', icon: MessageSquare },
  { id: 'video', label: '영상', icon: Video },
  { id: 'image', label: '사진', icon: ImageIcon },
  { id: 'text', label: '글', icon: MessageSquare }
];

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || post.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">커뮤니티</h1>
            <p className="text-muted-foreground">
              경기 하이라이트와 소식을 공유하세요
            </p>
          </div>
          <Button size="lg" asChild className="mt-4 sm:mt-0">
            <Link href="/community/create">
              <Plus className="w-5 h-5 mr-2" />
              포스트 작성
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="제목, 내용, 작성자로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {postTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {post.author} • {post.team}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {post.type === 'video' ? '영상' : post.type === 'image' ? '사진' : '글'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Thumbnail */}
                  {(post.type === 'video' || post.type === 'image') && (
                    <div className="relative mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{post.createdAt}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild className="flex-1">
                      <Link href={`/community/${post.id}`}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        댓글 보기
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4" />
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
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">포스트가 없습니다</h3>
              <p className="text-muted-foreground mb-6">
                첫 번째 포스트를 작성해보세요!
              </p>
              <Button asChild>
                <Link href="/community/create">
                  <Plus className="w-4 h-4 mr-2" />
                  포스트 작성
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Trending Topics */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            인기 주제
          </h2>
          <div className="flex flex-wrap gap-2">
            {['#하이라이트', '#골', '#믿음팀', '#소망팀', '#사랑팀', '#시즌개막', '#유니폼', '#응원'].map((topic) => (
              <Badge key={topic} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
