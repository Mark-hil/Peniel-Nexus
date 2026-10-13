import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/config';

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Custom lock bypass to prevent NavigatorLockAcquireTimeoutError in browser
    // when fast re-renders, visibility changes, or concurrent tabs trigger immediate lock acquisition
    lock: async (_name, _acquireTimeout, fn) => {
      return await fn();
    },
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string;
          role?: string;
          avatar_url?: string | null;
        };
        Update: {
          full_name?: string;
          phone?: string;
          avatar_url?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: string;
          payment_status: string;
          payment_method: string;
          delivery_address: string;
          gps_location: string;
          preferred_time: string;
          special_instructions: string | null;
          shopping_budget: number;
          service_fee: number;
          delivery_fee: number;
          total: number;
          shopper_id: string | null;
          rider_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          order_number: string;
          status?: string;
          payment_status?: string;
          payment_method?: string;
          delivery_address: string;
          gps_location: string;
          preferred_time: string;
          special_instructions?: string | null;
          shopping_budget?: number;
          service_fee?: number;
          delivery_fee?: number;
          total?: number;
          shopper_id?: string | null;
          rider_id?: string | null;
        };
        Update: {
          status?: string;
          payment_status?: string;
          shopper_id?: string | null;
          rider_id?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          name: string;
          budget: number;
          quantity: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          name: string;
          budget: number;
          quantity?: string | null;
          notes?: string | null;
        };
        Update: {
          name?: string;
          budget?: number;
          quantity?: string | null;
          notes?: string | null;
        };
      };
      saved_addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address: string;
          gps: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          label: string;
          address: string;
          gps: string;
        };
        Update: {
          label?: string;
          address?: string;
          gps?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          order_id: string;
          sender_id: string;
          recipient_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sender_id?: string;
          recipient_id: string;
          text: string;
        };
        Update: {};
      };
      ratings: {
        Row: {
          id: string;
          order_id: string;
          rater_id: string;
          shopper_rating: number;
          rider_rating: number;
          delivery_rating: number;
          would_recommend: boolean | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          rater_id?: string;
          shopper_rating: number;
          rider_rating: number;
          delivery_rating: number;
          would_recommend?: boolean | null;
          comment?: string | null;
        };
        Update: {
          shopper_rating?: number;
          rider_rating?: number;
          delivery_rating?: number;
          would_recommend?: boolean | null;
          comment?: string | null;
        };
      };
    };
  };
};
