import Link from 'next/link';
import { ShoppingBasket, ArrowLeft } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata = {
  title: 'Terms of Service — Peniel Nexus',
  description: 'The terms and conditions that govern your use of Peniel Nexus.',
};

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: [
      'By creating an account, placing an order, or otherwise using the Peniel Nexus platform (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree with any part of these Terms, you may not access or use the Service.',
      'Peniel Nexus may revise these Terms from time to time. The most current version will always be posted on this page, and the "Last updated" date at the top will reflect the most recent change. Continued use of the Service after any update constitutes acceptance of the revised Terms.',
    ],
  },
  {
    id: 'eligibility',
    title: '2. Eligibility & Accounts',
    body: [
      'You must be at least 18 years old and legally capable of entering into binding contracts to use the Service. By registering, you confirm that the information you provide — including your name, email, phone number, and delivery address — is accurate and complete.',
      'You are responsible for safeguarding your account credentials and for all activity that occurs under your account. Notify us immediately at support@penielnexus.com of any unauthorized use or security breach.',
    ],
  },
  {
    id: 'orders',
    title: '3. Orders, Budgets & Fulfillment',
    body: [
      'Peniel Nexus is a personal shopping and delivery service. You submit a shopping list with the items you want and the budget you are willing to spend on each item. Our shoppers and riders then purchase and deliver those items on your behalf.',
      'Because market prices fluctuate, the final amount you pay may differ from your stated budget. If the actual cost of an item exceeds your budget, our shopper will attempt to find the best available option within your budget or contact you for guidance. If an item is unavailable, you will not be charged for it.',
      'You may cancel an order at any time before a shopper has begun purchasing your items. Cancellations after shopping has commenced may be subject to a restocking fee equal to the work already performed.',
    ],
  },
  {
    id: 'payments',
    title: '4. Payments & Fees',
    body: [
      'You authorize Peniel Nexus to charge the payment method on file for the total cost of items purchased on your behalf, plus any applicable delivery fees, service fees, and tips. A full breakdown of charges is provided before you confirm each order.',
      'Unless otherwise required by law, all payments are non-refundable once an order has been delivered. If you believe a charge is incorrect, contact us within 48 hours of delivery and we will investigate in good faith.',
    ],
  },
  {
    id: 'conduct',
    title: '5. Acceptable Use',
    body: [
      'You agree not to use the Service to: (a) submit unlawful, fraudulent, or misleading orders; (b) abuse, harass, or threaten our shoppers, riders, or staff; (c) attempt to manipulate prices or budgets in bad faith; (d) resell items purchased through the Service without our written consent; or (e) interfere with the proper functioning of the platform.',
      'Violations may result in immediate suspension or termination of your account, in addition to any legal remedies available to us.',
    ],
  },
  {
    id: 'liability',
    title: '6. Limitation of Liability',
    body: [
      'Peniel Nexus acts as an intermediary between you and local market vendors. We do not grow, manufacture, or warrant the quality, freshness, or safety of the items purchased on your behalf. To the fullest extent permitted by law, the Service is provided "as is" and "as available," without warranties of any kind.',
      'In no event shall Peniel Nexus be liable for indirect, incidental, special, or consequential damages, or for any amount greater than the total you paid for the order giving rise to the claim.',
    ],
  },
  {
    id: 'termination',
    title: '7. Termination',
    body: [
      'You may close your account at any time from your account settings. Peniel Nexus may suspend or terminate your access to the Service at any time, with or without cause, and without prior notice.',
      'Upon termination, all provisions of these Terms that by their nature should survive — including ownership, warranty disclaimers, and limitation of liability — will remain in effect.',
    ],
  },
  {
    id: 'governing-law',
    title: '8. Governing Law',
    body: [
      'These Terms are governed by the laws of the Republic of Ghana, without regard to its conflict of law principles. Any dispute arising out of or relating to these Terms shall be resolved exclusively in the courts located in Accra, Ghana.',
    ],
  },
  {
    id: 'contact',
    title: '9. Contact Us',
    body: [
      'If you have any questions about these Terms, you can reach us at support@penielnexus.com or by mail at: Peniel Nexus, Independence Avenue, Accra, Ghana.',
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to registration
        </Link>

        <div className="mt-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBasket className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="mt-1 text-sm text-muted-foreground">Last updated: July 9, 2026</p>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          These Terms of Service govern your use of the Peniel Nexus platform. Please read them carefully — they form the agreement between you and Peniel Nexus each time you use the Service.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="font-display text-xl font-semibold tracking-tight">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="font-display text-base font-semibold">Related documents</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our{' '}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>{' '}
            explains how we collect, use, and protect your personal information.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
