'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  Lock,
  Wallet,
  Receipt,
  Truck,
  CheckCircle2,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatGHS } from '@/lib/format';
import { cn, isUUID } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const paymentMethods = [
  { id: 'mtn_momo', label: 'MTN Mobile Money', desc: 'Pay with MTN MoMo', icon: Smartphone, color: 'bg-yellow-500', badge: 'MoMo' },
  { id: 'telecel_cash', label: 'Telecel Cash', desc: 'Pay with Telecel Cash', icon: Smartphone, color: 'bg-red-500', badge: 'Cash' },
  { id: 'airteltigo', label: 'AirtelTigo Money', desc: 'Pay with AirtelTigo', icon: Smartphone, color: 'bg-blue-500', badge: 'Money' },
  { id: 'visa', label: 'Visa', desc: 'Credit / Debit Card', icon: CreditCard, color: 'bg-blue-600', badge: 'Card' },
  { id: 'mastercard', label: 'Mastercard', desc: 'Credit / Debit Card', icon: CreditCard, color: 'bg-orange-500', badge: 'Card' },
];

interface OrderData {
  order_number: string;
  shopping_budget: number;
  service_fee: number;
  delivery_fee: number;
  total: number;
  preferred_time: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [selected, setSelected] = React.useState('mtn_momo');
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [order, setOrder] = React.useState<OrderData | null>(null);
  const [itemCount, setItemCount] = React.useState(0);
  const [momoNumber, setMomoNumber] = React.useState('+233 24 555 0142');
  const [cardNumber, setCardNumber] = React.useState('');
  const [promptModalOpen, setPromptModalOpen] = React.useState(false);
  const [momoPin, setMomoPin] = React.useState('1234');
  const [activeReference, setActiveReference] = React.useState('');
  const [verifying, setVerifying] = React.useState(false);

  React.useEffect(() => {
    if (!orderId) {
      setFetching(false);
      return;
    }

    (async () => {
      let resolvedOrder: OrderData | null = null;
      let resolvedItemCount = 0;

      // 1. Try Supabase first ONLY if orderId is a valid UUID
      if (isUUID(orderId)) {
        const { data, error } = await supabase
          .from('orders')
          .select('order_number, shopping_budget, service_fee, delivery_fee, total, preferred_time')
          .eq('id', orderId)
          .maybeSingle();

        if (!error && data) {
          resolvedOrder = data as OrderData;

          const { count } = await supabase
            .from('order_items')
            .select('id', { count: 'exact', head: true })
            .eq('order_id', orderId);

          resolvedItemCount = count ?? 0;
        }
      }

      if (!resolvedOrder) {
        // 2. Check local fallback storage (when Supabase orders table is not yet migrated)
        try {
          const cached =
            sessionStorage.getItem(`pn_order_${orderId}`) ||
            localStorage.getItem(`pn_order_${orderId}`);

          if (cached) {
            const parsed = JSON.parse(cached);
            resolvedOrder = {
              order_number: parsed.order_number || 'PN-2026-DEMO',
              shopping_budget: Number(parsed.shopping_budget) || 85,
              service_fee: Number(parsed.service_fee) || 8.5,
              delivery_fee: Number(parsed.delivery_fee) || 15,
              total: Number(parsed.total) || 108.5,
              preferred_time: parsed.preferred_time || 'Today, 2:00 PM – 4:00 PM',
            };
            resolvedItemCount = parsed.itemCount || parsed.items?.length || 4;
          } else if (orderId.startsWith('order-')) {
            // Default sandbox demo order
            resolvedOrder = {
              order_number: `PN-${new Date().getFullYear()}-DEMO`,
              shopping_budget: 85,
              service_fee: 8.5,
              delivery_fee: 15,
              total: 108.5,
              preferred_time: 'Today, 2:00 PM – 4:00 PM',
            };
            resolvedItemCount = 4;
          }
        } catch {}
      }

      if (!resolvedOrder) {
        toast.error('Could not load order details.');
        setFetching(false);
        return;
      }

      setOrder(resolvedOrder);
      setItemCount(resolvedItemCount);
      setFetching(false);
    })();
  }, [orderId]);

  const isCard = selected === 'visa' || selected === 'mastercard';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !order) {
      toast.error('Missing order. Please create an order first.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderNumber: order.order_number,
          amount: order.total,
          phone: momoNumber,
          paymentMethod: selected,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Could not initialize payment.');
        return;
      }

      if (data.mode === 'live' && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }

      // Open sandbox USSD prompt modal
      setActiveReference(data.reference);
      setPromptModalOpen(true);
    } catch {
      setLoading(false);
      toast.error('Network error initializing payment. Please try again.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!activeReference || !orderId) return;

    setVerifying(true);

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: activeReference,
          orderId,
        }),
      });

      const data = await res.json();
      setVerifying(false);

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Payment verification failed.');
        return;
      }

      setPromptModalOpen(false);
      toast.success('Payment Approved!', {
        description: `Order #${order?.order_number || ''} confirmed. SMS confirmation sent!`,
      });
      router.push('/dashboard/orders');
    } catch {
      setVerifying(false);
      toast.error('Verification failed. Please try again.');
    }
  };

  const total = order ? Number(order.total) : 0;
  const shoppingBudget = order ? Number(order.shopping_budget) : 0;
  const serviceFee = order ? Number(order.service_fee) : 0;
  const deliveryFee = order ? Number(order.delivery_fee) : 0;

  return (
    <CustomerSidebar>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href="/dashboard/orders/new">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Payment</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Choose your preferred payment method to complete your order.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Payment methods */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const active = selected === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelected(method.id)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 hover:border-border'
                      )}
                    >
                      <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', method.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.desc}</p>
                      </div>
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                          active ? 'border-primary bg-primary' : 'border-border'
                        )}
                      >
                        {active && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Payment details form */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">
                  {isCard ? 'Card Details' : 'Mobile Money Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCard ? (
                  <form onSubmit={handlePay} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM / YY" />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input placeholder="123" className="pl-9" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Name on Card</Label>
                      <Input placeholder="Ama Owusu" />
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading || !order}>
                      {loading ? 'Processing...' : `Pay ${formatGHS(total)}`}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePay} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mobile Money Number</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="+233 24 555 0142"
                          value={momoNumber}
                          onChange={(e) => setMomoNumber(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You will receive a prompt on your phone to confirm the payment.
                      </p>
                    </div>
                    <Button type="submit" size="lg" className="w-full" disabled={loading || !order}>
                      {loading ? 'Processing...' : `Pay ${formatGHS(total)}`}
                    </Button>
                  </form>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  Payments are encrypted and secure
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-24 border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fetching ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Wallet className="h-3.5 w-3.5" />
                          Shopping Budget
                        </span>
                        <span className="font-medium">{formatGHS(shoppingBudget)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Receipt className="h-3.5 w-3.5" />
                          Service Fee
                        </span>
                        <span className="font-medium">{formatGHS(serviceFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Truck className="h-3.5 w-3.5" />
                          Delivery Fee
                        </span>
                        <span className="font-medium">{formatGHS(deliveryFee)}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-base font-semibold">
                      <span>Total Amount</span>
                      <span className="font-display text-xl">{formatGHS(total)}</span>
                    </div>

                    {order && (
                      <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-xs font-medium">Order: {order.order_number}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {itemCount} items · {order.preferred_time}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Money USSD Prompt Modal (Sandbox / Real Simulation) */}
      {promptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-background shadow-2xl animate-scale-in">
            {/* Header branding */}
            <div className={cn(
              'p-4 text-white flex items-center gap-3',
              selected === 'telecel_cash' ? 'bg-red-600' : selected === 'airteltigo' ? 'bg-blue-600' : 'bg-amber-500'
            )}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-90">
                  {selected === 'telecel_cash' ? 'Telecel Cash' : selected === 'airteltigo' ? 'AT Money' : 'MTN MoMo'}
                </p>
                <p className="font-bold text-sm">Payment Authorization Prompt</p>
              </div>
            </div>

            {/* USSD body */}
            <div className="p-6 space-y-4">
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground uppercase font-medium">Prompt on phone: {momoNumber}</p>
                <p className="text-sm font-semibold">
                  Authorize transaction of <span className="font-bold text-primary">{formatGHS(total)}</span> to <strong className="text-foreground">Peniel Nexus</strong>?
                </p>
                <p className="text-xs text-muted-foreground">Order Ref: {order?.order_number || activeReference}</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ussd-pin" className="text-xs text-muted-foreground">Enter Mobile Money PIN:</Label>
                <Input
                  id="ussd-pin"
                  type="password"
                  maxLength={4}
                  value={momoPin}
                  onChange={(e) => setMomoPin(e.target.value)}
                  className="text-center tracking-widest text-lg font-bold font-mono h-11"
                  placeholder="••••"
                  autoFocus
                />
                <p className="text-[11px] text-center text-muted-foreground">
                  (Test Sandbox: enter any 4 digits to approve)
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={verifying || momoPin.length < 4}
                  className="w-full h-11 text-sm font-semibold rounded-xl"
                >
                  {verifying ? 'Authorizing with Network...' : 'Approve & Pay Now'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPromptModalOpen(false)}
                  disabled={verifying}
                  className="text-muted-foreground text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CustomerSidebar>
  );
}
