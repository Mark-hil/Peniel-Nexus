/*
# Revoke EXECUTE on SECURITY DEFINER Functions

1. Security Changes
   - Revoke EXECUTE privilege from `anon` and `authenticated` roles on all
     SECURITY DEFINER functions that are only meant to be called internally
     by triggers or the database itself, not directly through the REST API.
   - Functions affected:
     - `handle_new_user()` — trigger function for new auth.users
     - `generate_order_number()` — used as a column default
     - `record_order_status_change()` — trigger function for order_timeline
     - `create_order_notification()` — trigger function for notifications
   - These functions are still callable by the `postgres` superuser and by
     trigger execution, which is all that's needed. Revoking from anon and
     authenticated closes the `/rest/v1/rpc/<function>` endpoint exposure.

2. Notes
   - No data changes.
   - No schema changes.
   - Idempotent: REVOKE is safe to re-run.
*/

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_order_status_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order_notification() FROM anon, authenticated;
