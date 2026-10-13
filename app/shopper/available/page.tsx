'use client';

import * as React from 'react';
import {
  Package,
  MapPin,
  Clock,
  Phone,
  Wallet,
  StickyNote,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopperOrders } from '@/hooks/use-shopper-orders';
import { formatGHS } from '@/lib/format';
import { toast } from 'sonner';

export default function ShopperAvailablePage() {
  const { availableOrders, loading, acceptOrder } = useShopperOrders();
  const [accepting, setAccepting] = React.useState<string | null>(null);

  const handleAccept = async (orderId: string, orderNumber: string) => {
    setAccepting(orderId);
    const success = await acceptOrder(orderId);
    setAccepting(null);
    if (success) {
      toast.success('Order accepted!', {
        description: `${orderNumber} is now in your active shopping list.`,
      });
    } else {
      toast.error('Could not accept this order. It may have been taken by another shopper.');
    }
  };

  return (
    <FieldStaffSidebar role="shopper">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Available Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Accept orders to start shopping. You&apos;ll see the shopping list, budget, and delivery details.
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
              <h3 className="mt-4 text-lg font-semibold">No orders available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                New orders will appear here as customers place them.
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
                      {formatGHS(order.shoppingBudget)}
                    </p>
                    <p className="text-xs text-muted-foreground">shopping budget</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Shopping List
                    </p>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.quantity && (
                            <p className="text-xs text-muted-foreground">{item.quantity}</p>
                          )}
                          {item.notes && (
                            <p className="mt-0.5 text-xs italic text-muted-foreground">
                              &quot;{item.notes}&quot;
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {formatGHS(item.budget)}
                        </span>
                      </div>
                    ))}
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
                        <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.specialInstructions}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Your earnings</span>
                    </div>
                    <span className="font-semibold text-primary">
                      {formatGHS(order.serviceFee)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleAccept(order.id, order.orderNumber)}
                    disabled={accepting === order.id}
                  >
                    {accepting === order.id ? (
                      'Accepting...'
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Accept & Start Shopping
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
