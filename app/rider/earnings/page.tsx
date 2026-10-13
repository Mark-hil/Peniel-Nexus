'use client';

import {
  Wallet,
  TrendingUp,
  Bike,
  Star,
  Download,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useRiderOrders } from '@/hooks/use-rider-orders';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControl } from '@/components/ui/pagination-control';
import { formatGHS } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function RiderEarningsPage() {
  const { activeOrders, loading, earnings } = useRiderOrders();

  const completed = activeOrders.filter((o) => o.status === 'delivered');
  const pagination = usePagination({
    items: completed,
    initialPageSize: 5,
  });
  const todayEarnings = earnings.today;
  const weekEarnings = earnings.week;
  const monthEarnings = completed.reduce((s, o) => s + o.deliveryFee, 0);
  const pendingPayout = completed.filter((o) => o.paymentStatus === 'pending').reduce((s, o) => s + o.deliveryFee, 0);

  const weeklyData = [
    { day: 'Mon', amount: Math.round(todayEarnings * 0.15) },
    { day: 'Tue', amount: Math.round(todayEarnings * 0.25) },
    { day: 'Wed', amount: Math.round(todayEarnings * 0.2) },
    { day: 'Thu', amount: Math.round(weekEarnings * 0.3) },
    { day: 'Fri', amount: Math.round(weekEarnings * 0.25) },
    { day: 'Sat', amount: Math.round(weekEarnings * 0.2) },
    { day: 'Sun', amount: Math.round(todayEarnings * 0.1) },
  ];

  const stats = [
    { label: 'Today', value: formatGHS(todayEarnings), icon: Wallet, color: 'text-primary bg-primary/10' },
    { label: 'This Week', value: formatGHS(weekEarnings), icon: TrendingUp, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'This Month', value: formatGHS(monthEarnings), icon: Bike, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
    { label: 'Pending Payout', value: formatGHS(pendingPayout), icon: ArrowUpRight, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  ];

  return (
    <FieldStaffSidebar role="rider">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Earnings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your delivery earnings and payout history.
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Statement
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className="border-border/60">
                  <CardContent className="p-5">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Weekly Earnings</CardTitle>
            <p className="text-sm text-muted-foreground">Your daily delivery earnings this week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="riderEarn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(v: number) => [formatGHS(v), 'Earnings']}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#riderEarn)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  Total Deliveries
                </span>
                <span className="font-semibold">{earnings.totalDeliveries}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  Rating
                </span>
                <span className="font-semibold">4.9 / 5</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Recent Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {completed.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No completed deliveries yet.</p>
              ) : (
                <>
                  {pagination.data.map((p, i) => (
                    <div key={p.id}>
                      {i > 0 && <Separator className="my-1" />}
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium">{p.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{p.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatGHS(p.deliveryFee)}</p>
                          <span className="text-xs font-medium text-success">Paid</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  <PaginationControl
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    pageSizeOptions={[5, 10, 20]}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={pagination.setPageSize}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    itemLabel="completed deliveries"
                    showPageSize={pagination.totalItems > 5}
                    className="pt-2"
                  />
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </FieldStaffSidebar>
  );
}
