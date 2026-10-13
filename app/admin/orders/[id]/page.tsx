'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Clock,
  CreditCard,
  Receipt,
  Package,
  Bike,
  ShoppingCart,
  StickyNote,
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { OrderTimeline } from '@/components/order-timeline';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminData } from '@/hooks/use-admin-data';
import { paymentMethodLabels, statusLabels } from '@/lib/data';
import { formatGHS } from '@/lib/format';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';

export default function AdminOrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { orders, teamMembers, loading, updateOrderStatus, assignStaff } = useAdminData();
  const order = orders.find((o) => o.id === params.id);

  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | null>(null);
  const [selectedShopper, setSelectedShopper] = React.useState<string | undefined>(undefined);
  const [selectedRider, setSelectedRider] = React.useState<string | undefined>(undefined);
  const [savingStatus, setSavingStatus] = React.useState(false);
  const [savingShopper, setSavingShopper] = React.useState(false);
  const [savingRider, setSavingRider] = React.useState(false);

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      const shopperMember = teamMembers.find((m) => m.fullName === order.shopper);
      setSelectedShopper(shopperMember?.id);
      const riderMember = teamMembers.find((m) => m.fullName === order.rider);
      setSelectedRider(riderMember?.id);
    }
  }, [order, teamMembers]);

  if (loading) {
    return (
      <AdminSidebar>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AdminSidebar>
    );
  }

  if (!order) {
    return (
      <AdminSidebar>
        <div className="p-8 text-center">
          <p>Order not found.</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </AdminSidebar>
    );
  }

  const shoppers = teamMembers.filter((m) => m.role === 'shopper');
  const riders = teamMembers.filter((m) => m.role === 'rider');

  const handleSaveStatus = async () => {
    if (!selectedStatus || selectedStatus === order.status) return;
    setSavingStatus(true);
    const success = await updateOrderStatus(order.id, selectedStatus);
    setSavingStatus(false);
    if (success) {
      toast.success('Order status updated', { description: `Status changed to ${statusLabels[selectedStatus]}` });
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleAssignShopper = async (shopperId: string) => {
    setSavingShopper(true);
    const success = await assignStaff(order.id, 'shopper_id', shopperId);
    setSavingShopper(false);
    if (success) {
      toast.success('Shopper assigned');
    } else {
      toast.error('Failed to assign shopper');
    }
  };

  const handleAssignRider = async (riderId: string) => {
    setSavingRider(true);
    const success = await assignStaff(order.id, 'rider_id', riderId);
    setSavingRider(false);
    if (success) {
      toast.success('Rider assigned');
    } else {
      toast.error('Failed to assign rider');
    }
  };

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {order.orderNumber}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {order.customerName} · {order.customerPhone}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={selectedStatus ?? undefined} onValueChange={(v) => setSelectedStatus(v as OrderStatus)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSaveStatus} disabled={savingStatus || selectedStatus === order.status}>
              {savingStatus ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingCart className="h-4 w-4" />
                  Shopping List & Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.quantity && <p className="text-xs text-muted-foreground">{item.quantity}</p>}
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {formatGHS(item.budget)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Shopping Budget</span><span className="font-medium">{formatGHS(order.shoppingBudget)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Service Fee (10%)</span><span className="font-medium">{formatGHS(order.serviceFee)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span className="font-medium">{formatGHS(order.deliveryFee)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{formatGHS(order.total)}</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline timeline={order.timeline} />
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <StickyNote className="h-4 w-4" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  rows={3}
                  placeholder="Add internal notes about this order..."
                />
                <Button size="sm" className="mt-3">Add Note</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground">{order.customerPhone}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-muted-foreground">{order.deliveryAddress}</p>
                    <p className="text-xs text-muted-foreground">GPS: {order.gpsLocation}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Preferred Time</p>
                    <p className="text-muted-foreground">{order.preferredTime}</p>
                  </div>
                </div>
                {order.specialInstructions && (
                  <>
                    <Separator />
                    <div>
                      <p className="font-medium">Special Instructions</p>
                      <p className="mt-0.5 text-muted-foreground">{order.specialInstructions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    Method
                  </span>
                  <span className="text-sm font-medium">{paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-semibold">{formatGHS(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Assign Shopper
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={selectedShopper}
                  onValueChange={handleAssignShopper}
                  disabled={savingShopper}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shopper" />
                  </SelectTrigger>
                  <SelectContent>
                    {shoppers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.fullName} ({s.activeOrders} active)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {order.shopper && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{order.shopper.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{order.shopper}</p>
                      <p className="text-xs text-muted-foreground">Assigned shopper</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bike className="h-4 w-4" />
                  Assign Rider
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select
                  value={selectedRider}
                  onValueChange={handleAssignRider}
                  disabled={savingRider}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rider" />
                  </SelectTrigger>
                  <SelectContent>
                    {riders.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.fullName} ({r.activeOrders} active)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {order.rider && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{order.rider.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{order.rider}</p>
                      <p className="text-xs text-muted-foreground">Assigned rider</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}
