'use client';
import {
  BrainCircuit,
  Focus,
  Kanban,
  LayoutDashboard,
  LogOut,
  NotebookText,
  Settings,
  User,
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

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/focus', icon: Focus, label: 'Focus' },
  { href: '/dashboard/planner', icon: Kanban, label: 'Planner' },
  { href: '/dashboard/notes', icon: NotebookText, label: 'Notes Hub' },
  { href: '/dashboard/collab', icon: Users, label: 'Collab Space' },
  { href: '/dashboard/mentor', icon: BrainCircuit, label: 'AI Mentor' },
];

const bottomNavItems = [
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function StudentSidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { href: string; icon: React.ElementType; label: string }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Tooltip key={item.label}>
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
          {mainNavItems.map(renderNavItem)}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          {bottomNavItems.map(renderNavItem)}
        </nav>
      </TooltipProvider>
    </aside>
  );
}
