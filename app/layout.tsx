import './globals.css';
import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { PWARegister } from '@/components/pwa-register';
import { PWAInstallBanner } from '@/components/pwa-install-banner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'Peniel Nexus — Fresh Market Shopping, Delivered',
  description:
    'Tell us what you need and how much you want to spend. We shop from the local market and deliver fresh items to your door.',
  manifest: '/manifest.webmanifest',
  themeColor: '#16a34a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Peniel Nexus',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Peniel Nexus" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans antialiased selection:bg-primary/20 selection:text-primary`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
            <PWARegister />
            <PWAInstallBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
