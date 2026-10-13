'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBasket, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [confirmError, setConfirmError] = React.useState<string | null>(null);

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (confirmError) setConfirmError(null);
    if (value && password && value !== password) {
      setConfirmError('Passwords do not match.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setConfirmError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            phone,
          },
        },
      });

      if (error) {
        if (error.message?.includes('fetch') || (error as any).name === 'AuthRetryableFetchError') {
          toast.error('Unable to reach Supabase backend', {
            description: 'The Supabase project in .env is unreachable (DNS/Network). Please configure an active Supabase project.',
          });
          return;
        }
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('Account created!', {
          description: 'You are now signed in.',
        });
        router.push('/dashboard');
      }
    } catch {
      toast.error('Unable to reach Supabase backend', {
        description: 'Network error connecting to Supabase database. Please check NEXT_PUBLIC_SUPABASE_URL in .env.',
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
        <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start ordering fresh market items in minutes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="Ama"
                className="pl-9"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Owusu"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+233 24 555 0142"
              className="pl-9"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              className="px-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Must be at least 8 characters with a number.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              className="px-9"
              value={confirmPassword}
              onChange={handleConfirmChange}
              required
              aria-invalid={!!confirmError}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmError ? (
            <p className="text-xs text-destructive">{confirmError}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Both passwords must match.</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="terms" className="mt-0.5" required />
          <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" className="font-medium text-primary hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
