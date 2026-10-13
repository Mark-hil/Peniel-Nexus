import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/config';

const SEED_USERS = [
  {
    email: env.demoCustomerEmail,
    password: env.demoPassword,
    fullName: 'Ama Owusu',
    phone: '+233 24 555 0142',
    role: 'customer',
    destination: '/dashboard',
    label: 'Customer (Ama)',
    badge: 'Customer',
    color: 'bg-emerald-500',
  },
  {
    email: env.demoShopperEmail,
    password: env.demoPassword,
    fullName: 'Yaw Boateng',
    phone: '+233 24 123 4567',
    role: 'shopper',
    destination: '/shopper',
    label: 'Shopper (Yaw)',
    badge: 'Shopper',
    color: 'bg-amber-500',
  },
  {
    email: env.demoRiderEmail,
    password: env.demoPassword,
    fullName: 'Kofi Asante',
    phone: '+233 20 765 4321',
    role: 'rider',
    destination: '/rider',
    label: 'Rider (Kofi)',
    badge: 'Rider',
    color: 'bg-blue-500',
  },
  {
    email: env.demoAdminEmail,
    password: env.demoPassword,
    fullName: 'Admin Manager',
    phone: '+233 24 999 8888',
    role: 'admin',
    destination: '/admin',
    label: 'Admin (Manager)',
    badge: 'Admin',
    color: 'bg-purple-600',
  },
];

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const secret = env.adminSeedSecret;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
    }
  }

  return NextResponse.json({
    success: true,
    users: SEED_USERS.map(({ password: _, ...rest }) => rest),
  });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const secret = env.adminSeedSecret;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 });
    }
  }

  const results = [];

  for (const user of SEED_USERS) {
    try {
      // 1. Try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.fullName,
            phone: user.phone,
            role: user.role,
          },
        },
      });

      const userId = authData?.user?.id;

      if (userId) {
        // Ensure profile record reflects role
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: user.fullName,
            phone: user.phone,
            role: user.role,
          });
      }

      results.push({
        email: user.email,
        role: user.role,
        status: authError ? (authError.message.includes('already registered') ? 'exists' : 'failed') : 'created',
      });
    } catch (err) {
      results.push({
        email: user.email,
        role: user.role,
        status: 'error',
        error: String(err),
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Test accounts seeded or verified successfully',
    results,
  });
}
