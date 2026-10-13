'use client';

import * as React from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isUUID } from '@/lib/utils';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
}

const DEMO_USER_UUID_MAP: Record<string, string> = {
  customer: '11111111-1111-4111-8111-111111111111',
  shopper: '22222222-2222-4222-8222-222222222222',
  rider: '33333333-3333-4333-8333-333333333333',
  admin: '44444444-4444-4444-8444-444444444444',
};

function normalizeUser(rawUser: any): AuthUser {
  let id = rawUser.id;
  const role = rawUser.role || 'customer';
  if (!isUUID(id)) {
    id = DEMO_USER_UUID_MAP[role] || '11111111-1111-4111-8111-111111111111';
    rawUser.id = id;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mb_user', JSON.stringify(rawUser));
        if (localStorage.getItem('mb_demo_user')) {
          localStorage.setItem('mb_demo_user', JSON.stringify(rawUser));
        }
        document.cookie = `mb_user_id=${encodeURIComponent(id)}; path=/; max-age=2592000; SameSite=Lax`;
      } catch {}
    }
  }
  return {
    id,
    email: rawUser.email || '',
    fullName: rawUser.fullName || '',
    phone: rawUser.phone || '',
    role,
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async (u: User) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('id', u.id)
        .maybeSingle();

      const role = data?.role ?? 'customer';

      const authUser: AuthUser = {
        id: u.id,
        email: u.email ?? '',
        fullName: data?.full_name ?? '',
        phone: data?.phone ?? '',
        role,
      };

      setUser(authUser);

      if (typeof document !== 'undefined') {
        document.cookie = `mb_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `mb_user_id=${encodeURIComponent(u.id)}; path=/; max-age=2592000; SameSite=Lax`;
        localStorage.setItem('mb_user', JSON.stringify(authUser));
      }
    } catch {
      // In offline/dev mode, keep existing session if available
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;

    // Check for saved local/dev user first for instant hydration
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('mb_user') || localStorage.getItem('mb_demo_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (mounted) setUser(normalizeUser(parsed));
        } catch {}
      }
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        if (data.session?.user) {
          fetchProfile(data.session.user).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          // If no Supabase session, check if we have a dev fallback user in localStorage
          if (typeof window !== 'undefined') {
            const savedDev = localStorage.getItem('mb_demo_user');
            if (savedDev) {
              try {
                const parsed = JSON.parse(savedDev);
                if (mounted) {
                  setUser(normalizeUser(parsed));
                  setLoading(false);
                  return;
                }
              } catch {}
            }
            // Only clear cookies if no dev user exists
            if (!localStorage.getItem('mb_demo_user')) {
              document.cookie = 'mb_role=; path=/; max-age=0; SameSite=Lax';
              document.cookie = 'mb_user_id=; path=/; max-age=0; SameSite=Lax';
            }
          }
          if (mounted) setLoading(false);
        }
      })
      .catch(() => {
        // Network/DNS error reaching Supabase (e.g. paused/offline instance)
        if (mounted) {
          if (typeof window !== 'undefined') {
            const savedDev = localStorage.getItem('mb_demo_user');
            if (savedDev) {
              try {
                setUser(normalizeUser(JSON.parse(savedDev)));
              } catch {}
            }
          }
          setLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        if (typeof document !== 'undefined') {
          document.cookie = 'mb_role=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'mb_user_id=; path=/; max-age=0; SameSite=Lax';
          localStorage.removeItem('mb_user');
          localStorage.removeItem('mb_demo_user');
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setSession(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'mb_role=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'mb_user_id=; path=/; max-age=0; SameSite=Lax';
      localStorage.removeItem('mb_user');
      localStorage.removeItem('mb_demo_user');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
