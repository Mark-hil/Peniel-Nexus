'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { ChatMessage } from '@/components/chat-panel';

export function useChat(orderId: string | null, recipientId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchMessages = React.useCallback(async () => {
    if (!orderId || !user) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('id, sender_id, text, created_at')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } else {
      setMessages(
        (data ?? []).map((m) => ({
          id: m.id,
          sender: m.sender_id === user.id ? 'me' as const : 'them' as const,
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString('en-GH', {
            hour: 'numeric',
            minute: '2-digit',
          }),
        })),
      );
    }
    setLoading(false);
  }, [orderId, user]);

  React.useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = React.useCallback(
    async (text: string) => {
      if (!orderId || !user || !recipientId || !text.trim()) return;

      const tempId = Date.now().toString();
      const now = new Date().toLocaleTimeString('en-GH', {
        hour: 'numeric',
        minute: '2-digit',
      });

      setMessages((prev) => [
        ...prev,
        { id: tempId, sender: 'me', text: text.trim(), time: now },
      ]);

      const { error } = await supabase.from('messages').insert({
        order_id: orderId,
        recipient_id: recipientId,
        text: text.trim(),
      });

      if (error) {
        console.error('Error sending message:', error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [orderId, user, recipientId],
  );

  React.useEffect(() => {
    if (!orderId || !user) return;

    const channel = supabase
      .channel(`messages:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as { id: string; sender_id: string; text: string; created_at: string };
          if (newMsg.sender_id === user.id) return;
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              sender: 'them',
              text: newMsg.text,
              time: new Date(newMsg.created_at).toLocaleTimeString('en-GH', {
                hour: 'numeric',
                minute: '2-digit',
              }),
            },
          ]);
        },
      )
      .subscribe();

    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [orderId, user, fetchMessages]);

  return { messages, sendMessage, loading, refresh: fetchMessages };
}
