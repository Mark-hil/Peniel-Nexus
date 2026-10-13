'use client';

import * as React from 'react';
import {
  ShoppingCart,
  Package,
  CheckCircle2,
  Phone,
  MapPin,
  Clock,
  Truck,
  MessageCircle,
  Wallet,
} from 'lucide-react';
import { FieldStaffSidebar } from '@/components/field-staff-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { OrderStatusBadge } from '@/components/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/chat-panel';
import { useShopperOrders } from '@/hooks/use-shopper-orders';
import { useChat } from '@/hooks/use-chat';
import { formatGHS } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export default function ShopperActivePage() {
  const { activeOrders, loading, updateStatus } = useShopperOrders();
  const [checkedItems, setCheckedItems] = React.useState<Record<string, Set<string>>>({});
  const [actualSpends, setActualSpends] = React.useState<Record<string, Record<string, string>>>({});
  const [chatOpenFor, setChatOpenFor] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState<string | null>(null);

  const shoppingOrders = activeOrders.filter(
    (o) => o.status === 'accepted' || o.status === 'shopping' || o.status === 'packing',
  );

  const chatOrder = activeOrders.find((o) => o.id === chatOpenFor);
  const chat = useChat(chatOpenFor, null);

  const toggleItem = (orderId: string, itemId: string) => {
    setCheckedItems((prev) => {
      const current = new Set(prev[orderId] || []);
      if (current.has(itemId)) {
        current.delete(itemId);
      } else {
        current.add(itemId);
      }
      return { ...prev, [orderId]: current };
    });
  };

  const handleStatusUpdate = async (orderId: string, orderNumber: string, status: OrderStatus) => {
    setUpdating(orderId);
    const success = await updateStatus(orderId, status);
    setUpdating(null);
    if (success) {
      if (status === 'shopping') {
        toast.success('Shopping started!', { description: `${orderNumber} is now in progress.` });
      } else if (status === 'packing') {
        toast.success('Order packed!', { description: `${orderNumber} is ready for rider pickup.` });
      } else if (status === 'out_for_delivery') {
        toast.success('Ready for pickup!', { description: `${orderNumber} has been flagged for rider pickup.` });
      }
    } else {
      toast.error('Could not update order status. Please try again.');
    }
  };

  return (
    <FieldStaffSidebar role="shopper">
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Active Shopping</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Check off items as you find them at the market. When done, mark the order as packed.
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : shoppingOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <ShoppingCart className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No active orders</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Accept orders from the Available Orders page to start shopping.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {shoppingOrders.map((order) => {
              const checked = checkedItems[order.id] || new Set();
              const allChecked = order.items.every((i) => checked.has(i.id));

              return (
                <Card key={order.id} className="border-border/60">
                  <CardHeader className="flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                        <p className="mt-0.5 text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {order.status === 'accepted' && (
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleStatusUpdate(order.id, order.orderNumber, 'shopping')}
                        disabled={updating === order.id}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Start Shopping
                      </Button>
                    )}

                    {order.status === 'shopping' && (
                      <>
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {checked.size} of {order.items.length} items found
                            </span>
                            <span className="font-medium">
                              {Math.round((checked.size / order.items.length) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-300"
                              style={{ width: `${(checked.size / order.items.length) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((item) => {
                            const isChecked = checked.has(item.id);
                            const spentVal = actualSpends[order.id]?.[item.id] ?? '';

                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                                  isChecked
                                    ? 'border-success/30 bg-success/5'
                                    : 'border-border/60 hover:bg-muted/30',
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleItem(order.id, item.id)}
                                  className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                    isChecked
                                      ? 'border-success bg-success text-success-foreground'
                                      : 'border-border',
                                  )}
                                >
                                  {isChecked && <CheckCircle2 className="h-4 w-4" />}
                                </button>
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => toggleItem(order.id, item.id)}
                                >
                                  <p className={cn('text-sm font-medium', isChecked && 'line-through text-muted-foreground')}>
                                    {item.name}
                                  </p>
                                  {item.quantity && (
                                    <p className="text-xs text-muted-foreground">{item.quantity}</p>
                                  )}
                                  {item.notes && (
                                    <p className="mt-0.5 text-xs italic text-muted-foreground">
                                      &quot;{item.notes}&quot;
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-muted-foreground">Budget: {formatGHS(item.budget)}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">GHS</span>
                                    <Input
                                      type="number"
                                      step="0.5"
                                      placeholder={String(item.budget)}
                                      value={spentVal}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setActualSpends((prev) => ({
                                          ...prev,
                                          [order.id]: {
                                            ...(prev[order.id] || {}),
                                            [item.id]: val,
                                          },
                                        }));
                                      }}
                                      className="h-7 w-16 px-1.5 text-right text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {(() => {
                          const actualItemsTotal = order.items.reduce((sum, item) => {
                            const custom = actualSpends[order.id]?.[item.id];
                            return sum + (custom !== undefined && custom !== '' ? Number(custom) : item.budget);
                          }, 0);
                          const refundAmount = Math.max(0, order.shoppingBudget - actualItemsTotal);

                          return (
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <Wallet className="h-4 w-4 text-primary" />
                                <span>Budget: {formatGHS(order.shoppingBudget)} • Spent: {formatGHS(actualItemsTotal)}</span>
                              </div>
                              <span className="font-bold text-primary">
                                {refundAmount > 0 ? `Customer Refund: ${formatGHS(refundAmount)}` : 'On Budget'}
                              </span>
                            </div>
                          );
                        })()}

                        <Separator />

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.preferredTime}</span>
                          </div>
                          <div className="col-span-2 flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.deliveryAddress}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="mr-2 h-3.5 w-3.5" />
                            Call Customer
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setChatOpenFor(order.id)}>
                            <MessageCircle className="mr-2 h-3.5 w-3.5" />
                            Message Customer
                          </Button>
                        </div>

                        <Button
                          className="w-full"
                          size="lg"
                          disabled={!allChecked || updating === order.id}
                          onClick={() => handleStatusUpdate(order.id, order.orderNumber, 'packing')}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          {allChecked ? 'Mark as Packed' : `Find all items first (${checked.size}/${order.items.length})`}
                        </Button>
                      </>
                    )}

                    {order.status === 'packing' && (
                      <>
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
                          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                          <p className="mt-2 text-base font-semibold text-emerald-700 dark:text-emerald-300">
                            Order Packed & Ready for Pickup!
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            This order is now waiting in the Rider Pickup Queue. A delivery rider will pick it up and deliver to the customer.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.preferredTime}</span>
                          </div>
                          <div className="col-span-2 flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="text-muted-foreground">{order.deliveryAddress}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Truck className="h-4 w-4 text-primary animate-pulse" />
                            Waiting for rider assignment...
                          </span>
                          <span className="font-semibold text-foreground">Status: Packed</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
