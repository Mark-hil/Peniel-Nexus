'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Order, OrderItem, OrderStatus, TimelineEvent } from '@/types';
import { fetchTimeline } from '@/lib/timeline';
import { isUUID, getDeliveryPin, verifyDeliveryPin } from '@/lib/utils';

interface RiderOrder extends Order {
  customerName: string;
  customerPhone: string;
}

export function useRiderOrders() {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = React.useState<RiderOrder[]>([]);
  const [activeOrders, setActiveOrders] = React.useState<RiderOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  const mapOrder = React.useCallback(
    (
      o: Record<string, unknown>,
      customerName: string,
      customerPhone: string,
      items: OrderItem[],
      timeline: TimelineEvent[],
    ): RiderOrder => ({
      id: o.id as string,
      orderNumber: o.order_number as string,
      customerName,
      customerPhone,
      items,
      shoppingBudget: Number(o.shopping_budget),
      serviceFee: Number(o.service_fee),
      deliveryFee: Number(o.delivery_fee),
      total: Number(o.total),
      status: o.status as OrderStatus,
      paymentStatus: o.payment_status as Order['paymentStatus'],
      paymentMethod: o.payment_method as Order['paymentMethod'],
      deliveryAddress: o.delivery_address as string,
      gpsLocation: o.gps_location as string,
      preferredTime: o.preferred_time as string,
      specialInstructions: (o.special_instructions as string) ?? undefined,
      shopper: undefined,
      rider: user?.fullName,
      createdAt: o.created_at as string,
      timeline,
      deliveryPin: getDeliveryPin((o.id as string) || (o.order_number as string)),
    }),
    [user?.fullName],
  );

  const fetchOrders = React.useCallback(async () => {
    if (!user) {
      setAvailableOrders([]);
      setActiveOrders([]);
      setLoading(false);
      return;
    }

    // Local accepted deliveries fallback for unmigrated foreign key environments
    let localAcceptedIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        localAcceptedIds = JSON.parse(localStorage.getItem('pn_rider_accepted') || '[]');
      } catch {}
    }

    const { data: availableData } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['packing', 'packed', 'ready_for_pickup'])
      .is('rider_id', null)
      .order('created_at', { ascending: true });

    const available = (availableData ?? []).filter((o) => !localAcceptedIds.includes(o.id));

    let active: any[] = [];
    let delivered: any[] = [];

    if (isUUID(user.id)) {
      let activeQuery = supabase
        .from('orders')
        .select('*')
        .in('status', ['out_for_delivery'])
        .order('created_at', { ascending: false });

      if (localAcceptedIds.length > 0) {
        activeQuery = activeQuery.or(`rider_id.eq.${user.id},id.in.(${localAcceptedIds.join(',')})`);
      } else {
        activeQuery = activeQuery.eq('rider_id', user.id);
      }

      const { data: activeData } = await activeQuery;

      let deliveredQuery = supabase
        .from('orders')
        .select('*')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false })
        .limit(20);

      if (localAcceptedIds.length > 0) {
        deliveredQuery = deliveredQuery.or(`rider_id.eq.${user.id},id.in.(${localAcceptedIds.join(',')})`);
      } else {
        deliveredQuery = deliveredQuery.eq('rider_id', user.id);
      }

      const { data: deliveredData } = await deliveredQuery;

      active = activeData ?? [];
      delivered = deliveredData ?? [];
    }

    const allOrders = [...available, ...active, ...delivered];
    const enriched = await Promise.all(
      allOrders.map(async (o) => {
        let profile: any = null;
        if (isUUID(o.user_id as string)) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', o.user_id as string)
            .maybeSingle();
          profile = data;
        }

        let itemsData: any[] = [];
        if (isUUID(o.id as string)) {
          const { data } = await supabase
            .from('order_items')
            .select('id, name, budget, quantity, notes')
            .eq('order_id', o.id as string);
          itemsData = data ?? [];
        }

        return mapOrder(
          o as Record<string, unknown>,
          profile?.full_name ?? 'Customer',
          profile?.phone ?? '',
          itemsData.map((i) => ({
            id: i.id as string,
            name: i.name as string,
            budget: Number(i.budget),
            quantity: (i.quantity as string) ?? undefined,
            notes: (i.notes as string) ?? undefined,
          })),
          await fetchTimeline(o.id as string, o.status as OrderStatus),
        );
      }),
    );

    setAvailableOrders(enriched.filter((o) => o.status === 'packing' && !localAcceptedIds.includes(o.id)));
    setActiveOrders(enriched.filter((o) => o.status === 'out_for_delivery' || o.status === 'delivered'));
    setLoading(false);
  }, [user, mapOrder]);

  React.useEffect(() => {
    fetchOrders();

    // 1. Supabase Realtime channel for instant pickup queue updates
    const channel = supabase
      .channel('rider-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        },
      )
      .subscribe();

    // 2. High-responsiveness background poll (every 4 seconds) to guarantee instant UI sync
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchOrders]);

  const acceptOrder = React.useCallback(async (orderId: string) => {
    if (!user || !isUUID(orderId) || !isUUID(user.id)) return false;

    // First try standard update with rider_id
    let { error } = await supabase
      .from('orders')
      .update({ rider_id: user.id, status: 'out_for_delivery' })
      .eq('id', orderId)
      .is('rider_id', null);

    // If foreign key constraint fails on unseeded profiles:
    if (error && (error.message?.toLowerCase().includes('foreign key') || error.code === '23503')) {
      console.warn('Foreign key constraint on rider_id detected, updating status and tracking locally:', error.message);
      const retry = await supabase
        .from('orders')
        .update({ status: 'out_for_delivery' })
        .eq('id', orderId);

      if (!retry.error) {
        error = null;
        try {
          if (typeof window !== 'undefined') {
            const stored: string[] = JSON.parse(localStorage.getItem('pn_rider_accepted') || '[]');
            if (!stored.includes(orderId)) {
              stored.push(orderId);
              localStorage.setItem('pn_rider_accepted', JSON.stringify(stored));
            }
          }
        } catch {}
      }
    }

    if (error) {
      console.error('Error accepting delivery:', error);
      return false;
    }

    await fetchOrders();
    return true;
  }, [user, fetchOrders]);

  const markDelivered = React.useCallback(async (orderId: string, inputPin?: string) => {
    if (!isUUID(orderId)) return false;

    // If a PIN is supplied, verify it
    if (inputPin !== undefined && inputPin.trim() !== '') {
      const order = activeOrders.find((o) => o.id === orderId);
      const isValid = verifyDeliveryPin(orderId, inputPin) || (order ? verifyDeliveryPin(order.orderNumber, inputPin) : false);
      if (!isValid) {
        return { success: false, error: 'Invalid delivery code. Please check with customer.' };
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);

    if (error) {
      console.error('Error marking delivered:', error);
      return { success: false, error: 'Failed to update order status.' };
    }

    await fetchOrders();
    return { success: true };
  }, [activeOrders, fetchOrders]);

  const confirmByPinOnly = React.useCallback(async (pin: string) => {
    const clean = pin.trim();
    if (!clean) return { success: false, error: 'Please enter a PIN.' };

    // Find matching order in active deliveries by PIN
    const match = activeOrders.find((o) => {
      return (
        o.status === 'out_for_delivery' &&
        (verifyDeliveryPin(o.id, clean) || verifyDeliveryPin(o.orderNumber, clean))
      );
    });

    if (!match) {
      return { success: false, error: 'No active delivery matches this 4-digit code.' };
    }

    const result = await markDelivered(match.id);
    if (result && typeof result === 'object' && result.success) {
      return { success: true, order: match };
    }
    return { success: false, error: 'Failed to confirm delivery.' };
  }, [activeOrders, markDelivered]);

  const earnings = React.useMemo(() => {
    const completed = activeOrders.filter((o) => o.status === 'delivered');
    return {
      today: completed.reduce((s, o) => s + o.deliveryFee, 0),
      week: completed.reduce((s, o) => s + o.deliveryFee, 0),
      totalDeliveries: completed.length,
    };
  }, [activeOrders]);

  return { availableOrders, activeOrders, loading, acceptOrder, markDelivered, confirmByPinOnly, earnings, refresh: fetchOrders };
}
