'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import type { SavedAddress } from '@/types';

export function useSavedAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = React.useState<SavedAddress[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchAddresses = React.useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('saved_addresses')
      .select('id, label, address, gps')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } else {
      setAddresses(data ?? []);
    }
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = React.useCallback(
    async (addr: Omit<SavedAddress, 'id'>): Promise<SavedAddress | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('saved_addresses')
        .insert({ label: addr.label, address: addr.address, gps: addr.gps })
        .select('id, label, address, gps')
        .single();

      if (error) {
        console.error('Error adding address:', error);
        return null;
      }

      const newAddr = data as SavedAddress;
      setAddresses((prev) => [newAddr, ...prev]);
      return newAddr;
    },
    [user],
  );

  const updateAddress = React.useCallback(
    async (id: string, updates: Partial<Omit<SavedAddress, 'id'>>) => {
      const { error } = await supabase
        .from('saved_addresses')
        .update({
          label: updates.label,
          address: updates.address,
          gps: updates.gps,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating address:', error);
        return;
      }

      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  const removeAddress = React.useCallback(
    async (id: string) => {
      const { error } = await supabase.from('saved_addresses').delete().eq('id', id);

      if (error) {
        console.error('Error deleting address:', error);
        return;
      }

      setAddresses((prev) => prev.filter((a) => a.id !== id));
    },
    [],
  );

  return { addresses, addAddress, updateAddress, removeAddress, loading, refresh: fetchAddresses };
}
