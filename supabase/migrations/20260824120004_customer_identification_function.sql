-- ============================================================================
-- Broastin App 1 — Customer Identification RPC
--
-- The ONLY sanctioned way to look up a customer by phone. Direct
-- `select * from customers where phone = ?` is blocked entirely by RLS
-- (see previous migration) — this function is the sole, narrow exception,
-- and it deliberately returns nothing but an id and a boolean.
--
-- Behavior:
--   - Phone not found  -> creates a new customer, linked to the CALLER's
--                          current auth_user_id (auth.uid()), returns it.
--   - Phone found      -> returns the existing customer_id so the order
--                          attaches to the correct CRM record, but does
--                          NOT reassign auth_user_id and does NOT return
--                          name, saved addresses, or order history. A
--                          different device/session typing the same phone
--                          number can place an order under that identity,
--                          but cannot browse its previous data — ownership
--                          is only ever proven by auth_user_id, never by
--                          phone number alone.
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
  v_id uuid;
  v_is_new boolean := false;
begin
  select id into v_id from public.customers where phone = p_phone;

  if v_id is null then
    insert into public.customers (phone, name, auth_user_id)
    values (p_phone, p_name, auth.uid())
    returning id into v_id;
    v_is_new := true;
  end if;

  return query select v_id, v_is_new;
end;
$$;

revoke all on function public.identify_or_create_customer(text, text) from public;
grant execute on function public.identify_or_create_customer(text, text) to anon, authenticated;
