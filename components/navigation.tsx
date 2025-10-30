'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu';
import { 
  Menu, 
  Home, 
  Users, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Search, 
  Newspaper, 
  MessageSquare,
  Settings,
  User,
  ExternalLink
} from 'lucide-react';
import { ThemeToggle, ThemeToggleMobile } from '@/components/theme-toggle';

const navigationItems = [
  {
    title: '홈',
    href: '/',
    icon: Home
  },
  {
    title: '리그',
    href: '/leagues',
    icon: Trophy,
    subItems: [
      { title: '리그 목록', href: '/leagues' },
      { title: '리그 생성', href: '/leagues/create' },
      { title: '리그 대시보드', href: '/leagues/dashboard' }
    ]
  },
  {
    title: '경기',
    href: '/matches',
    icon: Calendar,
    subItems: [
      { title: '경기 일정', href: '/matches' },
      { title: '경기 결과', href: '/matches/results' },
      { title: '경기 분석', href: '/matches/analysis' }
    ]
  },
  {
    title: '팀',
    href: '/teams',
    icon: Users,
    subItems: [
      { title: '팀 목록', href: '/teams' },
      { title: '팀 생성', href: '/teams/create' },
      { title: '팀 관리', href: '/teams/manage' }
    ]
  },
  {
    title: '전술',
    href: '/tactics',
    icon: BarChart3,
    subItems: [
      { title: '전술보드', href: '/tactics' },
      { title: '포메이션', href: '/tactics/formations' },
      { title: '전술 분석', href: '/tactics/analysis' }
    ]
  },
  {
    title: '통계',
    href: '/reports',
    icon: Search,
    subItems: [
      { title: '리그 순위', href: '/reports/standings' },
      { title: '선수 랭킹', href: '/reports/rankings' },
      { title: '경기 리포트', href: '/reports/matches' }
    ]
  },
  {
    title: '블로그',
    href: 'https://blog.footballpad.org/',
    icon: Newspaper,
    external: true
  },
  {
    title: '커뮤니티',
    href: '/community',
    icon: MessageSquare,
    subItems: [
      { title: '하이라이트', href: '/community' },
      { title: '포스트', href: '/community/posts' },
      { title: '토론', href: '/community/discussions' }
    ]
  }
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
        {/* 로고 */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <picture>
            <source
              media="(min-resolution: 2dppx), (-webkit-min-device-pixel-ratio: 2)"
              srcSet="/FootballPad-logo@2x.png"
            />
            <img
              src="/FootballPad-logo.png"
              alt="풋볼패드"
              className="h-8 w-auto"
              width={120}
              height={32}
            />
          </picture>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.title} className="relative group">
                {item.subItems ? (
                  <>
                    <button className="flex items-center h-10 px-4 text-sm font-medium text-foreground bg-background rounded-md border border-transparent hover:bg-accent hover:border-border transition-all duration-200">
                      <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </button>
                    {/* 드롭다운 메뉴는 나중에 구현 */}
                  </>
                ) : (
                  item.external ? (
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center h-10 px-4 text-sm font-medium text-foreground bg-background rounded-md border border-transparent hover:bg-accent hover:border-border transition-all duration-200",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center h-10 px-4 text-sm font-medium text-foreground bg-background rounded-md border border-transparent hover:bg-accent hover:border-border transition-all duration-200",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 데스크톱 테마 토글 */}
        <div className="hidden md:flex items-center">
          <ThemeToggle />
        </div>


        {/* 모바일 메뉴 */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-accent text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
            <div className="flex flex-col h-full">
              {/* 테마 토글 섹션 */}
              <ThemeToggleMobile />
              
              {/* 네비게이션 메뉴 */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.title}>
                      {item.external ? (
                        <a
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group text-foreground"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-foreground" />
                          <span className="font-medium text-foreground">{item.title}</span>
                          <ExternalLink className="ml-auto h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity text-foreground" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group text-foreground"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-foreground" />
                          <span className="font-medium text-foreground">{item.title}</span>
                        </Link>
                      )}
                      {item.subItems && (
                        <div className="ml-8 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.title}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/30 rounded-md transition-all duration-200"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
