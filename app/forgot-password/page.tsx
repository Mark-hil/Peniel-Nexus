'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBasket, Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        toast.success('Reset link sent', { description: 'Check your email for instructions.' });
      }
    } catch {
      toast.error('Could not send reset link. Please try again.');
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Forgot password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sent
            ? 'We sent a reset link to your email. It may take a minute to arrive.'
            : 'No worries — enter your email and we&apos;ll send a reset link.'}
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
            <Mail className="mx-auto h-8 w-8 text-success" />
            <p className="mt-3 text-sm font-medium">Email sent</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check your inbox and follow the link to reset your password.
            </p>
          </div>
          <Button className="w-full" size="lg" asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
          <button
            onClick={() => setSent(false)}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Didn&apos;t receive it? Resend
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
