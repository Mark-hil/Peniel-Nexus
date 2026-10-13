/*
# Switch SECURITY DEFINER Functions to SECURITY INVOKER

1. Security Changes
   - Change all 4 SECURITY DEFINER functions to SECURITY INVOKER so they
     cannot be abused via the REST API endpoint (/rest/v1/rpc/<name>).
   - These functions are only meant to be called internally:
     - `handle_new_user()` — trigger on auth.users INSERT
     - `generate_order_number()` — column default on orders
     - `record_order_status_change()` — trigger on orders UPDATE
     - `create_order_notification()` — trigger on notifications INSERT
   - With SECURITY INVOKER, calling via REST runs with the caller's
     privileges (anon/authenticated), which are limited by RLS. The
     trigger execution path still works because triggers run as the
     table owner.

2. Notes
   - No data changes. No schema changes. Idempotent.
*/

ALTER FUNCTION public.handle_new_user() SECURITY INVOKER;
ALTER FUNCTION public.generate_order_number() SECURITY INVOKER;
ALTER FUNCTION public.record_order_status_change() SECURITY INVOKER;
ALTER FUNCTION public.create_order_notification() SECURITY INVOKER;
