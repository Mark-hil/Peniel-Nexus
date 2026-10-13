/*
# Fix Security Warnings + Add Timeline & Notifications Tables

## Overview
1. Revokes EXECUTE on two SECURITY DEFINER functions from anon/authenticated roles
   so they cannot be called directly via the REST API.
   - handle_new_user(): trigger function, should only fire via the auth.users trigger
   - generate_order_number(): should only be called by authenticated users via RPC,
     but we restrict to authenticated only and revoke from anon to prevent sequence exhaustion
2. Fixes the orders SELECT policy that exposed all unassigned orders (including
   other customers' addresses and GPS) to every authenticated user. Now only
   shoppers, riders, and admins can see unassigned orders; customers only see their own.
3. Adds order_timeline table to record every status change with a timestamp,
   plus a trigger that auto-inserts a row whenever an order's status changes.
4. Adds notifications table for in-app notifications scoped per user.

## Security Changes
- REVOKE EXECUTE on handle_new_user() FROM anon, authenticated
- REVOKE EXECUTE on generate_order_number() FROM anon
- Replace select_all_orders policy: removes the blanket `shopper_id IS NULL OR rider_id IS NULL`
  condition that exposed customer data to other customers. Shoppers/riders now must
  have a staff role to see unassigned orders.

## New Tables
1. order_timeline
   - id (uuid PK)
   - order_id (FK -> orders, CASCADE)
   - status (text — the new status value)
   - changed_by (uuid FK -> auth.users)
   - created_at (timestamptz default now())
2. notifications
   - id (uuid PK)
   - user_id (uuid FK -> auth.users, CASCADE, default auth.uid())
   - type (text — notification category)
   - title (text)
   - message (text)
   - read (boolean default false)
   - created_at (timestamptz default now())

## RLS
- order_timeline: SELECT for anyone who can see the parent order; INSERT only via trigger (SECURITY DEFINER)
- notifications: owner-scoped CRUD (select/insert/update/delete own notifications)

## Important Notes
1. The order_timeline trigger function is SECURITY DEFINER so it can insert rows
   even though the calling user may not have INSERT permission on order_timeline.
2. generate_order_number remains callable by authenticated users (needed for order creation)
   but is no longer callable by anon (unauthenticated) users.
3. The orders SELECT policy now checks the profiles table for shopper/rider/admin role
   before showing unassigned orders, so customers cannot see other customers' orders.
*/

-- ============ 1. REVOKE EXECUTE ON SECURITY DEFINER FUNCTIONS ============
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon;

-- ============ 2. FIX ORDERS SELECT POLICY ============
-- Remove the blanket `shopper_id IS NULL OR rider_id IS NULL` that exposed
-- all unassigned orders to every authenticated user (including other customers).
-- Now: customers see only their own orders; shoppers/riders/admins can see all.
DROP POLICY IF EXISTS "select_all_orders" ON orders;
CREATE POLICY "select_all_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id
    OR auth.uid() = shopper_id
    OR auth.uid() = rider_id
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('shopper', 'rider', 'admin'))
  );

-- ============ 3. ORDER TIMELINE TABLE ============
CREATE TABLE IF NOT EXISTS order_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX IF NOT EXISTS idx_order_timeline_created_at ON order_timeline(created_at);

ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

-- SELECT: anyone who can see the parent order can see its timeline
DROP POLICY IF EXISTS "select_order_timeline" ON order_timeline;
CREATE POLICY "select_order_timeline" ON order_timeline FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_timeline.order_id
      AND (
        o.user_id = auth.uid()
        OR o.shopper_id = auth.uid()
        OR o.rider_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
      )
    )
  );

-- No INSERT/UPDATE/DELETE policy for authenticated — the trigger handles INSERT
-- via SECURITY DEFINER. Admins can DELETE if needed for moderation.
DROP POLICY IF EXISTS "delete_order_timeline_admin" ON order_timeline;
CREATE POLICY "delete_order_timeline_admin" ON order_timeline FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============ 4. ORDER TIMELINE TRIGGER ============
-- Auto-insert a timeline row whenever an order's status changes.
-- SECURITY DEFINER so it can INSERT into order_timeline regardless of caller permissions.
CREATE OR REPLACE FUNCTION public.record_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only fire when status actually changed
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_timeline (order_id, status, changed_by)
    VALUES (NEW.id, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_order_status_change() FROM anon, authenticated;

DROP TRIGGER IF EXISTS on_order_status_change ON orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION public.record_order_status_change();

-- ============ 5. NOTIFICATIONS TABLE ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
