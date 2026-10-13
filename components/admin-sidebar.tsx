'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Bike,
  CreditCard,
  BarChart3,
  Settings,
  ShoppingBasket,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package, badge: 7 },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/shoppers', label: 'Shoppers', icon: ShoppingCart },
  { href: '/admin/riders', label: 'Riders', icon: Bike },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
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
            {item.badge && (
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                  active
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-primary text-primary-foreground'
                )}
              >
                {item.badge}
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
import { env } from '@/lib/config';

function SidebarContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const fullName = user?.fullName || 'Admin User';
  const email = user?.email || env.demoAdminEmail;
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AD';

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShoppingBasket className="h-5 w-5" />
        </div>
        <div>
          <span className="font-display text-lg font-bold leading-none">Peniel Nexus</span>
          <span className="block text-xs text-muted-foreground">Admin Console</span>
        </div>
      </Link>

      <div className="mt-8 flex-1">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Management
        </p>
        <NavLinks />
      </div>

      <div className="mt-auto space-y-3">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200" />
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

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

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
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBasket className="h-4 w-4" />
              </div>
              <span className="font-display font-bold">Admin</span>
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
        <div className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-lg lg:flex">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search orders, customers..." className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Button>
          </div>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
