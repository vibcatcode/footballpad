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
  User
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
    title: '뉴스·전략',
    href: '/blog',
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
        <Link href="/" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">풋볼패드</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.subItems ? (
                  <>
                    <NavigationMenuTrigger className="h-9">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.title}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={subItem.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="text-sm font-medium leading-none">
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
                    <Link
                      href={item.href}
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
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
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 mt-6">
              {navigationItems.map((item) => (
                <div key={item.title}>
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                  {item.subItems && (
                    <div className="ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className="block px-3 py-1 text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t">
                <Button variant="outline" size="sm" asChild className="w-full">
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
