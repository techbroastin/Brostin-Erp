-- ============================================================================
-- Broastin App 1 — Tighten SECURITY DEFINER trigger-function privileges
--
-- Follow-up to the post-migration verification audit (2026-08-26). That
-- audit found that generate_order_number(), set_order_item_snapshot(), and
-- recalculate_order_totals() — despite each carrying `revoke all on
-- function ... from public` in the original migrations — are still directly
-- executable by the `anon` and `authenticated` roles. This is because
-- Supabase grants those two roles function EXECUTE via a project-level
-- default privilege, a separate channel from the `PUBLIC` pseudo-role that
-- `revoke ... from public` targets. Verified directly with
-- has_function_privilege('anon', ..., 'EXECUTE') = true prior to this
-- migration.
--
-- Practical exploitability of the original gap was already null — all
-- three are `returns trigger` functions, and PostgreSQL refuses to execute
-- a trigger function outside real trigger context regardless of EXECUTE
-- privilege. This migration is defense-in-depth: it makes the privilege
-- state match the original migrations' documented intent exactly, rather
-- than relying on the trigger-context restriction alone.
--
-- identify_or_create_customer() is deliberately NOT touched here — it is
-- the intentional customer-identification RPC and must remain callable by
-- anon and authenticated, per its own migration's explicit grant.
--
-- SAFETY: three REVOKE statements only. No DROP, no TRUNCATE, no ALTER, no
-- change to any table, column, constraint, index, trigger, or RLS policy.
-- Idempotent — revoking a privilege that is already absent is a no-op.
-- ============================================================================

revoke execute on function public.generate_order_number() from anon, authenticated;
revoke execute on function public.set_order_item_snapshot() from anon, authenticated;
revoke execute on function public.recalculate_order_totals() from anon, authenticated;
