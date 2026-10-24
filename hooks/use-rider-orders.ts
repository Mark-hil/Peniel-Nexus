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
  const { user, loading: authLoading } = useAuth();
  const [availableOrders, setAvailableOrders] = React.useState<RiderOrder[]>([]);
  const [activeOrders, setActiveOrders] = React.useState<RiderOrder[]>([]);
  const [preparingOrders, setPreparingOrders] = React.useState<{ id: string; orderNumber: string; status: OrderStatus; preferredTime: string }[]>([]);
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
    if (authLoading) {
      return;
    }

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

    // 1. Fetch available orders ready for pickup from Supabase
    const { data: availableData } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['packing', 'packed', 'ready_for_pickup'])
      .is('rider_id', null)
      .order('created_at', { ascending: false });

    const available: any[] = [...(availableData ?? [])];

    // 2. Also merge any locally cached packed orders (guest or dev test orders)
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('pn_order_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (
                parsed.id &&
                !available.some((o) => o.id === parsed.id)
              ) {
                if (['packing', 'packed', 'ready_for_pickup'].includes(parsed.status)) {
                  available.unshift({
                    id: parsed.id,
                    order_number: parsed.order_number || parsed.orderNumber || 'PN-ORDER',
                    status: 'packing',
                    payment_status: parsed.payment_status || parsed.paymentStatus || 'paid',
                    payment_method: parsed.payment_method || parsed.paymentMethod || 'mtn_momo',
                    delivery_address: parsed.delivery_address || parsed.deliveryAddress || 'Accra',
                    gps_location: parsed.gps_location || parsed.gpsLocation || '',
                    preferred_time: parsed.preferred_time || parsed.preferredTime || 'Today',
                    special_instructions: parsed.special_instructions || parsed.specialInstructions || null,
                    shopping_budget: Number(parsed.shopping_budget || parsed.shoppingBudget) || 0,
                    service_fee: Number(parsed.service_fee || parsed.serviceFee) || 0,
                    delivery_fee: Number(parsed.delivery_fee || parsed.deliveryFee) || 15,
                    total: Number(parsed.total) || 0,
                    shopper_id: parsed.shopper_id || null,
                    rider_id: null,
                    created_at: parsed.created_at || parsed.createdAt || new Date().toISOString(),
                    user_id: parsed.user_id || null,
                  });
                }
              }
            }
          }
        }
      } catch {}
    }

    // 3. Fetch orders in preparation (received, accepted, shopping) so riders can monitor upcoming workload
    const { data: prepData } = await supabase
      .from('orders')
      .select('id, order_number, status, preferred_time')
      .in('status', ['received', 'accepted', 'shopping'])
      .order('created_at', { ascending: false });

    if (prepData) {
      setPreparingOrders(
        prepData.map((p) => ({
          id: p.id,
          orderNumber: p.order_number,
          status: p.status as OrderStatus,
          preferredTime: p.preferred_time,
        }))
      );
    }

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

    // Active order IDs assigned to this rider
    const activeOrderIds = new Set(active.map((o) => o.id));

    // Exclude orders that are already active for this rider
    const unacceptedAvailable = available.filter((o) => !activeOrderIds.has(o.id));

    const allOrders = [...unacceptedAvailable, ...active, ...delivered];
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

    setAvailableOrders(
      enriched.filter(
        (o) =>
          ['packing', 'packed', 'ready_for_pickup'].includes(o.status) &&
          !activeOrderIds.has(o.id)
      )
    );
    setActiveOrders(enriched.filter((o) => o.status === 'out_for_delivery' || o.status === 'delivered'));
    setLoading(false);
  }, [user, authLoading, mapOrder]);

  React.useEffect(() => {
    if (authLoading) return;
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
  }, [fetchOrders, authLoading]);

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

    // Sync local storage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`pn_order_${orderId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.status = 'out_for_delivery';
          parsed.rider = user.fullName;
          localStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
        }
      } catch {}
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

    // Sync local storage cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`pn_order_${orderId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.status = 'delivered';
          localStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
          window.dispatchEvent(new Event('pn_notifications_updated'));
        }
      } catch {}
    }

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

  // Dev helper to fast-forward an order in prep into the rider's pickup queue
  const fastForwardToPacked = React.useCallback(async (orderId: string) => {
    if (!isUUID(orderId)) return false;
    await supabase.from('orders').update({ status: 'packing' }).eq('id', orderId);
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`pn_order_${orderId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.status = 'packing';
          localStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
        }
      } catch {}
    }
    await fetchOrders();
    return true;
  }, [fetchOrders]);

  const earnings = React.useMemo(() => {
    const completed = activeOrders.filter((o) => o.status === 'delivered');
    return {
      today: completed.reduce((s, o) => s + o.deliveryFee, 0),
      week: completed.reduce((s, o) => s + o.deliveryFee, 0),
      totalDeliveries: completed.length,
    };
  }, [activeOrders]);

  return {
    availableOrders,
    activeOrders,
    preparingOrders,
    loading: loading || authLoading,
    acceptOrder,
    markDelivered,
    confirmByPinOnly,
    fastForwardToPacked,
    earnings,
    refresh: fetchOrders,
  };
}
