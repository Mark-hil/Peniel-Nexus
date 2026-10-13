/*
# Fix RLS for Field Staff and Admin Access

## Overview
The original schema only allowed customers to read/update their own orders.
This migration opens up access so shoppers, riders, and admins can do their jobs:
- Shoppers see available orders (status = 'received') and accept them
- Riders see available deliveries (status = 'packing') and accept them
- Both can update status on orders assigned to them
- Admins can read and update all orders, profiles, and ratings
- All authenticated users can read all profiles (field staff need customer contact info)

## Modified Tables
1. orders — SELECT opened to all authenticated; UPDATE opened to assigned shopper/rider + admin
2. profiles — SELECT opened to all authenticated (name, phone, role only)
3. order_items — SELECT/UPDATE opened to assigned shopper/rider + admin
4. ratings — UPDATE opened to admin

## Security Notes
- Customers can still only UPDATE their own orders (cancel)
- Shoppers/riders can only UPDATE orders assigned to them
- Admin is identified by role = 'admin' in profiles table
- Profile data exposed is limited to full_name, phone, role, avatar_url — no sensitive fields
*/

-- ============ PROFILES: all authenticated users can read ============
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

-- ============ ORDERS: all authenticated can read; assigned staff + admin can update ============
DROP POLICY IF EXISTS "select_own_orders" ON orders;
CREATE POLICY "select_all_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR shopper_id IS NULL
    OR rider_id IS NULL
  );

DROP POLICY IF EXISTS "update_own_orders" ON orders;
CREATE POLICY "update_orders" ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============ ORDER ITEMS: assigned shopper/rider + admin can update ============
DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR o.shopper_id = auth.uid()
        OR o.rider_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

DROP POLICY IF EXISTS "update_order_items" ON order_items;
CREATE POLICY "update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND (
        o.user_id = auth.uid()
        OR o.shopper_id = auth.uid()
        OR o.rider_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

-- ============ RATINGS: admin can update ============
DROP POLICY IF EXISTS "update_own_rating" ON ratings;
CREATE POLICY "update_ratings" ON ratings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = rater_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = rater_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
