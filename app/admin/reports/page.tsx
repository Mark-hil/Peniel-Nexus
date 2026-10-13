'use client';

import * as React from 'react';
import {
  DollarSign,
  Package,
  TrendingUp,
  Truck,
  Download,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AdminSidebar } from '@/components/admin-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminData } from '@/hooks/use-admin-data';
import { formatGHS } from '@/lib/format';

export default function AdminReportsPage() {
  const { orders, stats, loading } = useAdminData();

  const monthlyRevenue = React.useMemo(() => {
    const months: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleDateString('en-US', { month: 'short' });
      if (!months[key]) months[key] = { revenue: 0, orders: 0 };
      months[key].revenue += o.paymentStatus === 'paid' ? o.total : 0;
      months[key].orders += 1;
    });
    return Object.entries(months).map(([month, v]) => ({ month, ...v }));
  }, [orders]);

  const itemRevenue = React.useMemo(() => {
    const items: Record<string, { name: string; revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!items[item.name]) items[item.name] = { name: item.name, revenue: 0, orders: 0 };
        items[item.name].revenue += item.budget;
        items[item.name].orders += 1;
      });
    });
    return Object.values(items).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [orders]);

  const deliveryPerf = React.useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const active = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
    return [
      { name: 'Delivered', value: delivered, color: 'hsl(var(--chart-1))' },
      { name: 'In Progress', value: active, color: 'hsl(var(--chart-3))' },
      { name: 'Cancelled', value: cancelled, color: 'hsl(var(--chart-5))' },
    ].filter((d) => d.value > 0);
  }, [orders]);

  const avgOrderValue = stats && stats.totalOrders > 0
    ? stats.totalRevenue / stats.totalOrders
    : 0;

  const summaryStats = [
    { label: 'Total Revenue', value: formatGHS(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'text-primary bg-primary/10' },
    { label: 'Total Orders', value: String(stats?.totalOrders ?? 0), icon: Package, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Avg Order Value', value: formatGHS(avgOrderValue), icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Delivered', value: String(stats?.deliveredOrders ?? 0), icon: Truck, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  ];

  if (loading) {
    return (
      <AdminSidebar>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" />
        </div>
      </AdminSidebar>
    );
  }

  const hasData = orders.length > 0;

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Business performance insights and trends.
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryStats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 font-display text-2xl font-bold">{s.value}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hasData ? (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {monthlyRevenue.length > 0 && (
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Revenue Trend</CardTitle>
                    <p className="text-sm text-muted-foreground">Monthly revenue</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyRevenue}>
                        <defs>
                          <linearGradient id="reportRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.75rem',
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#reportRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {monthlyRevenue.length > 0 && (
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Monthly Sales & Orders</CardTitle>
                    <p className="text-sm text-muted-foreground">Sales volume vs order count</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.75rem',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} name="Revenue (GHS)" />
                        <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} name="Orders" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {itemRevenue.length > 0 && (
                <Card className="border-border/60 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Popular Items by Revenue</CardTitle>
                    <p className="text-sm text-muted-foreground">Top performing items</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={itemRevenue} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={70}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.75rem',
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[0, 6, 6, 0]} name="Revenue (GHS)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {deliveryPerf.length > 0 && (
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">Order Status Breakdown</CardTitle>
                    <p className="text-sm text-muted-foreground">Delivery performance</p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={deliveryPerf}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {deliveryPerf.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.75rem',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.875rem' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <TrendingUp className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No data to display yet</p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Reports will appear once orders start coming in.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminSidebar>
  );
}
