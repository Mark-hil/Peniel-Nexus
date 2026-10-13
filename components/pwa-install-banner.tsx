'use client';

import * as React from 'react';
import { Download, X, Share, PlusSquare, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showIOSModal, setShowIOSModal] = React.useState(false);

  React.useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Check if dismissed recently
    const dismissedUntil = localStorage.getItem('mb_pwa_dismissed');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    // Check iOS Safari
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua);

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }

    // Handle Android/Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSModal(false);
    // Dismiss for 7 days
    localStorage.setItem('mb_pwa_dismissed', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Bottom Toast Banner on Mobile */}
      <div className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-fade-up rounded-2xl border border-primary/20 bg-background/95 p-3.5 shadow-2xl backdrop-blur-xl transition-all sm:bottom-6 sm:left-auto sm:right-6 lg:bottom-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <ShoppingBasket className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">Install Peniel Nexus</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Add to home screen for faster ordering
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button size="sm" onClick={handleInstallClick} className="h-8 rounded-lg px-3 text-xs font-semibold shadow-sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Install
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <ShoppingBasket className="h-5 w-5" />
                </div>
                <h3 className="font-display font-bold">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Install the app in seconds without using the App Store:
            </p>

            <div className="my-5 space-y-3 rounded-2xl bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  1
                </div>
                <span>
                  Tap the <strong className="inline-flex items-center gap-1 text-foreground"><Share className="inline h-4 w-4" /> Share</strong> icon in Safari toolbar.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  2
                </div>
                <span>
                  Scroll down and tap <strong className="inline-flex items-center gap-1 text-foreground"><PlusSquare className="inline h-4 w-4" /> Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  3
                </div>
                <span>Tap <strong>Add</strong> in the top-right corner.</span>
              </div>
            </div>

            <Button className="w-full" onClick={() => setShowIOSModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
