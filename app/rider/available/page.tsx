'use client';

import * as React from 'react';
import {
  Package,
  MapPin,
  Clock,
  Phone,
  Truck,
  CheckCircle2,
  User,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useRiderOrders } from '@/hooks/use-rider-orders';
import { formatGHS, parseGPS } from '@/lib/format';
import { DeliveryMap } from '@/components/delivery-map';
import { toast } from 'sonner';

export default function RiderAvailablePage() {
  const { availableOrders, loading, acceptOrder } = useRiderOrders();
  const [accepting, setAccepting] = React.useState<string | null>(null);

  const handlePickup = async (orderId: string, orderNumber: string) => {
    setAccepting(orderId);
    const success = await acceptOrder(orderId);
    setAccepting(null);
    if (success) {
      toast.success('Order picked up!', {
        description: `${orderNumber} is now in your active deliveries. Head to the customer.`,
      });
    } else {
      toast.error('Could not accept this order. It may have been taken by another rider.');
    }
  };

  return (
    <FieldStaffSidebar role="rider">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Pickup Queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            These orders are packed and ready for pickup. Collect them from the shopper and deliver to the customer.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : availableOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Package className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No orders ready for pickup</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Packed orders will appear here when shoppers are done.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {availableOrders.map((order) => (
              <Card key={order.id} className="border-border/60">
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                    <p className="mt-0.5 text-sm text-muted-foreground">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-primary">
                      {formatGHS(order.deliveryFee)}
                    </p>
                    <p className="text-xs text-muted-foreground">delivery fee</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {order.items.length} items packed
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.items.map((i) => i.name).join(', ')}
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{order.deliveryAddress}</p>
                        <p className="text-xs text-muted-foreground">GPS: {order.gpsLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{order.preferredTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{order.customerPhone}</span>
                    </div>
                    {order.specialInstructions && (
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.specialInstructions}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {order.shopper && (
                    <div className="flex items-center gap-2 rounded-lg bg-muted/30 p-3 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Shopped by:</span>
                      <span className="font-medium">{order.shopper}</span>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-xl border border-border/60">
                    <DeliveryMap
                      destination={parseGPS(order.gpsLocation)}
                      destinationLabel={order.deliveryAddress}
                      height={200}
                      zoom={13}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handlePickup(order.id, order.orderNumber)}
                    disabled={accepting === order.id}
                  >
                    {accepting === order.id ? (
                      'Accepting...'
                    ) : (
                      <>
                        <Truck className="mr-2 h-4 w-4" />
                        Confirm Pickup
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FieldStaffSidebar>
  );
}
