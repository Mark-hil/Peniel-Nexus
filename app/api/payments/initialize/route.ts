import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/config';
import { isUUID } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, orderNumber, amount, email, phone, paymentMethod } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required orderId' },
        { status: 400 }
      );
    }

    const paystackKey = env.paystackSecretKey;
    const isLive = Boolean(paystackKey && paystackKey.startsWith('sk_'));

    // 1. Fetch authoritative order data from Supabase to prevent price tampering
    let authoritativeTotal = Number(amount) || 0;
    let authoritativeOrderNumber = orderNumber || '';
    let customerPhone = phone || env.supportPhone;
    let customerEmail = email || env.demoCustomerEmail;

    let dbOrder: any = null;
    if (isUUID(orderId)) {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, total, payment_status, user_id')
        .eq('id', orderId)
        .maybeSingle();
      dbOrder = data;
    }

    if (dbOrder) {
      // Authoritative values from database take precedence
      authoritativeTotal = Number(dbOrder.total);
      authoritativeOrderNumber = dbOrder.order_number;

      // Check if order is already paid
      if (dbOrder.payment_status === 'paid') {
        return NextResponse.json(
          { success: false, error: 'Order has already been paid for' },
          { status: 400 }
        );
      }

      // Fetch user profile if available
      if (dbOrder.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', dbOrder.user_id)
          .maybeSingle();

        if (profile?.phone) {
          customerPhone = profile.phone;
        }
      }
    } else if (isLive) {
      // In production/live mode, the order MUST exist in the database
      return NextResponse.json(
        { success: false, error: 'Order not found in database' },
        { status: 404 }
      );
    }

    // Ensure amount is valid
    if (authoritativeTotal <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order amount' },
        { status: 400 }
      );
    }

    const reference = `${env.orderPrefix}-PAY-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const baseUrl = env.appUrl;

    if (isLive) {
      // Real Paystack integration
      const channels =
        paymentMethod === 'visa' || paymentMethod === 'mastercard'
          ? ['card']
          : ['mobile_money'];

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: Math.round(authoritativeTotal * 100), // Converted to pesewas (authoritative)
          currency: env.currencyCode,
          reference,
          channels,
          callback_url: `${baseUrl}/payment/callback?orderId=${encodeURIComponent(orderId)}`,
          metadata: {
            orderId,
            orderNumber: authoritativeOrderNumber,
            phone: customerPhone,
            paymentMethod,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        return NextResponse.json(
          { success: false, error: data.message || 'Failed to initialize Paystack transaction' },
          { status: 502 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'live',
        reference: data.data.reference,
        authorizationUrl: data.data.authorization_url,
      });
    }

    // Zero-Config Sandbox / Mobile Money Push Simulation Mode
    return NextResponse.json({
      success: true,
      mode: 'sandbox',
      reference,
      orderId,
      orderNumber: authoritativeOrderNumber,
      amount: authoritativeTotal,
      paymentMethod: paymentMethod || 'mtn_momo',
      phone: customerPhone,
      message: 'Mobile Money payment prompt generated for sandbox approval',
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error initializing payment' },
      { status: 500 }
    );
  }
}
