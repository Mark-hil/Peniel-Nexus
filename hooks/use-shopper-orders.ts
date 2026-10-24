'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Order, OrderItem, OrderStatus, TimelineEvent } from '@/types';
import { fetchTimeline } from '@/lib/timeline';
import { isUUID } from '@/lib/utils';

interface ShopperOrder extends Order {
  customerName: string;
  customerPhone: string;
}

export function useShopperOrders() {
  const { user, loading: authLoading } = useAuth();
  const [availableOrders, setAvailableOrders] = React.useState<ShopperOrder[]>([]);
  const [activeOrders, setActiveOrders] = React.useState<ShopperOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  const mapOrder = React.useCallback(
    (
      o: Record<string, unknown>,
      customerName: string,
      customerPhone: string,
      items: OrderItem[],
      timeline: TimelineEvent[],
    ): ShopperOrder => ({
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
      shopper: user?.fullName,
      rider: undefined,
      createdAt: o.created_at as string,
      timeline,
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

    // Local accepted orders fallback for unmigrated foreign key environments
    let localAcceptedIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        localAcceptedIds = JSON.parse(localStorage.getItem('pn_shopper_accepted') || '[]');
      } catch {}
    }

    const { data: availableData } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'received')
      .is('shopper_id', null)
      .order('created_at', { ascending: false });

    const available = (availableData ?? []).filter((o) => !localAcceptedIds.includes(o.id));

    // Also merge any locally cached received orders
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
                !available.some((o) => o.id === parsed.id) &&
                !localAcceptedIds.includes(parsed.id)
              ) {
                if (!parsed.status || parsed.status === 'received') {
                  available.unshift({
                    id: parsed.id,
                    order_number: parsed.order_number || parsed.orderNumber || 'PN-ORDER',
                    status: 'received',
                    payment_status: parsed.payment_status || parsed.paymentStatus || 'pending',
                    payment_method: parsed.payment_method || parsed.paymentMethod || 'mtn_momo',
                    delivery_address: parsed.delivery_address || parsed.deliveryAddress || 'Accra',
                    gps_location: parsed.gps_location || parsed.gpsLocation || '',
                    preferred_time: parsed.preferred_time || parsed.preferredTime || 'Today',
                    special_instructions: parsed.special_instructions || parsed.specialInstructions || null,
                    shopping_budget: Number(parsed.shopping_budget || parsed.shoppingBudget) || 0,
                    service_fee: Number(parsed.service_fee || parsed.serviceFee) || 0,
                    delivery_fee: Number(parsed.delivery_fee || parsed.deliveryFee) || 15,
                    total: Number(parsed.total) || 0,
                    shopper_id: null,
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

    let active: any[] = [];
    let done: any[] = [];

    if (isUUID(user.id)) {
      let activeQuery = supabase
        .from('orders')
        .select('*')
        .in('status', ['accepted', 'shopping', 'packing'])
        .order('created_at', { ascending: false });

      if (localAcceptedIds.length > 0) {
        activeQuery = activeQuery.or(`shopper_id.eq.${user.id},id.in.(${localAcceptedIds.join(',')})`);
      } else {
        activeQuery = activeQuery.eq('shopper_id', user.id);
      }

      const { data: activeData } = await activeQuery;

      let doneQuery = supabase
        .from('orders')
        .select('*')
        .in('status', ['out_for_delivery', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (localAcceptedIds.length > 0) {
        doneQuery = doneQuery.or(`shopper_id.eq.${user.id},id.in.(${localAcceptedIds.join(',')})`);
      } else {
        doneQuery = doneQuery.eq('shopper_id', user.id);
      }

      const { data: doneData } = await doneQuery;

      active = activeData ?? [];
      done = doneData ?? [];
    }

    const allOrders = [...available, ...active, ...done];
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

    setAvailableOrders(enriched.filter((o) => o.status === 'received'));
    setActiveOrders(enriched.filter((o) => o.status !== 'received'));
    setLoading(false);
  }, [user, authLoading, mapOrder]);

  React.useEffect(() => {
    if (authLoading) return;
    fetchOrders();

    // 1. Supabase Realtime channel for instant push updates
    const channel = supabase
      .channel('shopper-orders-realtime')
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
    
    // First try standard update with shopper_id
    let { error } = await supabase
      .from('orders')
      .update({ shopper_id: user.id, status: 'accepted' })
      .eq('id', orderId)
      .is('shopper_id', null);

    // If foreign key constraint fails because demo profile is unseeded in database:
    if (error && (error.message?.toLowerCase().includes('foreign key') || error.code === '23503')) {
      console.warn('Foreign key constraint on shopper_id detected, updating status and tracking locally:', error.message);
      const retry = await supabase
        .from('orders')
        .update({ status: 'accepted' })
        .eq('id', orderId);

      if (!retry.error) {
        error = null;
        try {
          if (typeof window !== 'undefined') {
            const stored: string[] = JSON.parse(localStorage.getItem('pn_shopper_accepted') || '[]');
            if (!stored.includes(orderId)) {
              stored.push(orderId);
              localStorage.setItem('pn_shopper_accepted', JSON.stringify(stored));
            }
          }
        } catch {}
      }
    }

    if (error) {
      console.error('Error accepting order:', error);
      return false;
    }

    await fetchOrders();
    return true;
  }, [user, fetchOrders]);

  const updateStatus = React.useCallback(async (orderId: string, status: OrderStatus) => {
    if (!isUUID(orderId)) return false;
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    // Sync localStorage cache so customer & rider see immediate status change
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`pn_order_${orderId}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          parsed.status = status;
          localStorage.setItem(`pn_order_${orderId}`, JSON.stringify(parsed));
          window.dispatchEvent(new Event('pn_notifications_updated'));
        }
      } catch {}
    }

    if (error) return false;
    fetchOrders();
    return true;
  }, [fetchOrders]);

  const earnings = React.useMemo(() => {
    const completed = activeOrders.filter((o) => o.status === 'delivered' || o.status === 'out_for_delivery');
    return {
      today: completed.reduce((s, o) => s + o.serviceFee, 0),
      week: completed.reduce((s, o) => s + o.serviceFee, 0),
      totalOrders: completed.length,
    };
  }, [activeOrders]);

  return { availableOrders, activeOrders, loading: loading || authLoading, acceptOrder, updateStatus, earnings, refresh: fetchOrders };
}
