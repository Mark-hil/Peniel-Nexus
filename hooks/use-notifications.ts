'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Notification, OrderStatus } from '@/types';
import { getDefaultNotificationsForRole } from '@/lib/constants';
import { isUUID, generateUUID } from '@/lib/utils';

export function dispatchLocalNotification(
  userId: string | null | undefined,
  notif: {
    type: Notification['type'];
    title: string;
    message: string;
    timestamp?: string;
  },
) {
  if (typeof window === 'undefined') return;
  const userKey = userId ? `pn_custom_notifs_${userId}` : 'pn_custom_notifs_guest';
  const newNotification: Notification = {
    id: generateUUID(),
    type: notif.type,
    title: notif.title,
    message: notif.message,
    timestamp:
      notif.timestamp ||
      new Date().toLocaleString('en-GH', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    read: false,
  };

  try {
    const existing: Notification[] = JSON.parse(localStorage.getItem(userKey) || '[]');
    const updated = [newNotification, ...existing].slice(0, 50);
    localStorage.setItem(userKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('pn_notifications_updated'));
  } catch {}

  // Also try Supabase insert if logged in with real UUID
  if (userId && isUUID(userId)) {
    Promise.resolve(
      supabase.from('notifications').insert({
        user_id: userId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
      }),
    ).catch(() => {});
  }
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    const role = user?.role || 'customer';
    const defaultRoleNotifications = getDefaultNotificationsForRole(role);
    const userId = user?.id || 'guest';

    // 1. Read marked-read notification IDs for this user
    let readIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        readIds = JSON.parse(localStorage.getItem(`pn_read_notifs_${userId}`) || '[]');
      } catch {}
    }

    // 2. Read custom/dispatched notifications from localStorage
    let customNotifications: Notification[] = [];
    if (typeof window !== 'undefined') {
      try {
        const userKey = `pn_custom_notifs_${userId}`;
        const stored = localStorage.getItem(userKey);
        if (stored) {
          customNotifications = JSON.parse(stored);
        }
      } catch {}
    }

    // 3. Generate dynamic notifications from local and cached orders
    const orderNotifications: Notification[] = [];
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('pn_order_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const o = JSON.parse(raw);
              const orderNum = o.order_number || o.orderNumber || 'PN-ORDER';
              const status: OrderStatus = o.status || 'received';
              const timeStr = o.created_at
                ? new Date(o.created_at).toLocaleString('en-GH', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : 'Recent';

              const statusMap: Record<OrderStatus, { type: Notification['type']; title: string; message: string }> = {
                received: {
                  type: 'order_received',
                  title: 'Order Placed & Received',
                  message: `Your grocery order ${orderNum} has been received and queued for personal shopping.`,
                },
                accepted: {
                  type: 'order_accepted',
                  title: 'Order Confirmed by Operations',
                  message: `Order ${orderNum} has been accepted and assigned for market pickup.`,
                },
                shopping: {
                  type: 'shopping',
                  title: 'Shopper at the Market',
                  message: `A shopper is currently in the market selecting fresh produce for order ${orderNum}.`,
                },
                packing: {
                  type: 'packing',
                  title: 'Order Being Packed',
                  message: `Fresh items for order ${orderNum} are packed and ready for delivery handoff.`,
                },
                out_for_delivery: {
                  type: 'out_for_delivery',
                  title: 'Out for Delivery',
                  message: `Your order ${orderNum} is dispatched and on its way to your delivery address.`,
                },
                delivered: {
                  type: 'delivered',
                  title: 'Order Successfully Delivered',
                  message: `Order ${orderNum} has been safely delivered. Thank you for using Peniel Nexus!`,
                },
                cancelled: {
                  type: 'cancelled',
                  title: 'Order Cancelled',
                  message: `Order ${orderNum} was cancelled and any refundable balance returned.`,
                },
              };

              const config = statusMap[status] || statusMap.received;
              orderNotifications.push({
                id: `order-notif-${o.id || orderNum}-${status}`,
                type: config.type,
                title: config.title,
                message: config.message,
                timestamp: timeStr,
                read: false,
              });
            }
          }
        }
      } catch {}
    }

    // 4. Query remote Supabase notifications if authenticated with valid UUID
    let remoteNotifications: Notification[] = [];
    if (user && isUUID(user.id)) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, type, title, message, read, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          remoteNotifications = data.map((n) => ({
            id: n.id as string,
            type: n.type as Notification['type'],
            title: n.title as string,
            message: n.message as string,
            timestamp: new Date(n.created_at as string).toLocaleString('en-GH', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            read: (n.read as boolean) || readIds.includes(n.id as string),
          }));
        }
      } catch {}
    }

    // 5. Combine and deduplicate all sources:
    // Priority: Remote DB > Custom dispatched > Dynamic order updates > Role defaults
    const combinedMap = new Map<string, Notification>();

    for (const n of remoteNotifications) {
      combinedMap.set(n.id, {
        ...n,
        read: n.read || readIds.includes(n.id),
      });
    }

    for (const n of customNotifications) {
      if (!combinedMap.has(n.id)) {
        combinedMap.set(n.id, {
          ...n,
          read: n.read || readIds.includes(n.id),
        });
      }
    }

    for (const n of orderNotifications) {
      if (!combinedMap.has(n.id)) {
        combinedMap.set(n.id, {
          ...n,
          read: n.read || readIds.includes(n.id),
        });
      }
    }

    // Always merge baseline role notifications so users have rich relevant context
    for (const n of defaultRoleNotifications) {
      if (!combinedMap.has(n.id)) {
        combinedMap.set(n.id, {
          ...n,
          read: n.read || readIds.includes(n.id),
        });
      }
    }

    const merged = Array.from(combinedMap.values());
    setNotifications(merged);
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    fetchNotifications();

    // 1. Supabase Realtime channel for instant notification alerts
    const channel = supabase
      .channel(`notifications-realtime-${user?.id || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          fetchNotifications();
        },
      )
      .subscribe();

    // 2. High-responsiveness background poll (every 5 seconds) to ensure real-time notification sync
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    // 3. Local custom event listener for immediate updates within the browser session
    const handleLocalUpdate = () => {
      fetchNotifications();
    };
    window.addEventListener('pn_notifications_updated', handleLocalUpdate);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener('pn_notifications_updated', handleLocalUpdate);
    };
  }, [fetchNotifications, user?.id]);

  const markAsRead = React.useCallback(
    async (id: string) => {
      const userId = user?.id || 'guest';
      if (typeof window !== 'undefined') {
        try {
          const stored: string[] = JSON.parse(
            localStorage.getItem(`pn_read_notifs_${userId}`) || '[]',
          );
          if (!stored.includes(id)) {
            stored.push(id);
            localStorage.setItem(`pn_read_notifs_${userId}`, JSON.stringify(stored));
          }
        } catch {}
      }

      if (isUUID(id)) {
        try {
          await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);
        } catch {}
      }

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [user],
  );

  const markAllRead = React.useCallback(async () => {
    const userId = user?.id || 'guest';
    const allIds = notifications.map((n) => n.id);
    if (allIds.length === 0) return;

    if (typeof window !== 'undefined') {
      try {
        const stored: string[] = JSON.parse(
          localStorage.getItem(`pn_read_notifs_${userId}`) || '[]',
        );
        const merged = Array.from(new Set([...stored, ...allIds]));
        localStorage.setItem(`pn_read_notifs_${userId}`, JSON.stringify(merged));
      } catch {}
    }

    const validUuids = allIds.filter(isUUID);
    if (validUuids.length > 0) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', validUuids);
      } catch {}
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user, notifications]);

  const addNotification = React.useCallback(
    (notif: {
      type: Notification['type'];
      title: string;
      message: string;
      timestamp?: string;
    }) => {
      dispatchLocalNotification(user?.id, notif);
    },
    [user?.id],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllRead,
    addNotification,
    refresh: fetchNotifications,
  };
}

