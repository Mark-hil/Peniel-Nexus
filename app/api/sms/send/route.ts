import { NextResponse } from 'next/server';
import { formatGhanaPhone } from '@/lib/sms';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, orderNumber, event } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required recipient "to" or "message"' },
        { status: 400 }
      );
    }

    const formattedPhone = formatGhanaPhone(to);
    const arkeselKey = env.arkeselApiKey;
    const hubtelClientId = env.hubtelClientId;
    const hubtelClientSecret = env.hubtelClientSecret;
    const senderId = env.smsSenderId;

    // 1. Check Arkesel SMS API (Ghana Popular Gateway)
    if (arkeselKey) {
      const arkeselRes = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
        method: 'POST',
        headers: {
          'api-key': arkeselKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: senderId,
          recipients: [formattedPhone],
          message,
        }),
      });

      const arkeselData = await arkeselRes.json();

      return NextResponse.json({
        success: arkeselRes.ok,
        provider: 'arkesel',
        status: arkeselRes.ok ? 'sent' : 'failed',
        data: arkeselData,
      });
    }

    // 2. Check Hubtel SMS API
    if (hubtelClientId && hubtelClientSecret) {
      const authHeader = 'Basic ' + Buffer.from(`${hubtelClientId}:${hubtelClientSecret}`).toString('base64');
      const hubtelRes = await fetch(
        `https://smsc.hubtel.com/v1/messages/send?From=${encodeURIComponent(
          senderId
        )}&To=${encodeURIComponent(formattedPhone)}&Content=${encodeURIComponent(message)}`,
        {
          method: 'GET',
          headers: {
            Authorization: authHeader,
          },
        }
      );

      const hubtelData = await hubtelRes.json();

      return NextResponse.json({
        success: hubtelRes.ok,
        provider: 'hubtel',
        status: hubtelRes.ok ? 'sent' : 'failed',
        data: hubtelData,
      });
    }

    // 3. Realistic Sandbox / Simulation Mode
    const simulatedId = `SMS-GH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`\x1b[32m[SMS DISPATCHED]\x1b[0m To: +${formattedPhone} | ID: ${simulatedId}`);
    console.log(`\x1b[36m"${message}"\x1b[0m\n`);

    // Also persist a notification in Supabase for visibility
    try {
      await supabase.from('notifications').insert({
        title: `SMS: ${event ? event.replace('_', ' ').toUpperCase() : 'Order Update'}`,
        message,
        type: event || 'order_received',
      });
    } catch {
      // Ignore if Supabase auth context is unavailable
    }

    return NextResponse.json({
      success: true,
      provider: 'simulation',
      status: 'delivered',
      messageId: simulatedId,
      recipient: formattedPhone,
      timestamp: new Date().toISOString(),
      preview: message,
    });
  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error dispatching SMS' },
      { status: 500 }
    );
  }
}
