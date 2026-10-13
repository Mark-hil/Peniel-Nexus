-- ==============================================================================
-- Peniel Nexus — Complete PostgreSQL Database Schema & Security
-- Paste this script into the Supabase SQL Editor (SQL Editor -> New query -> Run)
-- Project: https://supabase.com/dashboard/project/cwgfedvlgcxgnkdjomyj
-- ==============================================================================

-- 1. EXTENSIONS & SEQUENCES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- 2. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'shopper', 'rider', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_profiles" ON public.profiles;
CREATE POLICY "select_all_profiles" ON public.profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
CREATE POLICY "update_own_profile" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
CREATE POLICY "insert_own_profile" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Trigger: Automatically create public.profiles row when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid(),
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'accepted', 'shopping', 'packing', 'out_for_delivery', 'delivered', 'cancelled')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method text NOT NULL DEFAULT 'mtn_momo',
  delivery_address text NOT NULL,
  gps_location text NOT NULL,
  preferred_time text NOT NULL,
  special_instructions text,
  shopping_budget numeric NOT NULL DEFAULT 0,
  service_fee numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  shopper_id uuid,
  rider_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Migration safety for existing databases: ensure orders foreign keys don't block unseeded demo accounts
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_shopper_id_fkey;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_rider_id_fkey;

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shopper_id ON public.orders(shopper_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON public.orders(rider_id);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_orders" ON public.orders;
CREATE POLICY "select_all_orders" ON public.orders FOR SELECT
  TO authenticated, anon USING (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR auth.uid() IS NULL
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('shopper', 'rider', 'admin'))
  );

DROP POLICY IF EXISTS "insert_own_orders" ON public.orders;
DROP POLICY IF EXISTS "insert_orders" ON public.orders;
CREATE POLICY "insert_orders" ON public.orders FOR INSERT
  TO authenticated, anon WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() IS NULL
    OR user_id IS NULL
  );

DROP POLICY IF EXISTS "update_orders" ON public.orders;
CREATE POLICY "update_orders" ON public.orders FOR UPDATE
  TO authenticated, anon
  USING (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR auth.uid() IS NULL
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR auth.uid() IS NULL
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Function: Generate readable order number (PN-YYYY-XXXX)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT 'PN-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(nextval('order_number_seq')::text, 4, '0')
$$;

GRANT EXECUTE ON FUNCTION public.generate_order_number() TO authenticated, anon;

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  quantity text,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_order_items" ON public.order_items;
CREATE POLICY "select_order_items" ON public.order_items FOR SELECT
  TO authenticated, anon USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR o.shopper_id = auth.uid()
        OR o.rider_id = auth.uid()
        OR auth.uid() IS NULL
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "insert_order_items" ON public.order_items;
CREATE POLICY "insert_order_items" ON public.order_items FOR INSERT
  TO authenticated, anon WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR auth.uid() IS NULL
        OR o.user_id IS NULL
      )
    )
  );

DROP POLICY IF EXISTS "update_order_items" ON public.order_items;
CREATE POLICY "update_order_items" ON public.order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR o.shopper_id = auth.uid()
        OR o.rider_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

-- 5. SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL,
  gps text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON public.saved_addresses(user_id);

ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_addresses" ON public.saved_addresses;
CREATE POLICY "select_own_addresses" ON public.saved_addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON public.saved_addresses;
CREATE POLICY "insert_own_addresses" ON public.saved_addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON public.saved_addresses;
CREATE POLICY "update_own_addresses" ON public.saved_addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON public.saved_addresses;
CREATE POLICY "delete_own_addresses" ON public.saved_addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 6. ORDER TIMELINE TABLE & TRIGGER
CREATE TABLE IF NOT EXISTS public.order_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON public.order_timeline(order_id);

ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_order_timeline" ON public.order_timeline;
CREATE POLICY "select_order_timeline" ON public.order_timeline FOR SELECT
  TO authenticated, anon USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_timeline.order_id
      AND (
        o.user_id = auth.uid()
        OR o.shopper_id = auth.uid()
        OR o.rider_id = auth.uid()
        OR auth.uid() IS NULL
        OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

CREATE OR REPLACE FUNCTION public.record_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_timeline (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.record_order_status_change();

-- 7. NOTIFICATIONS TABLE & TRIGGER
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON public.notifications;
CREATE POLICY "select_own_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON public.notifications;
CREATE POLICY "insert_own_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON public.notifications;
CREATE POLICY "update_own_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON public.notifications;
CREATE POLICY "delete_own_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_title text;
  v_message text;
  v_type text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    v_type := NEW.status;

    v_title := CASE NEW.status
      WHEN 'accepted' THEN 'Order Accepted'
      WHEN 'shopping' THEN 'Shopper Assigned'
      WHEN 'packing' THEN 'Order Being Packed'
      WHEN 'out_for_delivery' THEN 'Out for Delivery'
      WHEN 'delivered' THEN 'Order Delivered'
      WHEN 'cancelled' THEN 'Order Cancelled'
      ELSE 'Order Update'
    END;

    v_message := CASE NEW.status
      WHEN 'accepted' THEN 'Your order ' || NEW.order_number || ' has been accepted and will start soon.'
      WHEN 'shopping' THEN 'A shopper is now shopping for your order ' || NEW.order_number || '.'
      WHEN 'packing' THEN 'Your order ' || NEW.order_number || ' items are being packed.'
      WHEN 'out_for_delivery' THEN 'Your order ' || NEW.order_number || ' is on the way to you.'
      WHEN 'delivered' THEN 'Your order ' || NEW.order_number || ' has been delivered. Rate your experience!'
      WHEN 'cancelled' THEN 'Your order ' || NEW.order_number || ' has been cancelled.'
      ELSE 'Your order ' || NEW.order_number || ' status has been updated.'
    END;

    IF NEW.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, type, title, message)
      VALUES (NEW.user_id, v_type, v_title, v_message);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_order_status_notification ON public.orders;
CREATE TRIGGER on_order_status_notification
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.create_order_notification();

-- 8. IN-APP MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_order_id ON public.messages(order_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON public.messages;
CREATE POLICY "select_own_messages" ON public.messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "insert_own_messages" ON public.messages;
CREATE POLICY "insert_own_messages" ON public.messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- 9. RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  shopper_rating int NOT NULL DEFAULT 5 CHECK (shopper_rating BETWEEN 1 AND 5),
  rider_rating int NOT NULL DEFAULT 5 CHECK (rider_rating BETWEEN 1 AND 5),
  delivery_rating int NOT NULL DEFAULT 5 CHECK (delivery_rating BETWEEN 1 AND 5),
  would_recommend boolean,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON public.ratings(order_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ratings" ON public.ratings;
CREATE POLICY "select_ratings" ON public.ratings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_rating" ON public.ratings;
CREATE POLICY "insert_own_rating" ON public.ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = rater_id);

-- 10. DEMO PERSONAS SEED
-- Seeds standard demo users in auth.users and public.profiles
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer@penielnexus.com', crypt('PenielNexus#2026!SecureAuth', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Akosua Mansa","role":"customer","phone":"+233 24 123 4567"}', now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'shopper@penielnexus.com', crypt('PenielNexus#2026!SecureAuth', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kwame Mensah","role":"shopper","phone":"+233 20 987 6543"}', now(), now()),
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rider@penielnexus.com', crypt('PenielNexus#2026!SecureAuth', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kofi Boateng","role":"rider","phone":"+233 55 456 7890"}', now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@penielnexus.com', crypt('PenielNexus#2026!SecureAuth', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User","role":"admin","phone":"+233 24 000 0000"}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, phone, role) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Akosua Mansa', '+233 24 123 4567', 'customer'),
  ('22222222-2222-4222-8222-222222222222', 'Kwame Mensah', '+233 20 987 6543', 'shopper'),
  ('33333333-3333-4333-8333-333333333333', 'Kofi Boateng', '+233 55 456 7890', 'rider'),
  ('44444444-4444-4444-8444-444444444444', 'Admin User', '+233 24 000 0000', 'admin')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- 11. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
