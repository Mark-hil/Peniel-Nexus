'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, MessageCircle, MapPin, KeyRound, Copy, Check, CheckCircle2 } from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { OrderTimeline } from '@/components/order-timeline';
import { OrderStatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { formatGHS } from '@/lib/format';
import { toast } from 'sonner';

export default function TrackOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { order, loading, confirmDelivery } = useOrder(params.id);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [confirmDeliveryOpen, setConfirmDeliveryOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const chat = useChat(chatOpen ? params.id : null, null);

  const handleConfirmDelivery = async () => {
    setConfirming(true);
    const success = await confirmDelivery();
    setConfirming(false);
    setConfirmDeliveryOpen(false);
    if (success) {
      toast.success('Delivery Confirmed!', {
        description: 'Thank you for confirming receipt of your items.',
      });
    } else {
      toast.error('Could not confirm delivery. Please try again.');
    }
  };

  if (loading) {
    return (
      <CustomerSidebar>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
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

  return (
    <CustomerSidebar>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href={`/dashboard/orders/${order.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                Track {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              ETA: ~25 minutes · {order.preferredTime}
            </p>
          </div>
        </div>

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
                      {order.status === 'delivered' ? 'Delivery Confirmed' : 'Give to Rider on arrival'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {order.status === 'delivered'
                      ? 'This delivery has been completed and verified.'
                      : 'Show or read this 4-digit code to the rider to confirm delivery.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
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
                  title="Copy PIN"
                  onClick={() => {
                    if (order.deliveryPin) {
                      navigator.clipboard?.writeText(order.deliveryPin);
                      toast.success('Code copied to clipboard!');
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {order.status !== 'delivered' && (
                  <Button
                    size="sm"
                    className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5"
                    onClick={() => setConfirmDeliveryOpen(true)}
                  >
                    <Check className="mr-1.5 h-4 w-4" />
                    Confirm Received
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Timeline */}
          <Card className="border-border/60 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Delivery Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline timeline={order.timeline} />
            </CardContent>
          </Card>

          {/* Delivery team + address */}
          <div className="space-y-6">
            {order.rider && (
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Your Rider</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {order.rider.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{order.rider}</p>
                      <p className="text-xs text-muted-foreground">Rating: 4.9 · Motorcycle</p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="mr-2 h-3.5 w-3.5" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}>
                      <MessageCircle className="mr-2 h-3.5 w-3.5" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{order.deliveryAddress}</p>
                    <p className="text-xs text-muted-foreground">GPS: {order.gpsLocation}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Order Total</p>
                  <p className="mt-0.5 font-display text-xl font-bold">{formatGHS(order.total)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Delivery Dialog */}
      <AlertDialog open={confirmDeliveryOpen} onOpenChange={setConfirmDeliveryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirm Delivery Received
            </AlertDialogTitle>
            <AlertDialogDescription>
              Have you received all your market items in good condition? Confirming will mark this delivery as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirming}>Not yet</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelivery}
              disabled={confirming}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {confirming ? 'Confirming...' : 'Yes, I Received My Items'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {chatOpen && order.rider && (
        <ChatPanel
          open
          onClose={() => setChatOpen(false)}
          recipientName={order.rider}
          recipientRole="Rider"
          recipientInitials={order.rider.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          messages={chat.messages}
          onSend={chat.sendMessage}
        />
      )}
    </CustomerSidebar>
  );
}
