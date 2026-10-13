'use client';

import Link from 'next/link';
import {
  ClipboardList,
  ShoppingCart,
  Wallet,
  Star,
  ArrowRight,
  Package,
  Clock,
  MapPin,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopperOrders } from '@/hooks/use-shopper-orders';
import { useAuth } from '@/components/auth-provider';
import { formatGHS } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function ShopperDashboardPage() {
  const { user } = useAuth();
  const { availableOrders, activeOrders, loading, earnings } = useShopperOrders();

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const activeShopping = activeOrders.filter((o) => o.status === 'accepted' || o.status === 'shopping' || o.status === 'packing');

  const stats = [
    { label: 'Available Orders', value: availableOrders.length.toString(), icon: ClipboardList, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Active Shopping', value: activeShopping.length.toString(), icon: ShoppingCart, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { label: "Today's Earnings", value: formatGHS(earnings.today), icon: Wallet, color: 'text-primary bg-primary/10' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  return (
    <FieldStaffSidebar role="shopper">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have {availableOrders.length} orders waiting to be shopped and {activeShopping.length} in progress.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            : stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/60">
                  <CardContent className="p-5">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', stat.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold">{stat.value}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Available Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/shopper/available">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : availableOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders available right now.</p>
            ) : (
              availableOrders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {order.items.map((i) => i.name).join(', ')}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.deliveryAddress.split(',')[0]}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.preferredTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="font-semibold">{formatGHS(order.shoppingBudget)}</p>
                    <Button size="sm" asChild>
                      <Link href="/shopper/available">Accept</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Active Shopping</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/shopper/active">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeShopping.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No active shopping right now.</p>
            ) : (
              activeShopping.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {order.items.length} items · {order.customerName}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/shopper/active">
                      {order.status === 'shopping' ? 'Mark Packed' : 'Ready for Pickup'}
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </FieldStaffSidebar>
  );
}
