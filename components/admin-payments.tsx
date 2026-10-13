'use client';

import * as React from 'react';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PaymentStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminData } from '@/hooks/use-admin-data';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControl } from '@/components/ui/pagination-control';
import { formatGHS, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PaymentStatus } from '@/types';

const filters: { label: string; value: PaymentStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Refunded', value: 'refunded' },
];

export function AdminPayments() {
  const { orders, loading } = useAdminData();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<PaymentStatus | 'all'>('all');

  const totalRevenue = orders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingAmount = orders.filter((o) => o.paymentStatus === 'pending').reduce((s, o) => s + o.total, 0);
  const refundedAmount = orders.filter((o) => o.paymentStatus === 'refunded').reduce((s, o) => s + o.total, 0);

  const stats = [
    { label: 'Total Revenue', value: formatGHS(totalRevenue), icon: DollarSign, color: 'text-primary bg-primary/10' },
    { label: 'Paid', value: formatGHS(totalRevenue), icon: CheckCircle2, color: 'text-success bg-success/10' },
    { label: 'Pending', value: formatGHS(pendingAmount), icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Refunded', value: formatGHS(refundedAmount), icon: RotateCcw, color: 'text-muted-foreground bg-muted' },
  ];

  const filtered = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || o.paymentStatus === filter;
    return matchesQuery && matchesFilter;
  });

  const pagination = usePagination({
    items: filtered,
    initialPageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track all transactions and payment statuses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
          : stats.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold">{s.value}</p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number or customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden lg:table-cell">Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.data.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{o.customerName}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-sm">
                        <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                        {o.paymentMethod === 'mtn_momo' ? 'MTN MoMo' : o.paymentMethod === 'telecel_cash' ? 'Telecel Cash' : o.paymentMethod === 'airteltigo' ? 'AirtelTigo' : o.paymentMethod === 'visa' ? 'Visa' : o.paymentMethod === 'mastercard' ? 'Mastercard' : 'Cash'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={o.paymentStatus} />
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(o.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatGHS(o.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filtered.length > 0 && (
            <PaginationControl
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              itemLabel="transactions"
              showPageSize
              className="px-4 py-3"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

