'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Order, OrderItem, OrderStatus } from '@/types';
import { fetchTimeline } from '@/lib/timeline';

export interface AdminOrder extends Order {
  customerName: string;
  customerPhone: string;
  userId: string;
}

export interface AdminTeamMember {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  activeOrders: number;
  createdAt: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  totalCustomers: number;
  totalShoppers: number;
  totalRiders: number;
}

export function useAdminData() {
  const { user } = useAuth();
  const [orders, setOrders] = React.useState<AdminOrder[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<AdminTeamMember[]>([]);
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchAll = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .order('created_at', { ascending: false });

    const profilesMap = new Map<string, { full_name: string; phone: string }>();
    (profilesData ?? []).forEach((p) => {
      profilesMap.set(p.id as string, {
        full_name: p.full_name as string,
        phone: p.phone as string,
      });
    });

    const enrichedOrders: AdminOrder[] = await Promise.all(
      (ordersData ?? []).map(async (o) => {
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('id, name, budget, quantity, notes')
          .eq('order_id', o.id as string);

        const customer = profilesMap.get(o.user_id as string);
        const items: OrderItem[] = (itemsData ?? []).map((i) => ({
          id: i.id as string,
          name: i.name as string,
          budget: Number(i.budget),
          quantity: (i.quantity as string) ?? undefined,
          notes: (i.notes as string) ?? undefined,
        }));

        return {
          id: o.id as string,
          userId: o.user_id as string,
          orderNumber: o.order_number as string,
          customerName: customer?.full_name ?? 'Unknown',
          customerPhone: customer?.phone ?? '',
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
          shopper: (o.shopper_id as string) ? profilesMap.get(o.shopper_id as string)?.full_name : undefined,
          rider: (o.rider_id as string) ? profilesMap.get(o.rider_id as string)?.full_name : undefined,
          createdAt: o.created_at as string,
          timeline: await fetchTimeline(o.id as string, o.status as OrderStatus),
        };
      }),
    );

    setOrders(enrichedOrders);

    const team: AdminTeamMember[] = (profilesData ?? [])
      .filter((p) => (p.role as string) !== 'customer')
      .map((p) => {
        const activeCount = enrichedOrders.filter(
          (o) =>
            (o.status !== 'delivered' && o.status !== 'cancelled') &&
            (o.shopper === (p.full_name as string) || o.rider === (p.full_name as string)),
        ).length;
        return {
          id: p.id as string,
          fullName: p.full_name as string,
          phone: p.phone as string,
          role: p.role as string,
          activeOrders: activeCount,
          createdAt: p.created_at as string,
        };
      });

    setTeamMembers(team);

    const totalRevenue = enrichedOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((s, o) => s + o.total, 0);
    const activeCount = enrichedOrders.filter(
      (o) => o.status !== 'delivered' && o.status !== 'cancelled',
    ).length;
    const deliveredCount = enrichedOrders.filter((o) => o.status === 'delivered').length;
    const customerCount = (profilesData ?? []).filter((p) => p.role === 'customer').length;
    const shopperCount = (profilesData ?? []).filter((p) => p.role === 'shopper').length;
    const riderCount = (profilesData ?? []).filter((p) => p.role === 'rider').length;

    setStats({
      totalRevenue,
      totalOrders: enrichedOrders.length,
      activeOrders: activeCount,
      deliveredOrders: deliveredCount,
      totalCustomers: customerCount,
      totalShoppers: shopperCount,
      totalRiders: riderCount,
    });

    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAll();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchAll();
        },
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchAll();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchAll]);

  const updateOrderStatus = React.useCallback(async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) return false;
    fetchAll();
    return true;
  }, [fetchAll]);

  const assignStaff = React.useCallback(async (orderId: string, role: 'shopper_id' | 'rider_id', staffId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ [role]: staffId })
      .eq('id', orderId);
    if (error) return false;
    fetchAll();
    return true;
  }, [fetchAll]);

  return { orders, teamMembers, stats, loading, updateOrderStatus, assignStaff, refresh: fetchAll };
}
