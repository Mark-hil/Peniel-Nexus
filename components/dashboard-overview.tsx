'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  CheckCircle2,
  Wallet,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders } from '@/hooks/use-orders';
import { useAuth } from '@/components/auth-provider';
import { formatGHS } from '@/lib/format';
import { cn } from '@/lib/utils';

export function DashboardOverview() {
  const { user } = useAuth();
  const { orders, loading } = useOrders();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled',
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: 'Total Orders', value: totalOrders.toString(), icon: Package, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Pending Orders', value: pendingOrders.toString(), icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Delivered Orders', value: deliveredOrders.toString(), icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
    { label: 'Money Spent', value: formatGHS(totalSpent), icon: Wallet, color: 'text-primary bg-primary/10' },
  ];

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your orders today.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Order
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/60">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Quick actions */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Create New Order', href: '/dashboard/orders/new', icon: PlusCircle, desc: 'Start a fresh shopping list' },
            { label: 'Track Order', href: '/dashboard/orders', icon: Package, desc: 'Follow your active orders' },
            { label: 'View History', href: '/dashboard/orders', icon: ArrowUpRight, desc: 'See past deliveries' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/orders">
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Package className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium">No orders yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create your first order to get started.</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/dashboard/orders/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Order
                </Link>
              </Button>
            </div>
          ) : (
            orders.slice(0, 4).map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center gap-4 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.items.length} items · {order.preferredTime}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{formatGHS(order.total)}</p>
                  <p className="text-xs text-muted-foreground">{order.paymentStatus}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
