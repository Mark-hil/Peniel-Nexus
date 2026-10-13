'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: 'fade-up' | 'fade-in' | 'scale-in' | 'slide-in-right';
  as?: React.ElementType;
};

export function Reveal({
  children,
  className,
  delay = 0,
  animation = 'fade-up',
  as: Tag = 'div',
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn(
        'transition-all',
        visible ? `animate-${animation}` : 'opacity-0',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
