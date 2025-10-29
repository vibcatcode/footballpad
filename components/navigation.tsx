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
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity ml-8">
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
          <NavigationMenuList className="space-x-0.5">
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                {item.subItems ? (
                  <>
                    <NavigationMenuTrigger className="h-10 min-h-[40px] max-h-[40px] px-3 py-0 text-sm font-medium leading-[1.2] transition-all duration-200 hover:bg-gray-100 rounded-md bg-white text-gray-700 border border-transparent hover:border-gray-200">
                      <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
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
                        className={cn(
                          "group inline-flex h-10 min-h-[40px] max-h-[40px] w-max items-center justify-center rounded-md bg-white text-gray-700 px-3 py-0 text-sm font-medium leading-[1.2] transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-gray-200",
                          pathname === item.href && "bg-gray-100 text-gray-900"
                        )}
                      >
                        <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        <span className="leading-[1.2]">{item.title}</span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "group inline-flex h-10 min-h-[40px] max-h-[40px] w-max items-center justify-center rounded-md bg-white text-gray-700 px-3 py-0 text-sm font-medium leading-[1.2] transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 border border-transparent hover:border-gray-200",
                          pathname === item.href && "bg-gray-100 text-gray-900"
                        )}
                      >
                        <item.icon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                        <span className="leading-[1.2]">{item.title}</span>
                      </Link>
                    )}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>


        {/* 모바일 메뉴 */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden hover:bg-gray-100 text-gray-700">
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
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
