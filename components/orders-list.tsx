'use client';

import * as React from 'react';
import Link from 'next/link';
import { Package, Search, PlusCircle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge';
import { formatGHS } from '@/lib/format';
import type { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { useOrders } from '@/hooks/use-orders';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControl } from '@/components/ui/pagination-control';
import { Skeleton } from '@/components/ui/skeleton';

const filters: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'out_for_delivery' },
  { label: 'Pending', value: 'received' },
  { label: 'Delivered', value: 'delivered' },
];

export function OrdersList() {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<OrderStatus | 'all'>('all');
  const { orders, loading } = useOrders();

  const filtered = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(query.toLowerCase()));
    const matchesFilter = filter === 'all' || o.status === filter;
    return matchesQuery && matchesFilter;
  });

  const pagination = usePagination({
    items: filtered,
    initialPageSize: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">My Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and manage all your Peniel Nexus orders.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/orders/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number or item..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Package className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search or create a new order.
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/orders/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Order
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {pagination.data.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <Card className="border-border/60 transition-all hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Package className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{order.orderNumber}</p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {order.items.map((i) => i.name).join(', ')}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{order.preferredTime}</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <p className="font-semibold">{formatGHS(order.total)}</p>
                          <PaymentStatusBadge status={order.paymentStatus} className="mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

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
            itemLabel="orders"
            showPageSize
            className="border-t-0 pt-1"
          />
        </div>
      )}
    </div>
  );
}

