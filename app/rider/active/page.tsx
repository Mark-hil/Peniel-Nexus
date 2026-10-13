'use client';

import * as React from 'react';
import {
  Navigation,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Bike,
  KeyRound,
  Sparkles,
  Hash,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat-panel';
import { useRiderOrders } from '@/hooks/use-rider-orders';
import { useChat } from '@/hooks/use-chat';
import { formatGHS, parseGPS } from '@/lib/format';
import { DeliveryMap } from '@/components/delivery-map';
import { toast } from 'sonner';

export default function RiderActivePage() {
  const { activeOrders, loading, markDelivered, confirmByPinOnly } = useRiderOrders();
  const [delivering, setDelivering] = React.useState<string | null>(null);
  const [chatOpenFor, setChatOpenFor] = React.useState<string | null>(null);
  const [packagePins, setPackagePins] = React.useState<Record<string, string>>({});
  const [universalPin, setUniversalPin] = React.useState('');
  const [verifyingUniversal, setVerifyingUniversal] = React.useState(false);

  const activeDeliveries = activeOrders.filter((o) => o.status === 'out_for_delivery');
  const chatOrder = activeDeliveries.find((o) => o.id === chatOpenFor);
  const chat = useChat(chatOpenFor, null);

  const handleDelivered = async (orderId: string, orderNumber: string) => {
    const pin = packagePins[orderId]?.trim() || '';
    setDelivering(orderId);
    const result = await markDelivered(orderId, pin || undefined);
    setDelivering(null);

    if (result && typeof result === 'object' && result.success) {
      toast.success('Delivery Confirmed!', {
        description: `${orderNumber} has been handed off and marked delivered.`,
      });
      setPackagePins((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } else {
      const err = (result && typeof result === 'object' && result.error) || 'Could not confirm delivery. Please try again.';
      toast.error(err);
    }
  };

  const handleUniversalPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universalPin.trim()) return;

    setVerifyingUniversal(true);
    const res = await confirmByPinOnly(universalPin.trim());
    setVerifyingUniversal(false);

    if (res.success && res.order) {
      toast.success('Instant PIN Match Verified!', {
        description: `Order #${res.order.orderNumber} successfully confirmed and delivered to ${res.order.customerName}.`,
      });
      setUniversalPin('');
    } else {
      toast.error(res.error || 'Code did not match any active deliveries.');
    }
  };

  return (
    <FieldStaffSidebar role="rider">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Active Deliveries</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Navigate to the customer and confirm delivery when you hand off the order.
            </p>
          </div>

          {activeDeliveries.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-right">
              <span className="text-xs text-muted-foreground">Active Packages</span>
              <p className="font-display text-lg font-bold text-primary">{activeDeliveries.length}</p>
            </div>
          )}
        </div>

        {/* Rapid Universal PIN Verification Bar (When rider has multiple packages) */}
        {activeDeliveries.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-background to-background">
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleUniversalPinSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5 sm:w-1/3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Quick Code Dropoff</p>
                    <p className="text-xs text-muted-foreground">
                      Got code from customer? Type it here to instant-confirm.
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 items-center gap-2">
                  <Input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit code (e.g. 4286)"
                    value={universalPin}
                    onChange={(e) => setUniversalPin(e.target.value.replace(/\D/g, ''))}
                    className="h-11 font-mono text-center text-lg tracking-widest sm:text-left sm:tracking-normal"
                  />
                  <Button
                    type="submit"
                    className="h-11 shrink-0 px-5"
                    disabled={universalPin.length !== 4 || verifyingUniversal}
                  >
                    {verifyingUniversal ? 'Verifying...' : 'Confirm Delivery'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : activeDeliveries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Bike className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No active deliveries</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick up orders from the Pickup Queue to start delivering.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map((order) => (
              <Card key={order.id} className="border-cyan-500/30 bg-cyan-500/5">
                <CardHeader className="flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                      <Navigation className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                      <p className="mt-0.5 text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Delivery Location
                    </p>
                    <div className="overflow-hidden rounded-xl border border-border/60">
                      <DeliveryMap
                        destination={parseGPS(order.gpsLocation)}
                        destinationLabel={order.deliveryAddress}
                        riderPosition={[5.56, -0.1]}
                        height={280}
                      />
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">{order.deliveryAddress}</p>
                        <p className="text-xs text-muted-foreground">GPS: {order.gpsLocation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{order.preferredTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{order.items.length} items</span>
                    </div>
                  </div>

                  {order.specialInstructions && (
                    <div className="rounded-lg bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
                      <p className="font-medium">Customer note:</p>
                      <p className="mt-0.5">{order.specialInstructions}</p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="mr-1.5 h-3.5 w-3.5" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setChatOpenFor(order.id)}>
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        Message
                      </Button>
                    </div>
                    <p className="font-semibold text-primary">{formatGHS(order.deliveryFee)}</p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-border/80 bg-background/50 p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <KeyRound className="h-3.5 w-3.5 text-primary" />
                        Customer Handover Code
                      </label>
                      <span className="text-[11px] text-muted-foreground">Ask customer for 4-digit code</span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 4286"
                        value={packagePins[order.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPackagePins((prev) => ({ ...prev, [order.id]: val }));
                        }}
                        className="h-10 font-mono tracking-widest"
                      />
                      <Button
                        className="h-10 shrink-0 px-4"
                        onClick={() => handleDelivered(order.id, order.orderNumber)}
                        disabled={delivering === order.id}
                      >
                        {delivering === order.id ? (
                          'Verifying...'
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            Confirm Handover
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span>Code-verified handover</span>
                      <button
                        type="button"
                        onClick={() => handleDelivered(order.id, order.orderNumber)}
                        className="text-xs text-primary underline-offset-2 hover:underline"
                      >
                        Bypass code & confirm directly
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {chatOrder && (
        <ChatPanel
          open={chatOpenFor !== null}
          onClose={() => setChatOpenFor(null)}
          recipientName={chatOrder.customerName}
          recipientRole="Customer"
          recipientInitials={chatOrder.customerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          messages={chat.messages}
          onSend={chat.sendMessage}
        />
      )}
    </FieldStaffSidebar>
  );
}
