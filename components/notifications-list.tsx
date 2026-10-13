'use client';

import * as React from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingCart,
  Bike,
  Home,
  Check,
  Clock,
  Box,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const iconMap: Partial<Record<Notification['type'], React.ElementType>> = {
  order_received: Package,
  received: Package,
  order_accepted: CheckCircle2,
  accepted: CheckCircle2,
  payment_successful: CreditCard,
  shopper_assigned: ShoppingCart,
  shopping: ShoppingCart,
  packing: Box,
  out_for_delivery: Bike,
  delivered: Home,
  cancelled: XCircle,
};

const colorMap: Partial<Record<Notification['type'], string>> = {
  order_received: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  received: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  order_accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  payment_successful: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  shopper_assigned: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  shopping: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  packing: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  out_for_delivery: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
  delivered: 'bg-primary/10 text-primary',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
};

export function NotificationsList() {
  const { notifications, loading, unreadCount, markAllRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.` : 'You\'re all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                You&apos;ll see updates about your orders here.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = iconMap[n.type] ?? Bell;
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-4 rounded-xl p-4 transition-colors',
                    !n.read && 'bg-primary/5',
                  )}
                >
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', colorMap[n.type] ?? 'bg-muted text-muted-foreground')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.timestamp}</p>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
