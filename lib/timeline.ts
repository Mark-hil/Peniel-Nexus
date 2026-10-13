import { supabase } from '@/lib/supabase';
import type { TimelineEvent, OrderStatus } from '@/types';
import { isUUID } from '@/lib/utils';

const statusOrder: OrderStatus[] = [
  'received',
  'accepted',
  'shopping',
  'packing',
  'out_for_delivery',
  'delivered',
];

const statusMeta: Record<OrderStatus, { label: string; description: string }> = {
  received: { label: 'Order Received', description: 'Your order has been placed' },
  accepted: { label: 'Accepted', description: 'Your order has been accepted' },
  shopping: { label: 'Shopping', description: 'A shopper is at the market' },
  packing: { label: 'Packing', description: 'Items are being packed' },
  out_for_delivery: { label: 'Out For Delivery', description: 'Your order is on the way' },
  delivered: { label: 'Delivered', description: 'Order delivered to your door' },
  cancelled: { label: 'Cancelled', description: 'Order was cancelled' },
};

export async function fetchTimeline(
  orderId: string,
  currentStatus: OrderStatus,
): Promise<TimelineEvent[]> {
  if (!isUUID(orderId)) {
    return buildStaticTimeline(currentStatus);
  }

  const { data, error } = await supabase
    .from('order_timeline')
    .select('status, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return buildStaticTimeline(currentStatus);
  }

  const completedStatuses = new Set<OrderStatus>();
  const timestamps: Partial<Record<OrderStatus, string>> = {};

  for (const row of data) {
    const s = row.status as OrderStatus;
    completedStatuses.add(s);
    if (!timestamps[s]) {
      timestamps[s] = new Date(row.created_at as string).toLocaleTimeString('en-GH', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return statusOrder.map((status) => ({
    status,
    label: statusMeta[status].label,
    description: statusMeta[status].description,
    timestamp: timestamps[status] ?? '—',
    completed:
      completedStatuses.has(status) ||
      (currentIndex >= 0 && statusOrder.indexOf(status) <= currentIndex && currentStatus !== 'cancelled'),
  }));
}

function buildStaticTimeline(currentStatus: OrderStatus): TimelineEvent[] {
  if (currentStatus === 'cancelled') {
    return statusOrder.map((status) => ({
      status,
      label: statusMeta[status].label,
      description: statusMeta[status].description,
      timestamp: status === 'received' ? '—' : '—',
      completed: status === 'received',
    }));
  }

  const currentIndex = statusOrder.indexOf(currentStatus);

  return statusOrder.map((status, i) => ({
    status,
    label: statusMeta[status].label,
    description: statusMeta[status].description,
    timestamp: i <= currentIndex ? '—' : '—',
    completed: i <= currentIndex,
  }));
}
