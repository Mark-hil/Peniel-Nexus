'use client';

import * as React from 'react';
import { Search, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControl } from '@/components/ui/pagination-control';
import { supabase } from '@/lib/supabase';
import { formatGHS, formatDate } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
}

export function AdminCustomers() {
  const { orders, loading } = useAdminData();
  const [query, setQuery] = React.useState('');
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [loadingCustomers, setLoadingCustomers] = React.useState(true);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      const orderCountMap = new Map<string, { count: number; spent: number }>();
      orders.forEach((o) => {
        const existing = orderCountMap.get(o.userId) ?? { count: 0, spent: 0 };
        orderCountMap.set(o.userId, {
          count: existing.count + 1,
          spent: existing.spent + (o.paymentStatus === 'paid' ? o.total : 0),
        });
      });

      const rows: CustomerRow[] = (profiles ?? []).map((p) => {
        const stats = orderCountMap.get(p.id as string) ?? { count: 0, spent: 0 };
        return {
          id: p.id as string,
          name: (p.full_name as string) || 'Unknown',
          email: '',
          phone: (p.phone as string) || '',
          totalOrders: stats.count,
          totalSpent: stats.spent,
          joinedAt: (p.created_at as string) || '',
        };
      });

      setCustomers(rows);
      setLoadingCustomers(false);
    };

    if (!loading) {
      fetchCustomers();
    }
  }, [orders, loading]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.toLowerCase().includes(query.toLowerCase()),
  );

  const pagination = usePagination({
    items: filtered,
    initialPageSize: 10,
  });

  const isLoading = loading || loadingCustomers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage customer accounts and view their order history.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No customers found</h3>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="hidden lg:table-cell">Orders</TableHead>
                  <TableHead className="hidden lg:table-cell">Total Spent</TableHead>
                  <TableHead className="hidden sm:table-cell">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.data.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{c.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{c.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{c.phone || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell">{c.totalOrders}</TableCell>
                    <TableCell className="hidden font-medium lg:table-cell">{formatGHS(c.totalSpent)}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {c.joinedAt ? formatDate(c.joinedAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filtered.length > 0 && (
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
              itemLabel="customers"
              showPageSize
              className="px-4 py-3"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

