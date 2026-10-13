'use client';

import Link from 'next/link';
import {
  ClipboardList,
  Bike,
  Wallet,
  Star,
  ArrowRight,
  Package,
  Clock,
  MapPin,
  Navigation,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRiderOrders } from '@/hooks/use-rider-orders';
import { useAuth } from '@/components/auth-provider';
import { formatGHS, parseGPS } from '@/lib/format';
import { DeliveryMap } from '@/components/delivery-map';
import { cn } from '@/lib/utils';

export default function RiderDashboardPage() {
  const { user } = useAuth();
  const { availableOrders, activeOrders, loading, earnings } = useRiderOrders();

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const activeDeliveries = activeOrders.filter((o) => o.status === 'out_for_delivery');

  const stats = [
    { label: 'Pickup Queue', value: availableOrders.length.toString(), icon: ClipboardList, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Active Deliveries', value: activeDeliveries.length.toString(), icon: Bike, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
    { label: "Today's Earnings", value: formatGHS(earnings.today), icon: Wallet, color: 'text-primary bg-primary/10' },
    { label: 'Rating', value: '4.9', icon: Star, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  ];

  return (
    <FieldStaffSidebar role="rider">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have {availableOrders.length} orders ready for pickup and {activeDeliveries.length} active delivery.
          </p>
        </div>

        {/* Stats */}
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

        {/* Pickup queue */}
        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Pickup Queue</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rider/available">
                View all
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : availableOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders ready for pickup.</p>
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
                      {order.customerName} · {order.items.length} items
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.deliveryAddress.split(',')[0]}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.preferredTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                    <p className="font-semibold">{formatGHS(order.deliveryFee)}</p>
                    <Button size="sm" asChild>
                      <Link href="/rider/available">Pick Up</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Active delivery */}
        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Active Delivery</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/rider/active">
                View
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeDeliveries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No active deliveries right now.</p>
            ) : (
              activeDeliveries.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                    <Navigation className="h-5 w-5 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {order.customerName} · {order.deliveryAddress}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/rider/active">View Details</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Live delivery map */}
        {activeDeliveries.length > 0 && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Navigation className="h-4 w-4 animate-pulse text-cyan-600" />
                Live Delivery Map
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {activeDeliveries[0].orderNumber} — {activeDeliveries[0].deliveryAddress}
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <DeliveryMap
                  destination={parseGPS(activeDeliveries[0].gpsLocation)}
                  destinationLabel={activeDeliveries[0].deliveryAddress}
                  riderPosition={[5.56, -0.1]}
                  height={320}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FieldStaffSidebar>
  );
}
