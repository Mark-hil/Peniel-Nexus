'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { Notification } from '@/types';
import { isUUID } from '@/lib/utils';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Read locally marked-read notification IDs for this user
    let readIds: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        readIds = JSON.parse(localStorage.getItem(`pn_read_notifs_${user.id}`) || '[]');
      } catch {}
    }

    if (!isUUID(user.id)) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, title, message, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) {
      setNotifications([]);
    } else {
      setNotifications(
        data.map((n) => ({
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
        })),
      );
    }
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

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchNotifications, user?.id]);

  const markAsRead = React.useCallback(async (id: string) => {
    if (user && typeof window !== 'undefined') {
      try {
        const stored: string[] = JSON.parse(localStorage.getItem(`pn_read_notifs_${user.id}`) || '[]');
        if (!stored.includes(id)) {
          stored.push(id);
          localStorage.setItem(`pn_read_notifs_${user.id}`, JSON.stringify(stored));
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
  }, [user]);

  const markAllRead = React.useCallback(async () => {
    if (!user) return;
    const allIds = notifications.map((n) => n.id);
    if (allIds.length === 0) return;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`pn_read_notifs_${user.id}`, JSON.stringify(allIds));
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllRead,
    refresh: fetchNotifications,
  };
}
