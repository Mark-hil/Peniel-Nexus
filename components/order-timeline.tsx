import * as React from 'react';
import {
  CheckCircle2,
  Circle,
  Package,
  ShoppingCart,
  Box,
  Bike,
  Home,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimelineEvent, OrderStatus } from '@/types';

const iconMap: Record<OrderStatus, React.ElementType> = {
  received: Clock,
  accepted: CheckCircle2,
  shopping: ShoppingCart,
  packing: Box,
  out_for_delivery: Bike,
  delivered: Home,
  cancelled: Circle,
};

export function OrderTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  const completedCount = timeline.filter((t) => t.completed).length;
  const progress = (completedCount / timeline.length) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative">
        {timeline.map((event, i) => {
          const Icon = iconMap[event.status];
          const isLast = i === timeline.length - 1;
          return (
            <div key={event.status} className="flex gap-4">
              {/* Icon + line */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    event.completed
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'my-1 w-0.5 flex-1',
                      event.completed ? 'bg-primary' : 'bg-border'
                    )}
                    style={{ minHeight: '2rem' }}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      event.completed ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {event.label}
                  </p>
                  {event.completed && event.timestamp !== '—' && (
                    <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
