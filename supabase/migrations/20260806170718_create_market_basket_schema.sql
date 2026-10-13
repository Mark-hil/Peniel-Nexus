/*
# Peniel Nexus — Core Database Schema

## Overview
Creates the full backend for the Peniel Nexus delivery app: user profiles,
orders with line items, saved addresses, in-app chat messages, and ratings.

## New Tables
1. profiles — extends auth.users with name, phone, role, avatar
2. orders — customer orders with status, payment, delivery info
3. order_items — line items per order
4. saved_addresses — customer address book
5. messages — in-app chat between users
6. ratings — customer reviews

## Security
- RLS enabled on every table
- Owner-scoped CRUD for orders, addresses, messages
- Auto-creates profile on signup via trigger
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'shopper', 'rider', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
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
  shopper_id uuid REFERENCES profiles(id),
  rider_id uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shopper_id ON orders(shopper_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_own_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
  );

DROP POLICY IF EXISTS "insert_own_orders" ON orders;
CREATE POLICY "insert_own_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_own_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_orders" ON orders;
CREATE POLICY "delete_own_orders" ON orders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT 'MB-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(nextval('order_number_seq')::text, 4, '0')
$$;

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name text NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  quantity text,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (o.user_id = auth.uid() OR o.shopper_id = auth.uid() OR o.rider_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_order_items" ON order_items;
CREATE POLICY "update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_order_items" ON order_items;
CREATE POLICY "delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
    )
  );

-- ============ SAVED ADDRESSES ============
CREATE TABLE IF NOT EXISTS saved_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  address text NOT NULL,
  gps text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_addresses_user_id ON saved_addresses(user_id);

ALTER TABLE saved_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_addresses" ON saved_addresses;
CREATE POLICY "select_own_addresses" ON saved_addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON saved_addresses;
CREATE POLICY "insert_own_addresses" ON saved_addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON saved_addresses;
CREATE POLICY "update_own_addresses" ON saved_addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON saved_addresses;
CREATE POLICY "delete_own_addresses" ON saved_addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ MESSAGES ============
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_order_id ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ============ RATINGS ============
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rater_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  shopper_rating int NOT NULL DEFAULT 5 CHECK (shopper_rating BETWEEN 1 AND 5),
  rider_rating int NOT NULL DEFAULT 5 CHECK (rider_rating BETWEEN 1 AND 5),
  delivery_rating int NOT NULL DEFAULT 5 CHECK (delivery_rating BETWEEN 1 AND 5),
  would_recommend boolean,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_order_id ON ratings(order_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_ratings" ON ratings;
CREATE POLICY "select_ratings" ON ratings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_rating" ON ratings;
CREATE POLICY "insert_own_rating" ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = rater_id);

DROP POLICY IF EXISTS "update_own_rating" ON ratings;
CREATE POLICY "update_own_rating" ON ratings FOR UPDATE
  TO authenticated USING (auth.uid() = rater_id) WITH CHECK (auth.uid() = rater_id);
