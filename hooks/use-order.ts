'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Order, OrderItem } from '@/types';
import { fetchTimeline } from '@/lib/timeline';
import { getDeliveryPin, isUUID } from '@/lib/utils';

export function useOrder(orderId: string | null) {
  const { user } = useAuth();
  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchOrder = React.useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    let resolvedOrder: Order | null = null;

    // 1. Try querying remote Supabase if orderId is valid UUID
    if (isUUID(orderId)) {
      try {
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
            created_at,
            user_id
          `)
          .eq('id', orderId)
          .maybeSingle();

        if (!error && orderData) {
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

          resolvedOrder = {
            id: orderData.id,
            orderNumber: orderData.order_number,
            customerName: user?.fullName || 'Customer',
            customerPhone: user?.phone || '',
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
          };
        }
      } catch (err) {
        console.warn('Note fetching remote order from Supabase:', err);
      }
    }

    // 2. If not found in Supabase (or guest order / offline / unpropagated cache), check local browser storage
    if (!resolvedOrder && typeof window !== 'undefined') {
      try {
        let cached =
          sessionStorage.getItem(`pn_order_${orderId}`) ||
          localStorage.getItem(`pn_order_${orderId}`);

        if (!cached) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('pn_order_')) {
              const val = localStorage.getItem(key);
              if (val) {
                const parsed = JSON.parse(val);
                if (
                  parsed.id === orderId ||
                  parsed.order_number === orderId ||
                  parsed.orderNumber === orderId
                ) {
                  cached = val;
                  break;
                }
              }
            }
          }
        }

        if (cached) {
          const parsed = JSON.parse(cached);
          const rawItems = parsed.items || [];
          const items: OrderItem[] = rawItems.map((it: any, idx: number) => ({
            id: it.id || `item-${idx}`,
            name: it.name,
            budget: Number(it.budget),
            quantity: it.quantity,
            notes: it.notes,
          }));

          resolvedOrder = {
            id: parsed.id || orderId,
            orderNumber: parsed.order_number || parsed.orderNumber || 'PN-ORDER',
            customerName: parsed.customerName || user?.fullName || 'Customer',
            customerPhone: parsed.customerPhone || user?.phone || '',
            items,
            shoppingBudget: Number(parsed.shopping_budget || parsed.shoppingBudget) || 0,
            serviceFee: Number(parsed.service_fee || parsed.serviceFee) || 0,
            deliveryFee: Number(parsed.delivery_fee || parsed.deliveryFee) || 15,
            total: Number(parsed.total) || 0,
            status: (parsed.status as Order['status']) || 'received',
            paymentStatus:
              (parsed.payment_status as Order['paymentStatus']) ||
              (parsed.paymentStatus as Order['paymentStatus']) ||
              'pending',
            paymentMethod:
              (parsed.payment_method as Order['paymentMethod']) ||
              (parsed.paymentMethod as Order['paymentMethod']) ||
              'mtn_momo',
            deliveryAddress: parsed.delivery_address || parsed.deliveryAddress || 'Accra',
            gpsLocation: parsed.gps_location || parsed.gpsLocation || '',
            preferredTime: parsed.preferred_time || parsed.preferredTime || 'Today',
            specialInstructions: parsed.special_instructions || parsed.specialInstructions || undefined,
            shopper: parsed.shopper || undefined,
            rider: parsed.rider || undefined,
            createdAt: parsed.created_at || parsed.createdAt || new Date().toISOString(),
            timeline: await fetchTimeline(
              parsed.id || orderId,
              (parsed.status as Order['status']) || 'received',
            ),
            deliveryPin: getDeliveryPin(parsed.id || parsed.order_number || orderId),
          };
        }
      } catch (e) {
        console.warn('Note parsing cached order:', e);
      }
    }

    setOrder(resolvedOrder);
    setLoading(false);
  }, [orderId, user]);

  React.useEffect(() => {
    fetchOrder();

    if (!orderId || !isUUID(orderId)) return;

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
        },
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchOrder();
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchOrder, orderId]);

  const confirmDelivery = React.useCallback(async () => {
    if (!orderId) return false;

    // 1. Update Supabase if orderId is valid UUID
    if (isUUID(orderId)) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'delivered', payment_status: 'paid' })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Error confirming delivery in Supabase:', err);
      }
    }

    // 2. Update local browser storage
    try {
      if (typeof window !== 'undefined') {
        const cachedStr =
          localStorage.getItem(`pn_order_${orderId}`) ||
          sessionStorage.getItem(`pn_order_${orderId}`);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          parsed.status = 'delivered';
          parsed.payment_status = 'paid';
          localStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
          sessionStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
        }
      }
    } catch {}

    // 3. Update local state
    setOrder((prev) =>
      prev
        ? {
            ...prev,
            status: 'delivered' as const,
            paymentStatus: 'paid' as const,
          }
        : prev,
    );
    return true;
  }, [orderId]);

  const cancelOrder = React.useCallback(async () => {
    if (!orderId) return false;

    if (isUUID(orderId)) {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', payment_status: 'refunded' })
        .eq('id', orderId);

      if (error) {
        console.error('Error cancelling order:', error);
        return false;
      }
    }

    try {
      if (typeof window !== 'undefined') {
        const cachedStr =
          localStorage.getItem(`pn_order_${orderId}`) ||
          sessionStorage.getItem(`pn_order_${orderId}`);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          parsed.status = 'cancelled';
          parsed.payment_status = 'refunded';
          localStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
          sessionStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
        }
      }
    } catch {}

    setOrder((prev) =>
      prev
        ? { ...prev, status: 'cancelled' as const, paymentStatus: 'refunded' as const }
        : prev,
    );
    return true;
  }, [orderId]);

  return { order, loading, cancelOrder, confirmDelivery, refresh: fetchOrder };
}
