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

const navigationItems = [
  {
    title: '홈',
    href: '/',
    icon: Home
  },
  {
    title: '팀 운영',
    href: '/team',
    icon: Users,
    subItems: [
      { title: '팀 대시보드', href: '/team/dashboard' },
      { title: '캘린더', href: '/team/calendar' },
      { title: '출석 체크', href: '/team/attendance' },
      { title: '회비/정산', href: '/team/billing' }
    ]
  },
  {
    title: '경기',
    href: '/matches',
    icon: Calendar,
    subItems: [
      { title: '경기 일정', href: '/matches/schedule' },
      { title: '경기 기록 입력', href: '/matches/record' },
      { title: '라인업 & 포메이션', href: '/matches/lineup' },
      { title: '매치 리포트', href: '/matches/reports' }
    ]
  },
  {
    title: '선수·스쿼드',
    href: '/players',
    icon: User,
    subItems: [
      { title: '선수 명단', href: '/players/roster' },
      { title: '스쿼드 매트릭스', href: '/players/squad' },
      { title: '컨디션 관리', href: '/players/condition' },
      { title: '훈련 이력', href: '/players/training' }
    ]
  },
  {
    title: '기록/통계',
    href: '/stats',
    icon: BarChart3,
    subItems: [
      { title: '팀 기록', href: '/stats/team' },
      { title: '선수 기록', href: '/stats/players' },
      { title: '고급 지표', href: '/stats/advanced' },
      { title: '랭킹 보드', href: '/stats/rankings' }
    ]
  },
  {
    title: '매칭',
    href: '/matchmaking',
    icon: Search,
    subItems: [
      { title: '매칭 찾기', href: '/matchmaking/search' },
      { title: '팀 ELO', href: '/matchmaking/elo' },
      { title: '매칭 요청', href: '/matchmaking/requests' }
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
      { title: '공지/게시판', href: '/community/board' },
      { title: '사진/영상', href: '/community/media' }
    ]
  }
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
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
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="space-x-1">
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.subItems ? (
                  <>
                    <NavigationMenuTrigger className="h-10 min-h-[40px] max-h-[40px] px-4 py-0 text-sm font-medium leading-[1.2] transition-all duration-200 hover:bg-accent/50 rounded-lg">
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="leading-[1.2]">{item.title}</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-2 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                              >
                                <div className="text-sm font-medium leading-none group-hover:translate-x-1 transition-transform duration-200">
                                  {subItem.title}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group inline-flex h-10 min-h-[40px] max-h-[40px] w-max items-center justify-center rounded-lg bg-background px-4 py-0 text-sm font-medium leading-[1.2] transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-105",
                          pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="leading-[1.2]">{item.title}</span>
                        <ExternalLink className="ml-1 h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "group inline-flex h-10 min-h-[40px] max-h-[40px] w-max items-center justify-center rounded-lg bg-background px-4 py-0 text-sm font-medium leading-[1.2] transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 hover:scale-105",
                          pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="leading-[1.2]">{item.title}</span>
                      </Link>
                    )}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* 관리자 링크 */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <Settings className="mr-2 h-4 w-4" />
              관리
            </Link>
          </Button>
        </div>

        {/* 모바일 메뉴 */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-accent/50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-2 mt-6">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                      <ExternalLink className="ml-auto h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
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
              <div className="pt-6 border-t border-border">
                <Button variant="outline" size="sm" asChild className="w-full hover:bg-accent/50">
                  <Link href="/admin">
                    <Settings className="mr-2 h-4 w-4" />
                    관리
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
