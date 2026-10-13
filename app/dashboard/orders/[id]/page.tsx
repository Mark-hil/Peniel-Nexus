'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  CreditCard,
  Receipt,
  User,
  Package,
  Star,
  XCircle,
  MessageCircle,
  KeyRound,
  Check,
  Copy,
} from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { OrderTimeline } from '@/components/order-timeline';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { ChatPanel } from '@/components/chat-panel';
import { useOrder } from '@/hooks/use-order';
import { useChat } from '@/hooks/use-chat';
import { paymentMethodLabels } from '@/lib/constants';
import { formatGHS } from '@/lib/format';
import { toast } from 'sonner';
import type { OrderStatus } from '@/types';

const cancellableStatuses: OrderStatus[] = ['received', 'accepted'];

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { order, loading, cancelOrder } = useOrder(params.id);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [chatOpenFor, setChatOpenFor] = React.useState<'shopper' | 'rider' | null>(null);

  const shopperChat = useChat(
    chatOpenFor === 'shopper' ? params.id : null,
    order?.shopper ? null : null,
  );
  const riderChat = useChat(
    chatOpenFor === 'rider' ? params.id : null,
    order?.rider ? null : null,
  );

  if (loading) {
    return (
      <CustomerSidebar>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CustomerSidebar>
    );
  }

  if (!order) {
    return (
      <CustomerSidebar>
        <div className="p-8 text-center">
          <p>Order not found.</p>
        </div>
      </CustomerSidebar>
    );
  }

  const canCancel =
    order.status && cancellableStatuses.includes(order.status);

  const handleCancel = async () => {
    const success = await cancelOrder();
    setCancelOpen(false);
    setCancelReason('');
    if (success) {
      toast.success('Order cancelled', {
        description: 'Your order has been cancelled. Any payment will be refunded within 24 hours.',
      });
    } else {
      toast.error('Could not cancel order. Please try again.');
    }
  };

  return (
    <CustomerSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-9 w-9">
              <Link href="/dashboard/orders">
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
                Placed on {order.preferredTime}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {order.status === 'delivered' && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/orders/${order.id}/rate`}>
                  <Star className="mr-2 h-4 w-4" />
                  Rate Experience
                </Link>
              </Button>
            )}
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/orders/${order.id}/track`}>
                  Track Order
                </Link>
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Cancelled banner */}
        {order.status === 'cancelled' && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-destructive">Order Cancelled</p>
              <p className="text-xs text-muted-foreground">
                This order was cancelled. Refunds are processed within 24 hours.
              </p>
            </div>
          </div>
        )}

        {/* Delivery Confirmation Code Card */}
        {order.status !== 'cancelled' && order.deliveryPin && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Delivery Confirmation Code
                    </h3>
                    <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {order.status === 'delivered' ? 'Verified' : 'Give to Rider upon arrival'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {order.status === 'delivered'
                      ? 'This delivery was successfully verified with this code.'
                      : 'When the delivery rider arrives at your doorstep, read out this 4-digit code to complete the handover.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-background/90 px-4 py-2.5 shadow-sm">
                  {order.deliveryPin.split('').map((digit, idx) => (
                    <span
                      key={idx}
                      className="flex h-9 w-8 items-center justify-center rounded-lg bg-muted/60 font-mono text-xl font-extrabold tracking-wider text-primary"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 px-3"
                  onClick={() => {
                    if (order.deliveryPin) {
                      navigator.clipboard?.writeText(order.deliveryPin);
                      toast.success('Code copied to clipboard!');
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: timeline + shopping list */}
          <div className="space-y-6 lg:col-span-2">
            {/* Timeline */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline timeline={order.timeline} />
              </CardContent>
            </Card>

            {/* Shopping list */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Shopping List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.quantity && (
                        <p className="text-xs text-muted-foreground">{item.quantity}</p>
                      )}
                      {item.notes && (
                        <p className="mt-0.5 text-xs text-muted-foreground italic">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {formatGHS(item.budget)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right: customer info + payment */}
          <div className="space-y-6">
            {/* Customer info */}
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

            {/* Payment / Receipt */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shopping Budget</span>
                  <span className="font-medium">{formatGHS(order.shoppingBudget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee (10%)</span>
                  <span className="font-medium">{formatGHS(order.serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">{formatGHS(order.deliveryFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatGHS(order.total)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{paymentMethodLabels[order.paymentMethod]}</span>
                  </div>
                  <PaymentStatusBadge
                    status={order.status === 'cancelled' ? 'refunded' : order.paymentStatus}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assignments */}
            {(order.shopper || order.rider) && (
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Assigned Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.shopper && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Shopper</p>
                          <p className="text-sm font-medium">{order.shopper}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-11">
                        <Button variant="outline" size="sm">
                          <Phone className="mr-1.5 h-3.5 w-3.5" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setChatOpenFor('shopper')}>
                          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                          Message
                        </Button>
                      </div>
                    </div>
                  )}
                  {order.rider && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Rider</p>
                          <p className="text-sm font-medium">{order.rider}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pl-11">
                        <Button variant="outline" size="sm">
                          <Phone className="mr-1.5 h-3.5 w-3.5" />
                          Call
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setChatOpenFor('rider')}>
                          <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                          Message
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You can only cancel an order before a shopper has begun purchasing items. Any payment will be refunded to your original payment method within 24 hours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label>Reason for cancellation (optional)</Label>
            <Textarea
              placeholder="e.g. Changed my mind, found items at home, scheduling conflict..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {chatOpenFor === 'shopper' && order.shopper && (
        <ChatPanel
          open
          onClose={() => setChatOpenFor(null)}
          recipientName={order.shopper}
          recipientRole="Shopper"
          recipientInitials={order.shopper.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          messages={shopperChat.messages}
          onSend={shopperChat.sendMessage}
        />
      )}
      {chatOpenFor === 'rider' && order.rider && (
        <ChatPanel
          open
          onClose={() => setChatOpenFor(null)}
          recipientName={order.rider}
          recipientRole="Rider"
          recipientInitials={order.rider.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          messages={riderChat.messages}
          onSend={riderChat.sendMessage}
        />
      )}
    </CustomerSidebar>
  );
}
