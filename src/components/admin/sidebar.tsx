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
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Admin Panel' },
  { href: '/admin/users', icon: Users, label: 'User Management' },
  { href: '/admin/content', icon: Archive, label: 'Content' },
  { href: '/admin/collab', icon: Users, label: 'Collab Rooms' },
  { href: '/admin/reports', icon: BarChart3, label: 'AI Reports' },
];

const bottomNavItems = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
      await auth.signOut();
      router.push('/login');
  }

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
           <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:h-9 md:w-9',
                  'text-muted-foreground hover:text-foreground'
                )}
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
