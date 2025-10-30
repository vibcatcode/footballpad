'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="h-9 w-9 px-0 hover:bg-accent/50"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground" />
        <span className="sr-only">테마 전환</span>
      </Button>
    </div>
  );
}

export function ThemeToggleMobile() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-end px-4 py-3 border-b">
      <div className="flex items-center space-x-2">
        <Button
          variant={theme === 'light' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setTheme('light')}
          className="h-9 w-9"
        >
          <Sun className="h-4 w-4 text-foreground" />
          <span className="sr-only">라이트</span>
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setTheme('dark')}
          className="h-9 w-9"
        >
          <Moon className="h-4 w-4 text-foreground" />
          <span className="sr-only">다크</span>
        </Button>
        <Button
          variant={theme === 'system' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setTheme('system')}
          className="h-9 w-9"
        >
          <Monitor className="h-4 w-4 text-foreground" />
          <span className="sr-only">시스템</span>
        </Button>
      </div>
    </div>
  );
}
