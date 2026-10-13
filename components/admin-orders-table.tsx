'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Package,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminData } from '@/hooks/use-admin-data';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControl } from '@/components/ui/pagination-control';
import { supabase } from '@/lib/supabase';
import { formatGHS, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusFilters: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Received', value: 'received' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Packing', value: 'packing' },
  { label: 'Out for Delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function AdminOrdersTable() {
  const { orders, loading, refresh } = useAdminData();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<OrderStatus | 'all'>('all');
  const [cancelOrderId, setCancelOrderId] = React.useState<string | null>(null);
  const [cancelling, setCancelling] = React.useState(false);

  const cancellableStatuses: OrderStatus[] = ['received', 'accepted', 'shopping', 'packing'];

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    setCancelling(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'refunded' })
      .eq('id', cancelOrderId);
    setCancelling(false);
    if (error) {
      toast.error('Could not cancel order. Please try again.');
    } else {
      const orderNum = orders.find((o) => o.id === cancelOrderId)?.orderNumber ?? '';
      toast.success('Order cancelled', {
        description: `${orderNum} has been cancelled and marked for refund.`,
      });
      refresh();
    }
    setCancelOrderId(null);
  };

  const filtered = orders.filter((o) => {
    const matchesQuery =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.customerName.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || o.status === filter;
    return matchesQuery && matchesFilter;
  });

  const pagination = usePagination({
    items: filtered,
    initialPageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View, assign, and manage all customer orders.
        </p>
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
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {statusFilters.map((f) => (
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-primary">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.customerName}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatGHS(order.total)}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setCancelOrderId(order.id)}
                              disabled={!cancellableStatuses.includes(order.status)}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
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
              itemLabel="orders"
              showPageSize
              className="px-4 py-3"
            />
          )}
        </CardContent>
      </Card>


      <AlertDialog open={cancelOrderId !== null} onOpenChange={(open) => !open && setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the order and mark the payment for refund. The customer will be notified. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
