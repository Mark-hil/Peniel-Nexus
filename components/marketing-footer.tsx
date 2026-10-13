import Link from 'next/link';
import { ShoppingBasket, Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/#how-it-works' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '/#faq' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  Account: [
    { label: 'Sign In', href: '/login' },
    { label: 'Create Account', href: '/register' },
    { label: 'Track Order', href: '/dashboard/orders' },
    { label: 'Admin Portal', href: '/admin' },
    { label: 'Shopper Portal', href: '/shopper' },
    { label: 'Rider Portal', href: '/rider' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShoppingBasket className="h-5 w-5" />
              </div>
              <span className="font-display text-lg font-bold">Peniel Nexus</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Fresh market shopping delivered to your doorstep. Tell us what you need and your budget — we handle the rest.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold">{title}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Peniel Nexus. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care in Accra, Ghana
          </p>
        </div>
      </div>
    </footer>
  );
}
