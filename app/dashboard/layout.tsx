'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Trophy,
  Calendar,
  Users,
  User as UserIcon,
  BarChart3,
  TrendingUp,
  Home,
} from 'lucide-react';

const sidebarMenuItems = [
  {
    title: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '내 리그',
    href: '/dashboard/my-leagues',
    icon: Trophy,
    subItems: [
      { title: '내 리그 목록', href: '/dashboard/my-leagues' },
      { title: '리그 생성', href: '/leagues/create' },
    ],
  },
  {
    title: '내 경기',
    href: '/dashboard/my-matches',
    icon: Calendar,
    subItems: [
      { title: '내 경기 일정', href: '/dashboard/my-matches' },
      { title: '내 경기 결과', href: '/dashboard/my-matches?tab=results' },
      { title: '내 경기 분석', href: '/dashboard/my-matches?tab=analysis' },
    ],
  },
  {
    title: '내 팀',
    href: '/dashboard/my-teams',
    icon: Users,
    subItems: [
      { title: '내 팀 목록', href: '/dashboard/my-teams' },
      { title: '팀 생성', href: '/teams/create' },
      { title: '팀 관리', href: '/teams/manage' },
    ],
  },
  {
    title: '내 선수',
    href: '/dashboard/my-players',
    icon: UserIcon,
    subItems: [
      { title: '내 선수 목록', href: '/dashboard/my-players' },
      { title: '선수 등록', href: '/players/create' },
      { title: '선수 관리', href: '/players/manage' },
    ],
  },
  {
    title: '내 전술',
    href: '/dashboard/my-tactics',
    icon: BarChart3,
    subItems: [
      { title: '내 전술보드', href: '/dashboard/my-tactics' },
      { title: '라인업 빌더', href: '/lineup-builder' },
      { title: '전술 분석', href: '/dashboard/my-tactics?tab=analysis' },
    ],
  },
  {
    title: '내 통계',
    href: '/dashboard/my-reports',
    icon: TrendingUp,
    subItems: [
      { title: '내 리그 순위', href: '/dashboard/my-reports?tab=standings' },
      { title: '내 선수 랭킹', href: '/dashboard/my-reports?tab=rankings' },
      { title: '내 경기 리포트', href: '/dashboard/my-reports' },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex">
        {/* 왼쪽 사이드바 - 내 관리 메뉴 */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-background border-r border-border sticky top-0">
          <div className="p-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">내 관리</span>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              내가 만든 리그, 팀, 선수, 경기 등을 관리합니다
            </p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => {
                const subPath = sub.href.split('?')[0];
                return pathname === subPath || pathname.startsWith(subPath + '/');
              }));
              
              return (
                <div key={item.title} className="space-y-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                  {item.subItems && isActive && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const subPath = subItem.href.split('?')[0];
                        const isSubActive = pathname === subPath || pathname.startsWith(subPath + '/');
                        return (
                          <Link
                            key={subItem.title}
                            href={subItem.href}
                            className={cn(
                              "flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors",
                              isSubActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                          >
                            <span className="w-2 h-2 rounded-full bg-current opacity-50" />
                            <span>{subItem.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>홈으로</span>
            </Link>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

