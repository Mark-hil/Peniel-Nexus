import Link from 'next/link';
import { ShoppingBasket, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background lg:grid lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
              <ShoppingBasket className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">Peniel Nexus</span>
          </Link>

          <div className="max-w-md">
            <h2 className="font-display text-4xl font-bold leading-tight">
              Fresh market shopping, your budget, delivered.
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join thousands of households who get fresh produce from the local market delivered to their door — without the hassle of haggling or queues.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Set your own budget per item',
                'Pay only for what you receive',
                'Live tracking from market to door',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-bold">
                    ✓
                  </div>
                  <span className="text-primary-foreground/90">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[
                'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
                'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-primary object-cover"
                />
              ))}
            </div>
            <p className="text-sm text-primary-foreground/80">
              Trusted by 12,000+ customers
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
