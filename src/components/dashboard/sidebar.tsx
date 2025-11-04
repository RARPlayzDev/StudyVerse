// Version 1.0 Final Push
'use client';
import {
  BrainCircuit,
  Focus,
  LayoutDashboard,
  LogOut,
  NotebookText,
  Settings,
  Users,
  Construction, // Using a placeholder icon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Logo from '../common/logo';
import { useAuth } from '@/firebase';

const mainNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/focus', icon: Focus, label: 'Focus' },
  { href: '/dashboard/planner', icon: Construction, label: 'Planner (Coming Soon)' },
  { href: '/dashboard/notes', icon: NotebookText, label: 'Notes Hub' },
  { href: '/dashboard/collab', icon: Users, label: 'Collab Space' },
  { href: '/dashboard/mentor', icon: BrainCircuit, label: 'AI Mentor' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];


export default function StudentSidebar() {
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
        <div className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
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
        </div>
      </TooltipProvider>
    </aside>
  );
}
