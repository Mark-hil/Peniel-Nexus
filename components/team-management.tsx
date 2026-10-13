'use client';

import * as React from 'react';
import { Search, Star, Bike, UserPlus, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminData, type AdminTeamMember } from '@/hooks/use-admin-data';
import { usePagination } from '@/hooks/use-pagination';
import { PaginationControl } from '@/components/ui/pagination-control';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-success/10 text-success' },
  busy: { label: 'Busy', className: 'bg-amber-500/10 text-amber-600' },
  offline: { label: 'Offline', className: 'bg-muted text-muted-foreground' },
};

function getMemberStatus(activeOrders: number): 'available' | 'busy' | 'offline' {
  if (activeOrders > 0) return 'busy';
  return 'available';
}

export function TeamManagement({
  team,
  role,
  loading,
}: {
  team: AdminTeamMember[];
  role: 'Shopper' | 'Rider';
  loading: boolean;
}) {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'available' | 'busy' | 'offline'>('all');

  const teamWithStatus = team.map((m) => ({
    ...m,
    status: getMemberStatus(m.activeOrders),
  }));

  const filtered = teamWithStatus.filter((m) => {
    const matchesQuery = m.fullName.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || m.status === filter;
    return matchesQuery && matchesFilter;
  });

  const pagination = usePagination({
    items: filtered,
    initialPageSize: 6,
  });

  const RoleIcon = role === 'Shopper' ? ShoppingCart : Bike;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{role}s</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your {role.toLowerCase()} team and assignments.
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add {role}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : (
          [
            { label: 'Total', value: team.length },
            { label: 'Available', value: teamWithStatus.filter((m) => m.status === 'available').length },
            { label: 'Busy', value: teamWithStatus.filter((m) => m.status === 'busy').length },
            { label: 'Offline', value: teamWithStatus.filter((m) => m.status === 'offline').length },
          ].map((s) => (
            <Card key={s.label} className="border-border/60">
              <CardContent className="p-4">
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${role.toLowerCase()}s...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'available', 'busy', 'offline'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <RoleIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No {role.toLowerCase()}s found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {role}s will appear here once they register.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pagination.data.map((m) => {
              const status = statusConfig[m.status];
              return (
                <Card key={m.id} className="border-border/60 transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>{m.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{m.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.phone || 'No phone'}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge variant="secondary" className={status.className}>
                            {status.label}
                          </Badge>
                          {role === 'Rider' && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Bike className="h-3 w-3" />
                              Motorcycle
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-sm font-semibold">{m.activeOrders}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="text-sm font-semibold">—</p>
                        <p className="text-xs text-muted-foreground">Done</p>
                      </div>
                      <div className="rounded-lg bg-muted/40 p-2">
                        <p className="flex items-center justify-center gap-0.5 text-sm font-semibold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          4.9
                        </p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    </div>

                    <Button
                      className="mt-4 w-full"
                      variant={m.status === 'available' ? 'default' : 'outline'}
                      disabled={m.status !== 'available'}
                      onClick={() => toast.info(`${m.fullName} is available for assignment`)}
                    >
                      {m.status === 'available' ? 'Assign to Order' : 'Unavailable'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <PaginationControl
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            pageSize={pagination.pageSize}
            pageSizeOptions={[6, 12, 24]}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            itemLabel={`${role.toLowerCase()}s`}
            showPageSize
            className="border-t-0 pt-2"
          />
        </>
      )}
    </div>
  );

}
