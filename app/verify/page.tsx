'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBasket, Smartphone } from 'lucide-react';
import { AuthLayout } from '@/components/auth-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('Phone verified!', { description: 'Your account is now active.' });
      router.push('/dashboard');
    }, 900);
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
          <ShoppingBasket className="h-6 w-6" />
        </div>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Smartphone className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Verify your phone</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">+233 24 555 0142</span>.
          Enter it below to confirm your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Verification code</Label>
          <InputOTP
            maxLength={6}
            value={value}
            onChange={(v) => setValue(v)}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot className="h-12 w-12 text-lg" index={0} />
              <InputOTPSlot className="h-12 w-12 text-lg" index={1} />
              <InputOTPSlot className="h-12 w-12 text-lg" index={2} />
              <InputOTPSlot className="h-12 w-12 text-lg" index={3} />
              <InputOTPSlot className="h-12 w-12 text-lg" index={4} />
              <InputOTPSlot className="h-12 w-12 text-lg" index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t get the code?{' '}
          <button className="font-medium text-primary hover:underline">
            Resend in 0:42
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
