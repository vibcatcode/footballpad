'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BarChart3, 
  Trophy, 
  Users, 
  MessageSquare, 
  Play, 
  Target,
  Plus,
  Star,
  TrendingUp,
  Award,
  Clock,
  Zap,
  Settings,
  FileText
} from 'lucide-react';

const features = [
  {
    title: '리그 관리',
    description: '리그를 생성하고 시즌, 경기 주기, 참가 팀을 체계적으로 관리하세요',
    icon: Trophy,
    href: '/leagues',
    color: 'bg-green-500',
    stats: '50+ 리그'
  },
  {
    title: '경기 관리',
    description: '경기 일정 생성부터 결과 입력, 영상 업로드까지 모든 것을 관리하세요',
    icon: Calendar,
    href: '/matches',
    color: 'bg-blue-500',
    stats: '1,200+ 경기'
  },
  {
    title: '팀 관리',
    description: '팀 생성, 팀원 관리, 선수 등록 및 팀 대시보드를 제공합니다',
    icon: Users,
    href: '/teams',
    color: 'bg-purple-500',
    stats: '200+ 팀'
  },
  {
    title: '전술보드',
    description: 'TacticalPad 스타일의 전술 보드로 포메이션과 전술을 시뮬레이션하세요',
    icon: BarChart3,
    href: '/tactics',
    color: 'bg-orange-500',
    stats: '100+ 전술'
  },
  {
    title: '통계 리포트',
    description: 'WhoScored 스타일의 상세한 통계와 리포트를 자동 생성합니다',
    icon: FileText,
    href: '/reports',
    color: 'bg-red-500',
    stats: '500+ 리포트'
  },
  {
    title: '커뮤니티',
    description: '하이라이트 피드, 포스트, 토론으로 축구 커뮤니티를 즐기세요',
    icon: MessageSquare,
    href: '/community',
    color: 'bg-yellow-500',
    stats: '1,000+ 포스트'
  }
];

const stats = [
  { label: '활성 리그', value: '50+', icon: Trophy },
  { label: '기록된 경기', value: '1,200+', icon: Calendar },
  { label: '등록된 팀', value: '200+', icon: Users },
  { label: '생성된 리포트', value: '500+', icon: FileText }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 dark:from-green-600/20 dark:to-blue-600/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-700 via-blue-700 to-green-900 bg-clip-text text-transparent">
              FootballPad
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              리그 관리, 경기 기록, 팀 관리, 전술 분석까지<br />
              <span className="font-semibold text-gray-900 dark:text-white">축구 리그 관리의 모든 것</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/leagues/create">
                  <Plus className="w-5 h-5 mr-2" />
                  리그 만들기
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                <Link href="/leagues">
                  <Trophy className="w-5 h-5 mr-2" />
                  리그 둘러보기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">축구 리그 관리의 모든 것</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              리그 생성부터 경기 관리, 팀 운영, 전술 분석까지 축구 리그에 필요한 모든 기능을 제공합니다
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{feature.stats}</Badge>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link href={feature.href}>
                      자세히 보기
                      <TrendingUp className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">지금 시작하세요</h2>
          <p className="text-xl mb-8 opacity-90">
            첫 번째 축구 리그를 만들고 체계적으로 관리해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link href="/leagues/create">
                <Plus className="w-5 h-5 mr-2" />
                리그 만들기
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-green-600">
              <Link href="/teams/create">
                <Users className="w-5 h-5 mr-2" />
                팀 등록하기
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}