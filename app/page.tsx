import Link from 'next/link';
import {
  ArrowRight,
  ClipboardList,
  Wallet,
  Truck,
  Star,
  Shield,
  Clock,
  MapPin,
  Quote,
  Sparkles,
} from 'lucide-react';
import { MarketingHeader } from '@/components/marketing-header';
import { MarketingFooter } from '@/components/marketing-footer';
import { Reveal } from '@/components/reveal';
import { AnimatedCounter } from '@/components/animated-counter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { popularItems, testimonials, faqItems } from '@/lib/constants';

const steps = [
  {
    icon: ClipboardList,
    title: 'Create your shopping list',
    description: 'Add the items you need — tomatoes, fish, yam, anything from the local market.',
  },
  {
    icon: Wallet,
    title: 'Set your budget for each item',
    description: 'Tell us how much you want to spend on each item. No catalog, no fixed prices.',
  },
  {
    icon: Truck,
    title: 'We buy and deliver',
    description: 'Our personal shoppers buy fresh from the market and a rider brings it to your door.',
  },
];

const stats = [
  { value: 12000, suffix: '+', label: 'Orders delivered' },
  { value: 49, suffix: '/5', label: 'Customer rating', prefix: '4.' },
  { value: 45, suffix: ' min', label: 'Avg delivery time' },
  { value: 3, suffix: '', label: 'Cities served' },
];

const features = [
  { icon: Shield, title: 'Pay only for what you get', description: 'Unused budget is refunded instantly to your wallet.' },
  { icon: Clock, title: 'Flexible delivery times', description: 'Choose a window that works for your schedule.' },
  { icon: MapPin, title: 'Live order tracking', description: 'Follow your order from market to your doorstep.' },
];

const heroItems = [
  { name: 'Tomatoes', budget: 'GHS 20', emoji: '🍅' },
  { name: 'Onions', budget: 'GHS 10', emoji: '🧅' },
  { name: 'Pepper', budget: 'GHS 5', emoji: '🌶️' },
  { name: 'Fish', budget: 'GHS 50', emoji: '🐟' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-blob" />
          <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute left-1/3 top-40 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl animate-blob animation-delay-4000" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pb-28 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal animation="fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Now serving Accra, Kumasi & Tema
              </div>
            </Reveal>

            <Reveal animation="fade-up" delay={100}>
              <h1 className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Fresh Market Shopping Delivered to Your{' '}
                <span className="relative inline-block text-primary">
                  Doorstep
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9C50 3 150 3 298 7"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="text-primary/40"
                    />
                  </svg>
                </span>
              </h1>
            </Reveal>

            <Reveal animation="fade-up" delay={200}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
                Tell us what you need and how much you want to spend. We shop from the local market and deliver fresh items to you.
              </p>
            </Reveal>

            <Reveal animation="fade-up" delay={300}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-12 px-8 text-base shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                  <Link href="/dashboard/orders/new">
                    Start Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
                  <Link href="/#how-it-works">How It Works</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          {/* Hero visual card */}
          <Reveal animation="scale-in" delay={400}>
            <div className="mx-auto mt-16 max-w-4xl">
              <Card className="overflow-hidden border-border/60 shadow-2xl shadow-primary/5">
                <div className="grid gap-0 sm:grid-cols-2">
                  <div className="border-b border-border/60 bg-muted/30 p-6 sm:border-b-0 sm:border-r">
                    <p className="text-sm font-semibold text-muted-foreground">Your Shopping List</p>
                    <div className="mt-4 space-y-3">
                      {heroItems.map((item, i) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-3 animate-slide-in-right"
                          style={{ animationDelay: `${600 + i * 120}ms` }}
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-lg">{item.emoji}</span>
                            {item.name}
                          </span>
                          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {item.budget}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground">Order Summary</p>
                    <div className="mt-4 space-y-2.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Shopping Budget</span><span className="font-medium">GHS 85.00</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Service Fee (10%)</span><span className="font-medium">GHS 8.50</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Delivery Fee</span><span className="font-medium">GHS 15.00</span></div>
                      <div className="border-t border-border/60 pt-2.5 flex justify-between text-base font-semibold"><span>Estimated Total</span><span>GHS 108.50</span></div>
                    </div>
                    <Button className="mt-5 w-full shadow-md shadow-primary/20 transition-transform hover:scale-[1.02]" size="lg">
                      Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-3.5 w-3.5" />
                      Secure payment via Mobile Money or Card
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Reveal>

          {/* Stats with animated counters */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} animation="fade-up" delay={i * 100}>
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-primary sm:text-4xl">
                    <AnimatedCounter
                      value={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix ?? ''}
                    />
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="border-y border-border/60 bg-primary/5 py-4 marquee-pause">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
            {[...popularItems, ...popularItems].map((item, i) => (
              <div key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-medium text-muted-foreground">
                <span className="text-xl">{item.emoji}</span>
                {item.name}
                <span className="text-primary/40">·</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">How It Works</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Three simple steps to fresh delivery
              </h2>
              <p className="mt-4 text-muted-foreground">
                No catalog browsing. No fixed prices. Just tell us your budget and we do the shopping.
              </p>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} animation="fade-up" delay={i * 150}>
                  <div className="group relative">
                    <div className="absolute -top-3 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                      {i + 1}
                    </div>
                    <Card className="h-full border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                      <CardContent className="p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Feature highlights */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} animation="fade-up" delay={i * 100}>
                  <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-primary/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular items */}
      <section id="popular-items" className="border-t border-border/60 bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal animation="fade-up">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">Popular Items</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  What customers order most
                </h2>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/orders/new">
                  Start your list
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {popularItems.map((item, i) => (
              <Reveal key={item.name} animation="scale-in" delay={i * 60}>
                <Card className="group cursor-pointer border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-3xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/10">
                      {item.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <p className="mt-1 text-sm font-medium text-primary">{item.price}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal animation="fade-up">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Loved by households across Ghana
              </h2>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} animation="fade-up" delay={i * 150}>
                <Card className="h-full border-border/60 transition-shadow duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-primary/20" />
                    <p className="mt-4 text-sm leading-relaxed text-foreground/90">{t.quote}</p>
                    <div className="mt-6 flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={t.avatar} />
                        <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                      <div className="ml-auto flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star
                            key={j}
                            className="h-3.5 w-3.5 fill-amber-400 text-amber-400 animate-scale-in"
                            style={{ animationDelay: `${i * 150 + j * 80}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/60 bg-muted/20 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal animation="fade-up">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
            </div>
          </Reveal>

          <Reveal animation="fade-up" delay={100}>
            <Accordion type="single" collapsible className="mt-12 space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="overflow-hidden rounded-xl border border-border/60 bg-background px-5 transition-colors hover:border-primary/30"
                >
                  <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal animation="scale-in" delay={200}>
            <div className="relative mt-10 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative">
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Get started free
                </div>
                <h3 className="font-display text-2xl font-bold">Ready to start shopping?</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Create your first order in minutes. Fresh market items, your budget, delivered.
                </p>
                <Button size="lg" asChild className="mt-5 shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
