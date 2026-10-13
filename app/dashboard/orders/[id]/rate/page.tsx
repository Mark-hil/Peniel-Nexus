'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingBag, Bike, ThumbsUp, ThumbsDown } from 'lucide-react';
import { CustomerSidebar } from '@/components/customer-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/status-badge';
import { useOrder } from '@/hooks/use-order';
import { supabase } from '@/lib/supabase';
import { formatGHS } from '@/lib/format';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RateOrderPage({
  params,
}: {
  params: { id: string };
}) {
  const { order, loading } = useOrder(params.id);

  const [shopperRating, setShopperRating] = React.useState(0);
  const [riderRating, setRiderRating] = React.useState(0);
  const [deliveryRating, setDeliveryRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [wouldRecommend, setWouldRecommend] = React.useState<'up' | 'down' | null>(null);
  const [hoveredStar, setHoveredStar] = React.useState<{ target: string; value: number } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

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

  if (order.status !== 'delivered') {
    return (
      <CustomerSidebar>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Star className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Order not delivered yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You can rate your experience once your order has been delivered.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href={`/dashboard/orders/${order.id}`}>Back to Order</Link>
          </Button>
        </div>
      </CustomerSidebar>
    );
  }

  const handleSubmit = async () => {
    if (shopperRating === 0 || riderRating === 0 || deliveryRating === 0) {
      toast.error('Please rate all three categories before submitting.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('ratings').insert({
      order_id: order.id,
      shopper_rating: shopperRating,
      rider_rating: riderRating,
      delivery_rating: deliveryRating,
      would_recommend: wouldRecommend === 'up' ? true : wouldRecommend === 'down' ? false : null,
      comment: comment.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error('Could not submit rating. Please try again.');
      return;
    }

    setSubmitted(true);
    toast.success('Thank you for your feedback!', {
      description: 'Your review helps us improve our service.',
    });
  };

  const StarRating = ({
    value,
    onChange,
    target,
  }: {
    value: number;
    onChange: (v: number) => void;
    target: string;
  }) => {
    const displayValue = hoveredStar?.target === target ? hoveredStar.value : value;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredStar({ target, value: star })}
            onMouseLeave={() => setHoveredStar(null)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                star <= displayValue
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted-foreground',
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <CustomerSidebar>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <ThumbsUp className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-display text-xl font-bold">Thank you!</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your feedback has been recorded. We appreciate you taking the time to rate your experience.
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">Back to Orders</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </CustomerSidebar>
    );
  }

  return (
    <CustomerSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link href={`/dashboard/orders/${order.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">Rate Your Experience</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Order {order.orderNumber} · {formatGHS(order.total)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Shopper rating */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  Rate Your Shopper
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.shopper && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {order.shopper.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{order.shopper}</p>
                      <p className="text-xs text-muted-foreground">Personal Shopper</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">How was the shopping quality?</p>
                  <StarRating value={shopperRating} onChange={setShopperRating} target="shopper" />
                </div>
              </CardContent>
            </Card>

            {/* Rider rating */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bike className="h-4 w-4 text-primary" />
                  Rate Your Rider
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.rider && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {order.rider.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{order.rider}</p>
                      <p className="text-xs text-muted-foreground">Delivery Rider</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">How was the delivery experience?</p>
                  <StarRating value={riderRating} onChange={setRiderRating} target="rider" />
                </div>
              </CardContent>
            </Card>

            {/* Overall delivery rating */}
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Overall Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">How was your overall experience?</p>
                  <StarRating value={deliveryRating} onChange={setDeliveryRating} target="overall" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Would you recommend Peniel Nexus to a friend?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWouldRecommend('up')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                        wouldRecommend === 'up'
                          ? 'border-success bg-success/10 text-success'
                          : 'border-border/60 hover:bg-muted/30',
                      )}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Yes, definitely
                    </button>
                    <button
                      onClick={() => setWouldRecommend('down')}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                        wouldRecommend === 'down'
                          ? 'border-destructive bg-destructive/10 text-destructive'
                          : 'border-border/60 hover:bg-muted/30',
                      )}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Not really
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Additional comments (optional)</p>
                  <Textarea
                    placeholder="Tell us what went well or what we could improve..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
              <Star className="mr-2 h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>

          {/* Order summary sidebar */}
          <div>
            <Card className="sticky top-24 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-medium">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{order.items.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-medium">{order.preferredTime}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Paid</span>
                  <span className="font-display text-lg font-bold">{formatGHS(order.total)}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{formatGHS(item.budget)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerSidebar>
  );
}
