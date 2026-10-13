/*
# Revert Functions to SECURITY DEFINER and Revoke Public EXECUTE

1. Problem
   - Changing trigger functions to SECURITY INVOKER broke user signup
     because the trigger runs as the calling user, who lacks INSERT
     privileges on the profiles table (no INSERT policy exists).
   - The same issue affects record_order_status_change (inserts into
     order_timeline) and create_order_notification (inserts into
     notifications for other users).

2. Fix
   - Revert all 4 functions back to SECURITY DEFINER so triggers
     execute with the function owner's privileges.
   - Revoke EXECUTE from PUBLIC, anon, and authenticated to close
     the REST API exposure (/rest/v1/rpc/<name>).
   - Grant EXECUTE only to the service_role so internal Supabase
     auth operations still work.

3. Notes
   - No data changes. No schema changes. Idempotent.
*/

ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
ALTER FUNCTION public.generate_order_number() SECURITY DEFINER;
ALTER FUNCTION public.record_order_status_change() SECURITY DEFINER;
ALTER FUNCTION public.create_order_notification() SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_order_status_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order_notification() FROM PUBLIC, anon, authenticated;
