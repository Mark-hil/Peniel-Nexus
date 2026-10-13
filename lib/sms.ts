import { env } from '@/lib/config';

export interface SMSPayload {
  to: string;
  message: string;
  orderNumber?: string;
  event?: 'order_placed' | 'shopper_assigned' | 'out_for_delivery' | 'delivered';
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  provider: 'arkesel' | 'hubtel' | 'simulation';
  status: 'sent' | 'delivered' | 'failed';
  error?: string;
}

/**
 * Normalizes Ghanaian phone numbers into international format (233XXXXXXXXX)
 */
export function formatGhanaPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+233')) {
    return cleaned.substring(1);
  }
  if (cleaned.startsWith('233')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '233' + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Dispatch SMS notification
 */
export async function sendSMS(payload: SMSPayload): Promise<SMSResponse> {
  const baseUrl = typeof window !== 'undefined' ? '' : env.appUrl;

  try {
    const res = await fetch(`${baseUrl}/api/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
    return {
      success: false,
      provider: 'simulation',
      status: 'failed',
      error: String(error),
    };
  }
}

/**
 * SMS Templates for Order Lifecycle
 */
export async function sendOrderPlacedSMS(order: {
  id: string;
  orderNumber: string;
  total: number;
  customerPhone?: string;
}) {
  const to = order.customerPhone || env.supportPhone;
  const message = `${env.appName}: Order #${order.orderNumber} (${env.currencySymbol} ${order.total.toFixed(2)}) is confirmed! A personal shopper is heading to the market now. Track live: ${env.appUrl}/dashboard/orders`;

  return sendSMS({
    to,
    message,
    orderNumber: order.orderNumber,
    event: 'order_placed',
  });
}

export async function sendShopperAssignedSMS(params: {
  orderNumber: string;
  customerPhone?: string;
  shopperName: string;
}) {
  const to = params.customerPhone || env.supportPhone;
  const message = `${env.appName}: Shopper ${params.shopperName} is now selecting fresh items for Order #${params.orderNumber} at the local market.`;

  return sendSMS({
    to,
    message,
    orderNumber: params.orderNumber,
    event: 'shopper_assigned',
  });
}

export async function sendOutForDeliverySMS(params: {
  orderNumber: string;
  customerPhone?: string;
  riderName: string;
  riderPhone?: string;
}) {
  const to = params.customerPhone || env.supportPhone;
  const riderContact = params.riderPhone ? ` (${params.riderPhone})` : '';
  const message = `${env.appName}: Order #${params.orderNumber} is packed and on the way! Rider ${params.riderName}${riderContact} will arrive shortly.`;

  return sendSMS({
    to,
    message,
    orderNumber: params.orderNumber,
    event: 'out_for_delivery',
  });
}

export async function sendOrderDeliveredSMS(params: {
  orderNumber: string;
  customerPhone?: string;
}) {
  const to = params.customerPhone || env.supportPhone;
  const message = `${env.appName}: Order #${params.orderNumber} has been delivered! Medaase for shopping fresh with us. Please rate your experience: ${env.appUrl}/dashboard/orders`;

  return sendSMS({
    to,
    message,
    orderNumber: params.orderNumber,
    event: 'delivered',
  });
}
