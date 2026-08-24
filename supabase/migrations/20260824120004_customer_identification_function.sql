-- ============================================================================
-- Broastin App 1 — Customer Identification RPC (v2 — security-reviewed)
--
-- The ONLY sanctioned way to associate a phone number with a customer
-- record. Direct `select * from customers where phone = ?` is blocked
-- entirely by RLS — this function is the sole, narrow exception, and it
-- deliberately returns nothing but an id and a boolean.
--
-- THREAT MODEL ADDRESSED BY THIS VERSION:
--   Anonymous session A must NOT be able to type customer B's phone number
--   and gain access to B's existing customer record, addresses, or orders.
--   Phone number is an input/identification value, NEVER an authentication
--   credential.
--
-- DESIGN: auth_user_id — not phone — is the sole ownership anchor.
--   - "Which customer row is this?" is answered by "the row whose
--     auth_user_id equals the caller's own auth.uid()", full stop. Phone
--     number is never consulted to decide ownership, only to populate/
--     update the contact field on the caller's OWN row.
--   - This means phone is intentionally NOT unique across customers (see
--     the core schema migration for why) — two different anonymous
--     sessions can share a real-world phone number as two separate CRM
--     rows until a future real-OTP-verified merge unifies them.
--   - A direct consequence: this function can NEVER return, expose, or
--     mutate a customer row belonging to a different auth_user_id. There is
--     no code path in this function that even looks up a row by phone
--     alone without also filtering by the caller's own auth_user_id.
--
-- CONCURRENCY: uses a single atomic
--   INSERT ... ON CONFLICT (auth_user_id) DO UPDATE ... RETURNING
-- statement, so two simultaneous calls from the same session cannot race
-- into two rows (auth_user_id is UNIQUE) or into a lost update.
--
-- PRECONDITION: requires an authenticated session (including an anonymous
-- Supabase Auth session — anonymous sign-ins authenticate as role
-- "authenticated" with is_anonymous=true, auth.uid() populated; only a
-- request with no session at all runs as role "anon"). Until Anonymous
-- Sign-ins are enabled in the Supabase dashboard and the Flutter client
-- calls signInAnonymously() before this RPC, auth.uid() will be null and
-- this function will raise an exception rather than silently creating an
-- unownable/duplicate-prone row.
-- ============================================================================

create or replace function public.identify_or_create_customer(
  p_phone text,
  p_name text default null
)
returns table (customer_id uuid, is_new_customer boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_is_new boolean;
begin
  if v_uid is null then
    raise exception
      'Authentication required: no active session. Ensure Supabase anonymous sign-in has completed before calling identify_or_create_customer.';
  end if;

  insert into public.customers (phone, name, auth_user_id)
  values (p_phone, p_name, v_uid)
  on conflict (auth_user_id) do update
    set phone = excluded.phone,
        name = coalesce(excluded.name, public.customers.name)
  returning id, (xmax = 0) into v_id, v_is_new;

  return query select v_id, v_is_new;
end;
$$;

revoke all on function public.identify_or_create_customer(text, text) from public;
grant execute on function public.identify_or_create_customer(text, text) to anon, authenticated;
