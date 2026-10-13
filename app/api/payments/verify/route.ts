import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendOrderPlacedSMS } from '@/lib/sms';
import { env } from '@/lib/config';
import { isUUID } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required reference or orderId' },
        { status: 400 }
      );
    }

    // 1. Fetch order from Supabase if orderId is a valid UUID
    let existingOrder: any = null;
    if (isUUID(orderId)) {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, total, payment_status, status, user_id')
        .eq('id', orderId)
        .maybeSingle();
      existingOrder = data;
    }

    // 2. Idempotency Check: if already marked paid, return success without duplicate processing
    if (existingOrder && existingOrder.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        reference,
        orderId,
        paymentStatus: 'paid',
        orderStatus: existingOrder.status,
        message: 'Payment already verified and confirmed',
      });
    }

    const paystackKey = env.paystackSecretKey;
    const isLive = Boolean(paystackKey && paystackKey.startsWith('sk_'));

    if (isLive) {
      // 3. Verify with Paystack API
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${paystackKey}`,
          },
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== 'success') {
        return NextResponse.json(
          {
            success: false,
            error: verifyData.message || 'Payment verification failed with Paystack',
            paystackStatus: verifyData.data?.status,
          },
          { status: 400 }
        );
      }

      const transaction = verifyData.data;

      // 4. Validate Currency
      if (transaction.currency && transaction.currency !== env.currencyCode) {
        return NextResponse.json(
          { success: false, error: `Invalid currency: expected ${env.currencyCode}, received ${transaction.currency}` },
          { status: 400 }
        );
      }

      // 5. Anti-Tampering Check: Validate that amount paid matches the database order total
      if (existingOrder) {
        const expectedPesewas = Math.round(Number(existingOrder.total) * 100);
        const actualPesewas = transaction.amount;

        if (actualPesewas < expectedPesewas) {
          console.error(
            `[Payment Fraud Alert] Amount mismatch for Order ${orderId}: expected ${expectedPesewas} pesewas, got ${actualPesewas} pesewas`
          );
          return NextResponse.json(
            { success: false, error: 'Payment amount mismatch: underpayment detected' },
            { status: 400 }
          );
        }
      }
    }

    // 6. Update order status in Supabase if valid UUID
    let updatedOrder: any = null;
    if (isUUID(orderId)) {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'received',
        })
        .eq('id', orderId)
        .select('id, order_number, total, delivery_address, user_id')
        .maybeSingle();

      if (updateError) {
        console.error('Failed to update order in Supabase:', updateError);
      }
      updatedOrder = data;
    }

    // 7. Resolve customer phone for SMS notification
    let customerPhone = env.supportPhone;
    const userId = updatedOrder?.user_id || existingOrder?.user_id;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.phone) {
        customerPhone = profile.phone;
      }
    }

    // 8. Dispatch order confirmation SMS
    try {
      await sendOrderPlacedSMS({
        id: orderId,
        orderNumber: updatedOrder?.order_number || existingOrder?.order_number || reference,
        total: updatedOrder?.total || existingOrder?.total || 0,
        customerPhone,
      });
    } catch (smsErr) {
      console.warn('SMS dispatch failed (non-fatal):', smsErr);
    }

    return NextResponse.json({
      success: true,
      reference,
      orderId,
      paymentStatus: 'paid',
      orderStatus: 'accepted',
      message: 'Payment confirmed successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error verifying payment' },
      { status: 500 }
    );
  }
}
