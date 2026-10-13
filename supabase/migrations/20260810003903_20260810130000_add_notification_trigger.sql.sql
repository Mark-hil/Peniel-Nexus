/*
# Add Notification Trigger on Order Status Changes

## Overview
Creates a trigger that automatically inserts a notification row for the customer
whenever their order's status changes. This replaces the mock notification data
in the frontend with real, database-driven notifications.

## New Functions
1. create_order_notification() — SECURITY DEFINER trigger function that inserts
   a row into the notifications table when an order's status changes. It reads
   the order's user_id and generates an appropriate title/message based on the
   new status.

## Security
- Function is SECURITY DEFINER so it can INSERT into notifications regardless
  of the calling user's permissions.
- EXECUTE is revoked from anon and authenticated — this is a trigger-only function.
- The trigger fires AFTER UPDATE OF status ON orders.

## Important Notes
1. Only fires when status actually changes (NEW.status IS DISTINCT FROM OLD.status).
2. Does not create notifications for the initial 'received' status (that is handled
   at order creation time, or can be added separately).
3. The notification is addressed to the order's customer (user_id).
*/

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
  -- Only fire when status actually changed
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

    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES (NEW.user_id, v_type, v_title, v_message);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_order_notification() FROM anon, authenticated;

DROP TRIGGER IF EXISTS on_order_status_notification ON orders;
CREATE TRIGGER on_order_status_notification
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION public.create_order_notification();
