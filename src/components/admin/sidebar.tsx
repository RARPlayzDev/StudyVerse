'use client';
import {
  Archive,
  BarChart3,
  FileCog,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Logo from '../common/logo';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/users', icon: Users, label: 'User Management' },
  { href: '/admin/content', icon: Archive, label: 'Content' },
  { href: '/admin/collab', icon: Users, label: 'Collab Rooms' },
  { href: '/admin/reports', icon: BarChart3, label: 'AI Reports' },
];

const bottomNavItems = [
  { href: '#', icon: Settings, label: 'Settings' },
  { href: '/', icon: LogOut, label: 'Logout' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { href: string; icon: React.ElementType; label: string }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:h-9 md:w-9',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{item.label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-16 flex-col border-r border-slate-800/50 bg-slate-900/50 backdrop-blur-md sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Logo textClassName="hidden" />
          {navItems.map(renderNavItem)}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          {bottomNavItems.map(renderNavItem)}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
