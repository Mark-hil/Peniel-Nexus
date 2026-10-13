'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  Package,
  Bell,
  User,
  ClipboardList,
  ShoppingCart,
  Bike,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';

export type BottomNavRole = 'customer' | 'shopper' | 'rider';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isPrimaryAction?: boolean;
}

const customerNav: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: Package },
  { href: '/dashboard/orders/new', label: 'New', icon: Plus, isPrimaryAction: true },
  { href: '/dashboard/notifications', label: 'Alerts', icon: Bell },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const shopperNav: NavItem[] = [
  { href: '/shopper', label: 'Home', icon: LayoutDashboard },
  { href: '/shopper/available', label: 'Available', icon: ClipboardList },
  { href: '/shopper/active', label: 'Shopping', icon: ShoppingCart },
  { href: '/shopper/earnings', label: 'Earnings', icon: Wallet },
  { href: '/shopper/notifications', label: 'Alerts', icon: Bell },
];

const riderNav: NavItem[] = [
  { href: '/rider', label: 'Home', icon: LayoutDashboard },
  { href: '/rider/available', label: 'Queue', icon: ClipboardList },
  { href: '/rider/active', label: 'Delivery', icon: Bike },
  { href: '/rider/earnings', label: 'Earnings', icon: Wallet },
  { href: '/rider/notifications', label: 'Alerts', icon: Bell },
];

export function MobileBottomNav({ role = 'customer' }: { role?: BottomNavRole }) {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const items = role === 'shopper' ? shopperNav : role === 'rider' ? riderNav : customerNav;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block border-t border-border/70 bg-background/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl transition-all lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard' || item.href === '/shopper' || item.href === '/rider'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const isNotification = item.href.includes('/notifications');

          if (item.isPrimaryAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative -top-3 flex flex-col items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform duration-200 active:scale-95 group-hover:scale-105">
                  <Icon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="mt-1 text-[11px] font-semibold text-primary">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl px-2.5 py-1 transition-all duration-150 active:scale-90',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
