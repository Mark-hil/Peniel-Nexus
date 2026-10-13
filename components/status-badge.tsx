import { cn } from '@/lib/utils';
import type { OrderStatus, PaymentStatus } from '@/types';

const orderStatusConfig: Record<OrderStatus, { label: string; className: string; dot: string }> = {
  received: { label: 'Received', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', dot: 'bg-blue-500' },
  accepted: { label: 'Accepted', className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300', dot: 'bg-indigo-500' },
  shopping: { label: 'Shopping', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', dot: 'bg-amber-500' },
  packing: { label: 'Packing', className: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300', dot: 'bg-purple-500' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300', dot: 'bg-cyan-500' },
  delivered: { label: 'Delivered', className: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300', dot: 'bg-red-500' },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-300' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const config = orderStatusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const config = paymentStatusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
