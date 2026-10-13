'use client';

import Link from 'next/link';
import {
  Package,
  Clock,
  DollarSign,
  Users,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Bike,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OrderStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminData } from '@/hooks/use-admin-data';
import { formatGHS } from '@/lib/format';
import { cn } from '@/lib/utils';

export function AdminDashboardHome() {
  const { orders, stats, loading } = useAdminData();

  const todayCount = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const pendingCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled',
  ).length;

  const displayStats = [
    { label: 'Orders Today', value: todayCount.toString(), icon: Package, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Pending Orders', value: pendingCount.toString(), icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Total Revenue', value: stats ? formatGHS(stats.totalRevenue) : '—', icon: DollarSign, color: 'text-primary bg-primary/10' },
    { label: 'Customers', value: stats ? stats.totalCustomers.toString() : '—', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  ];

  const weeklyData = [
    { day: 'Mon', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 1).length },
    { day: 'Tue', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 2).length },
    { day: 'Wed', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 3).length },
    { day: 'Thu', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 4).length },
    { day: 'Fri', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 5).length },
    { day: 'Sat', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 6).length },
    { day: 'Sun', orders: orders.filter((o) => new Date(o.createdAt).getDay() === 0).length },
  ];

  const itemMap = new Map<string, number>();
  orders.forEach((o) => {
    o.items.forEach((item) => {
      itemMap.set(item.name, (itemMap.get(item.name) ?? 0) + 1);
    });
  });
  const popularItems = Array.from(itemMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of your business performance today.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/orders">
            View All Orders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : displayStats.map((stat) => {
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Orders This Week</CardTitle>
            <p className="text-sm text-muted-foreground">Daily order count</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
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
                />
                <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {popularItems.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No items ordered yet.</p>
            ) : (
              popularItems.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{count} orders</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              View all
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 6).map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.customerName}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatGHS(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
