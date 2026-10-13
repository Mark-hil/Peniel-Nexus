import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { sendOrderPlacedSMS } from '@/lib/sms';
import { env } from '@/lib/config';
import { isUUID } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = env.paystackSecretKey;

    // 1. Verify webhook signature if secret key is present
    if (secret) {
      const hash = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'charge.success') {
      const data = payload.data;
      const orderId = data.metadata?.orderId;
      const orderNumber = data.metadata?.orderNumber;
      const phone = data.metadata?.phone;

      if (orderId && isUUID(orderId)) {
        // 2. Fetch order to verify amount and check idempotency
        const { data: dbOrder } = await supabase
          .from('orders')
          .select('id, order_number, total, payment_status, user_id')
          .eq('id', orderId)
          .maybeSingle();

        if (dbOrder) {
          // If already marked paid, acknowledge webhook safely
          if (dbOrder.payment_status === 'paid') {
            return NextResponse.json({ status: 'ok', message: 'Already processed' }, { status: 200 });
          }

          // Anti-tampering underpayment check
          const expectedPesewas = Math.round(Number(dbOrder.total) * 100);
          if (data.amount && data.amount < expectedPesewas) {
            console.error(
              `[Webhook Security Alert] Underpayment detected for order ${orderId}: expected ${expectedPesewas}, received ${data.amount}`
            );
            return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
          }
        }

        // 3. Update order in Supabase
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'accepted',
          })
          .eq('id', orderId);

        // 4. Resolve customer phone if needed
        let customerPhone = phone || env.supportPhone;
        if (!phone && dbOrder?.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', dbOrder.user_id)
            .maybeSingle();

          if (profile?.phone) {
            customerPhone = profile.phone;
          }
        }

        // 5. Dispatch confirmation SMS
        try {
          await sendOrderPlacedSMS({
            id: orderId,
            orderNumber: orderNumber || dbOrder?.order_number || data.reference,
            total: dbOrder ? Number(dbOrder.total) : (data.amount ? data.amount / 100 : 0),
            customerPhone,
          });
        } catch (err) {
          console.warn('Webhook SMS dispatch error:', err);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

