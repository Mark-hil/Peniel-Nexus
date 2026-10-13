import Link from 'next/link';
import { ShoppingBasket, ArrowLeft } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';

export const metadata = {
  title: 'Privacy Policy — Peniel Nexus',
  description: 'How Peniel Nexus collects, uses, and protects your personal information.',
};

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    body: [
      'Peniel Nexus ("we", "us", or "our") respects your privacy. This Privacy Policy explains what personal information we collect, how we use it, and the choices you have. It applies to our website, mobile apps, and the personal shopping and delivery services we provide (collectively, the "Service").',
      'By using the Service, you consent to the practices described in this policy. If you do not agree with these practices, please do not use the Service.',
    ],
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    body: [
      'Information you provide: When you create an account or place an order, we collect your name, email address, phone number, delivery address, and payment method details. We also receive any notes or instructions you share with your shopper.',
      'Information collected automatically: When you use the Service, we collect device identifiers, approximate location (used to route deliveries), IP address, and usage data such as the pages you view and the actions you take within the app.',
      'Information from third parties: We may receive supplementary information from payment processors and from our delivery partners (for example, GPS coordinates shared by a rider while your order is in transit).',
    ],
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    body: [
      'We use your information to: (a) create and manage your account; (b) process and fulfill your orders, including routing deliveries and contacting you about your order; (c) verify your identity and prevent fraud; (d) respond to support requests; and (e) improve our Service, personalize recommendations, and develop new features.',
      'With your separate consent, we may also send you marketing communications. You can opt out at any time from your account settings or by following the unsubscribe link in any marketing email.',
    ],
  },
  {
    id: 'sharing',
    title: '4. How We Share Your Information',
    body: [
      'We share your information only as needed to operate the Service: with shoppers and riders assigned to your orders (name, address, phone, and order details), with payment processors to charge your payment method, and with service providers that help us run the platform (for example, SMS and email delivery providers).',
      'We may also disclose your information when required by law, or to protect the rights, property, or safety of Peniel Nexus, our users, or others. We never sell your personal information to third parties.',
    ],
  },
  {
    id: 'retention',
    title: '5. Data Retention',
    body: [
      'We keep your personal information for as long as your account is active, and for as long afterwards as needed to comply with legal obligations, resolve disputes, and enforce our agreements. Order records are typically retained for seven years for tax and accounting purposes.',
      'You may request deletion of your account at any time from your account settings. Certain information may be retained as required by law even after account deletion.',
    ],
  },
  {
    id: 'security',
    title: '6. Security',
    body: [
      'We use industry-standard safeguards to protect your information, including encryption in transit (TLS) and at rest, and strict access controls for our internal team. No method of transmission or storage is perfectly secure, but we work hard to protect your data and to respond promptly to any security incident.',
    ],
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    body: [
      'Depending on where you live, you may have the right to access, correct, export, or delete the personal information we hold about you, and to object to or restrict certain processing. To exercise any of these rights, contact us at privacy@penielnexus.example.',
      'We will respond to your request within 30 days and will not charge a fee unless your request is manifestly unfounded or excessive.',
    ],
  },
  {
    id: 'children',
    title: '8. Children\u2019s Privacy',
    body: [
      'The Service is not directed to children under 18, and we do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us and we will promptly delete it.',
    ],
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. For material changes, we will also provide a more prominent notice (for example, by email or an in-app banner) before the change takes effect.',
    ],
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    body: [
      'If you have any questions about this Privacy Policy or how we handle your data, please contact our Data Protection Officer at privacy@penielnexus.example or by mail at: Peniel Nexus, Independence Avenue, Accra, Ghana.',
    ],
  },
];

export default function PrivacyPage() {
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
            <h1 className="font-display text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mt-1 text-sm text-muted-foreground">Last updated: July 9, 2026</p>
          </div>
        </div>

        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Your privacy matters to us. This Privacy Policy describes what information Peniel Nexus collects, how we use it, and the controls you have over your data.
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
            <Link href="/terms" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            describe the rules that govern your use of the Service.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
