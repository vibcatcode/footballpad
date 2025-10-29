'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  BarChart3, 
  Search, 
  Trophy, 
  Users, 
  MessageSquare, 
  Play, 
  Target,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  Clock,
  Zap
} from 'lucide-react';

const features = [
  {
    title: '경기 기록',
    description: '상세한 경기 데이터를 기록하고 분석하세요',
    icon: Calendar,
    href: '/matches',
    color: 'bg-blue-500',
    stats: '1,200+ 경기'
  },
  {
    title: '축구 전술',
    description: '포메이션과 전술을 깊이 있게 분석하세요',
    icon: BarChart3,
    href: '/tactics',
    color: 'bg-green-500',
    stats: '50+ 전술'
  },
  {
    title: '경기 분석',
    description: '데이터 기반의 정확한 경기 분석을 제공합니다',
    icon: Search,
    href: '/analysis',
    color: 'bg-purple-500',
    stats: '500+ 분석'
  },
  {
    title: '기술 훈련',
    description: '체계적인 훈련 프로그램으로 실력을 향상시키세요',
    icon: Trophy,
    href: '/training',
    color: 'bg-orange-500',
    stats: '200+ 훈련법'
  },
  {
    title: '레슨',
    description: '전문가의 레슨으로 축구 실력을 키우세요',
    icon: BookOpen,
    href: '/lessons',
    color: 'bg-red-500',
    stats: '100+ 레슨'
  },
  {
    title: '리뷰',
    description: '장비와 경기에 대한 솔직한 리뷰를 확인하세요',
    icon: Star,
    href: '/reviews',
    color: 'bg-yellow-500',
    stats: '300+ 리뷰'
  }
];

const stats = [
  { label: '활성 사용자', value: '10,000+', icon: Users },
  { label: '기록된 경기', value: '50,000+', icon: Calendar },
  { label: '전술 분석', value: '1,000+', icon: BarChart3 },
  { label: '훈련 프로그램', value: '500+', icon: Trophy }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10 dark:from-blue-600/20 dark:to-green-600/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-blue-800 bg-clip-text text-transparent">
              FootballPad
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              축구 전술, 경기분석, 기술훈련, 레슨, 리뷰를 제공하는<br />
              <span className="font-semibold text-foreground">축구 전문 사이트</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/matches">
                  <Play className="w-5 h-5 mr-2" />
                  경기 기록 시작하기
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="/tactics">
                  <Target className="w-5 h-5 mr-2" />
                  전술 분석 보기
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
            <h2 className="text-4xl font-bold mb-4">축구의 모든 것을 한 곳에서</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              경기 기록부터 전술 분석, 기술 훈련까지 축구에 필요한 모든 도구를 제공합니다
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">지금 시작하세요</h2>
          <p className="text-xl mb-8 opacity-90">
            축구 실력을 향상시키고 더 나은 선수가 되어보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link href="/training">
                <Zap className="w-5 h-5 mr-2" />
                훈련 시작하기
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/lessons">
                <BookOpen className="w-5 h-5 mr-2" />
                레슨 보기
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}