'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatGHS } from '@/lib/format';
import { supabase } from '@/lib/supabase';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  const [status, setStatus] = React.useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [orderNumber, setOrderNumber] = React.useState('');
  const [amount, setAmount] = React.useState(0);

  const verifyPayment = React.useCallback(async () => {
    if (!orderId || !reference) {
      setStatus('failed');
      setErrorMessage('Missing order ID or payment reference in callback URL.');
      return;
    }

    setStatus('verifying');

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, orderId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus('failed');
        setErrorMessage(data.error || 'Payment verification could not be completed.');
        return;
      }

      // Fetch verified order details for receipt display
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, total')
        .eq('id', orderId)
        .maybeSingle();

      if (order) {
        setOrderNumber(order.order_number);
        setAmount(Number(order.total));
      }

      setStatus('success');
    } catch {
      setStatus('failed');
      setErrorMessage('Network error during verification. Please check your order status.');
    }
  }, [orderId, reference]);

  React.useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <CustomerSidebar>
      <div className="mx-auto max-w-xl py-12">
        <Card className="border-border/60 shadow-lg">
          <CardContent className="p-8 text-center sm:p-10">
            {status === 'verifying' && (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight">Verifying Payment...</h1>
                <p className="text-sm text-muted-foreground">
                  Please hold on while we securely confirm your transaction with Paystack.
                </p>
                <div className="mt-4 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground font-mono">
                  Ref: {reference || 'N/A'}
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    Payment Approved!
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your order has been placed and a personal shopper is assigned to shop at the market. An SMS confirmation was sent to your phone.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Number</span>
                    <span className="font-semibold text-foreground">{orderNumber || 'Confirmed'}</span>
                  </div>
                  {amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-semibold text-foreground">{formatGHS(amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status</span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Paid
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <Button asChild className="flex-1 gap-2" size="lg">
                    <Link href="/dashboard/orders">
                      <ShoppingBag className="h-4 w-4" />
                      Track My Order
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="space-y-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <XCircle className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-destructive">
                    Payment Verification Failed
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {errorMessage || 'We could not confirm your payment. If your money was deducted, it will be credited back.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                  <Button
                    onClick={() => verifyPayment()}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <RefreshCw className="h-4 w-4" /> Retry Verification
                  </Button>
                  {orderId && (
                    <Button asChild variant="outline" size="lg">
                      <Link href={`/payment?orderId=${orderId}`}>Return to Payment</Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerSidebar>
  );
}
