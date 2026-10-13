#!/usr/bin/env node

/**
 * Peniel Nexus — End-to-End Automated Integration Test
 * Validates:
 * 1. Seed Personas (Customer, Shopper, Rider, Admin)
 * 2. Payment Initialization (Paystack / Mobile Money)
 * 3. Payment Verification & Order Confirmation
 * 4. Real-time SMS Dispatch Lifecycle (Order Placed -> Shopping -> Out for Delivery -> Delivered)
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
};

function logStep(step, title) {
  console.log(`\n${colors.bold}${colors.cyan}[Step ${step}]${colors.reset} ${colors.bold}${title}${colors.reset}`);
}

function logSuccess(msg) {
  console.log(`  ${colors.green}✔ ${msg}${colors.reset}`);
}

function logInfo(msg) {
  console.log(`  ${colors.yellow}ℹ ${msg}${colors.reset}`);
}

async function runE2ETest() {
  console.log(`${colors.bold}${colors.green}=======================================================`);
  console.log(`  Peniel Nexus — End-to-End System Test`);
  console.log(`  Target: ${BASE_URL}`);
  console.log(`=======================================================${colors.reset}\n`);

  const startTime = Date.now();
  let passed = 0;
  let total = 0;

  // STEP 1: Verify Seed Personas
  total++;
  logStep(1, 'Verifying Test Personas & Seed Accounts');
  try {
    const res = await fetch(`${BASE_URL}/api/auth/seed`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Failed to query seed accounts');

    logSuccess(`Seed accounts available (${data.users.length} personas):`);
    data.users.forEach((u) => {
      console.log(`    - [${u.role.toUpperCase()}] ${u.fullName} (${u.email}) -> ${u.destination}`);
    });
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 1:${colors.reset}`, err.message);
  }

  // STEP 2: Initialize Mobile Money / Paystack Payment
  total++;
  const testOrderId = `test-${Date.now()}`;
  const testOrderNumber = `MB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const testAmount = 85.50;
  const testPhone = '+233 24 555 0142';
  let activeReference = '';

  logStep(2, `Initializing Mobile Money Payment for ${testOrderNumber} (GHS ${testAmount})`);
  try {
    const res = await fetch(`${BASE_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        orderNumber: testOrderNumber,
        amount: testAmount,
        phone: testPhone,
        paymentMethod: 'mtn_momo',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Payment initialization failed');

    activeReference = data.reference;
    logSuccess(`Payment Initialized:`);
    logInfo(`Mode: ${data.mode.toUpperCase()}`);
    logInfo(`Reference: ${data.reference}`);
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 2:${colors.reset}`, err.message);
  }

  // STEP 3: Verify Payment & Confirm Order
  total++;
  logStep(3, `Verifying Payment & Confirming Order (${activeReference})`);
  try {
    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: testOrderId,
        reference: activeReference,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Payment verification failed');

    logSuccess(`Payment Verified & Order Accepted:`);
    logInfo(`Payment Status: ${data.paymentStatus}`);
    logInfo(`Order Status: ${data.orderStatus}`);
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 3:${colors.reset}`, err.message);
  }

  // STEP 4: SMS Notification — Order Placed
  total++;
  logStep(4, 'Dispatching SMS Alert: Order Confirmed');
  try {
    const res = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testPhone,
        message: `Peniel Nexus: Order #${testOrderNumber} (GHS ${testAmount}) is confirmed! Shopper is heading to market.`,
        orderNumber: testOrderNumber,
        event: 'order_placed',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'SMS send failed');

    logSuccess(`SMS Dispatched:`);
    logInfo(`Recipient: +${data.recipient}`);
    logInfo(`Provider: ${data.provider}`);
    logInfo(`Message: "${data.preview}"`);
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 4:${colors.reset}`, err.message);
  }

  // STEP 5: SMS Notification — Shopper Picking at Market
  total++;
  logStep(5, 'Dispatching SMS Alert: Shopper Assigned & Shopping');
  try {
    const res = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testPhone,
        message: `Peniel Nexus: Shopper Yaw Boateng is now selecting fresh items for Order #${testOrderNumber} at Makola Market.`,
        orderNumber: testOrderNumber,
        event: 'shopper_assigned',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'SMS send failed');

    logSuccess(`Shopper SMS Alert Sent: Status: ${data.status}`);
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 5:${colors.reset}`, err.message);
  }

  // STEP 6: SMS Notification — Rider Out for Delivery
  total++;
  logStep(6, 'Dispatching SMS Alert: Rider Out for Delivery');
  try {
    const res = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testPhone,
        message: `Peniel Nexus: Order #${testOrderNumber} is packed! Rider Kofi Asante (+233 20 765 4321) is on the way.`,
        orderNumber: testOrderNumber,
        event: 'out_for_delivery',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'SMS send failed');

    logSuccess(`Rider Dispatch SMS Alert Sent: Status: ${data.status}`);
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 6:${colors.reset}`, err.message);
  }

  // STEP 7: SMS Notification — Order Delivered
  total++;
  logStep(7, 'Dispatching SMS Alert: Order Delivered');
  try {
    const res = await fetch(`${BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: testPhone,
        message: `Peniel Nexus: Order #${testOrderNumber} delivered to your door! Medaase for shopping fresh with us.`,
        orderNumber: testOrderNumber,
        event: 'delivered',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'SMS send failed');

    logSuccess(`Order Delivered SMS Alert Sent: Status: ${data.status}`);
    passed++;
  } catch (err) {
    console.error(`  ${colors.red}✖ Failed Step 7:${colors.reset}`, err.message);
  }

  // SUMMARY
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n${colors.bold}${colors.green}=======================================================`);
  console.log(`  E2E Test Results: ${passed}/${total} PASSED in ${elapsed}s`);
  console.log(`=======================================================${colors.reset}\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runE2ETest();
