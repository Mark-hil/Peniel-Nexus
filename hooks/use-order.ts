'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Order, OrderItem } from '@/types';
import { fetchTimeline } from '@/lib/timeline';
import { getDeliveryPin } from '@/lib/utils';

export function useOrder(orderId: string | null) {
  const { user } = useAuth();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchOrder = React.useCallback(async () => {
    if (!orderId || !user) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        payment_method,
        delivery_address,
        gps_location,
        preferred_time,
        special_instructions,
        shopping_budget,
        service_fee,
        delivery_fee,
        total,
        shopper_id,
        rider_id,
        created_at
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (error || !orderData) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('id, name, budget, quantity, notes')
      .eq('order_id', orderId);

    const items: OrderItem[] = (itemsData ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      budget: Number(i.budget),
      quantity: i.quantity ?? undefined,
      notes: i.notes ?? undefined,
    }));

    let shopperName: string | undefined;
    let riderName: string | undefined;

    if (orderData.shopper_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', orderData.shopper_id)
        .maybeSingle();
      if (profile) shopperName = profile.full_name;
    }

    if (orderData.rider_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', orderData.rider_id)
        .maybeSingle();
      if (profile) riderName = profile.full_name;
    }

    setOrder({
      id: orderData.id,
      orderNumber: orderData.order_number,
      customerName: user.fullName,
      customerPhone: user.phone,
      items,
      shoppingBudget: Number(orderData.shopping_budget),
      serviceFee: Number(orderData.service_fee),
      deliveryFee: Number(orderData.delivery_fee),
      total: Number(orderData.total),
      status: orderData.status as Order['status'],
      paymentStatus: orderData.payment_status as Order['paymentStatus'],
      paymentMethod: orderData.payment_method as Order['paymentMethod'],
      deliveryAddress: orderData.delivery_address,
      gpsLocation: orderData.gps_location,
      preferredTime: orderData.preferred_time,
      specialInstructions: orderData.special_instructions ?? undefined,
      shopper: shopperName,
      rider: riderName,
      createdAt: orderData.created_at,
      timeline: await fetchTimeline(orderData.id, orderData.status as Order['status']),
      deliveryPin: getDeliveryPin(orderData.id || orderData.order_number),
    });

    setLoading(false);
  }, [orderId, user]);

  React.useEffect(() => {
    fetchOrder();

    if (!orderId) return;

    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrder();
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchOrder();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchOrder, orderId]);

  const cancelOrder = React.useCallback(async () => {
    if (!orderId) return false;

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled', payment_status: 'refunded' })
      .eq('id', orderId);

    if (error) {
      console.error('Error cancelling order:', error);
      return false;
    }

    setOrder((prev) =>
      prev
        ? { ...prev, status: 'cancelled' as const, paymentStatus: 'refunded' as const }
        : prev,
    );
    return true;
  }, [orderId]);

  return { order, loading, cancelOrder, refresh: fetchOrder };
}
