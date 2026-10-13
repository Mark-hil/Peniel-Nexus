/**
 * Peniel Nexus - Centralized Application Configuration & Environment Variables
 * Provides validated, type-safe access to all system variables with graceful defaults.
 */

export const env = {
  // 1. Branding & Public Application Details
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Peniel Nexus',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  appDescription:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'Fresh local market groceries delivered to your door in Ghana',
  orderPrefix: process.env.NEXT_PUBLIC_ORDER_PREFIX || 'PN',

  // 2. Customer Support & Contact Details
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@penielnexus.com',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+233 24 555 0142',

  // 3. Financial & Fee Policies
  currencyCode: process.env.NEXT_PUBLIC_CURRENCY_CODE || 'GHS',
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'GHS',
  deliveryFee: Number(process.env.NEXT_PUBLIC_DELIVERY_FEE ?? 15),
  serviceFeeRate: Number(process.env.NEXT_PUBLIC_SERVICE_FEE_RATE ?? 0.1),

  // 4. Paystack Payment Gateway
  paystackPublicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY || '',

  // 5. Ghana SMS Gateways (Arkesel / Hubtel)
  smsSenderId:
    process.env.SMS_SENDER_ID ||
    process.env.NEXT_PUBLIC_SMS_SENDER_ID ||
    'PenielNexus',
  arkeselApiKey: process.env.ARKESEL_API_KEY || '',
  hubtelClientId: process.env.HUBTEL_CLIENT_ID || '',
  hubtelClientSecret: process.env.HUBTEL_CLIENT_SECRET || '',

  // 6. Supabase Backend Infrastructure
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    '',
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // 7. Demo Personas & Seed Credentials
  demoCustomerEmail:
    process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL || 'customer@penielnexus.com',
  demoShopperEmail:
    process.env.NEXT_PUBLIC_DEMO_SHOPPER_EMAIL || 'shopper@penielnexus.com',
  demoRiderEmail:
    process.env.NEXT_PUBLIC_DEMO_RIDER_EMAIL || 'rider@penielnexus.com',
  demoAdminEmail:
    process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@penielnexus.com',
  demoPassword:
    process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'PenielNexus#2026!SecureAuth',
  adminSeedSecret: process.env.ADMIN_SEED_SECRET || '',

  // 8. Runtime Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV !== 'production',
};

export default env;
