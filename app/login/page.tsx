'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBasket, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { env } from '@/lib/config';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message?.includes('fetch') || (error as any).name === 'AuthRetryableFetchError') {
          toast.error('Unable to connect to Supabase backend', {
            description: `The Supabase project in .env (${env.supabaseUrl}) cannot be reached. Please check your credentials or test with Quick Test Personas below.`,
          });
          return;
        }
        toast.error(error.message);
        return;
      }

      let destination = '/dashboard';
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = profile?.role || (data.user.user_metadata?.role as string) || 'customer';
        if (typeof document !== 'undefined') {
          document.cookie = `mb_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `mb_user_id=${encodeURIComponent(data.user.id)}; path=/; max-age=2592000; SameSite=Lax`;
        }
        if (role === 'shopper') destination = '/shopper';
        else if (role === 'rider') destination = '/rider';
        else if (role === 'admin') destination = '/admin';
      }

      toast.success('Welcome back!', { description: 'You are now signed in.' });
      router.push(destination);
    } catch {
      toast.error('Unable to connect to Supabase', {
        description: 'Network error reaching Supabase database. Please check NEXT_PUBLIC_SUPABASE_URL in .env.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
          <ShoppingBasket className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to your account to continue shopping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="ama.owusu@gmail.com"
              className="pl-9"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="px-9"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" defaultChecked />
          <Label htmlFor="remember" className="text-sm text-muted-foreground">
            Keep me signed in for 30 days
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/30 hover:border-primary hover:bg-primary/5 text-foreground font-medium"
          size="lg"
          onClick={() => router.push('/dashboard/new-order')}
        >
          🛒 Order as Guest (No Login Required)
        </Button>
      </form>

      {process.env.NODE_ENV !== 'production' && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-xs font-semibold text-muted-foreground">
                ⚡ Quick Test Personas (Dev Only)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              {
                role: 'Customer',
                name: 'Ama Owusu',
                email: env.demoCustomerEmail,
                password: env.demoPassword,
                dest: '/dashboard',
                color: 'border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500',
                badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
              },
              {
                role: 'Shopper',
                name: 'Yaw Boateng',
                email: env.demoShopperEmail,
                password: env.demoPassword,
                dest: '/shopper',
                color: 'border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500',
                badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
              },
              {
                role: 'Rider',
                name: 'Kofi Asante',
                email: env.demoRiderEmail,
                password: env.demoPassword,
                dest: '/rider',
                color: 'border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500',
                badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
              },
              {
                role: 'Admin',
                name: 'Admin Manager',
                email: env.demoAdminEmail,
                password: env.demoPassword,
                dest: '/admin',
                color: 'border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500',
                badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
              },
            ].map((persona) => (
              <button
                key={persona.role}
                type="button"
                onClick={async () => {
                  setEmail(persona.email);
                  setPassword(persona.password);
                  setLoading(true);

                  const role = persona.role.toLowerCase();
                  const demoUserUuidMap: Record<string, string> = {
                    customer: '11111111-1111-4111-8111-111111111111',
                    shopper: '22222222-2222-4222-8222-222222222222',
                    rider: '33333333-3333-4333-8333-333333333333',
                    admin: '44444444-4444-4444-8444-444444444444',
                  };
                  const demoUser = {
                    id: demoUserUuidMap[role] || '11111111-1111-4111-8111-111111111111',
                    email: persona.email,
                    fullName: persona.name,
                    phone: '+233 24 555 0142',
                    role,
                  };

                  // Clear previous session if switching personas so previous session does not linger
                  await supabase.auth.signOut().catch(() => {});

                  // Establish session cookies immediately for middleware and auth provider
                  if (typeof document !== 'undefined') {
                    document.cookie = `mb_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax`;
                    document.cookie = `mb_user_id=${encodeURIComponent(demoUser.id)}; path=/; max-age=2592000; SameSite=Lax`;
                    localStorage.setItem('mb_user', JSON.stringify(demoUser));
                    localStorage.setItem('mb_demo_user', JSON.stringify(demoUser));
                  }

                  try {
                    // Try real Supabase auth if remote host is available
                    const { error } = await supabase.auth.signInWithPassword({
                      email: persona.email,
                      password: persona.password,
                    });
                    if (error && !error.message?.includes('fetch')) {
                      const { error: signUpError } = await supabase.auth.signUp({
                        email: persona.email,
                        password: persona.password,
                        options: {
                          data: {
                            full_name: persona.name,
                            role,
                          },
                        },
                      });
                      if (!signUpError) {
                        await supabase.auth.signInWithPassword({
                          email: persona.email,
                          password: persona.password,
                        });
                      }
                    }
                  } catch {
                    // Supabase offline/unreachable: graceful fallback to local dev session
                  }

                  toast.success(`Welcome, ${persona.name}!`, {
                    description: `Switched to ${persona.role} portal.`,
                  });
                  router.push(persona.dest);
                  setLoading(false);
                }}
                className={cn(
                  'flex flex-col items-start rounded-xl border p-2.5 text-left transition-all active:scale-95',
                  persona.color
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-foreground">{persona.role}</span>
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', persona.badge)}>
                    Demo
                  </span>
                </div>
                <span className="mt-0.5 text-[11px] text-muted-foreground truncate w-full">
                  {persona.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
