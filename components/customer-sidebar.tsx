'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Bell,
  User,
  Settings,
  LogOut,
  ShoppingBasket,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders/new', label: 'New Order', icon: PlusCircle },
  { href: '/dashboard/orders', label: 'My Orders', icon: Package },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        const badge = item.href === '/dashboard/notifications' ? unreadCount : undefined;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {badge !== undefined && badge > 0 && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  active
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

function SidebarContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const fullName = user?.fullName || 'Ama Owusu';
  const email = user?.email || 'ama.owusu@gmail.com';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AO';

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-2 py-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShoppingBasket className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-bold">Peniel Nexus</span>
      </Link>

      <div className="mt-8 flex-1">
        <NavLinks />
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function CustomerSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const pageTitle = navItems.find((n) => n.href === pathname)?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background p-4 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <div className="lg:hidden">
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-lg">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBasket className="h-4 w-4" />
              </div>
              <span className="font-display font-bold">Peniel Nexus</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <SheetContent side="left" className="w-72 p-4">
          <SheetClose asChild className="absolute right-4 top-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Desktop top bar */}
        <div className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-lg lg:flex">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link href="/dashboard/orders/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Order
              </Link>
            </Button>
          </div>
        </div>

        <main className="p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav role="customer" />
    </div>
  );
}
