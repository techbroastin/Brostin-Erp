-- ============================================================================
-- Broastin App 1 — Known QA test QR token
--
-- restaurant_tables.qr_token defaults to a random gen_random_uuid()::text,
-- and by design there is no authorized read path back to it (not via the
-- anon key — zero client SELECT policy on this table — and not via any
-- privileged CLI connection either, which has no SELECT grant on any table
-- row data, only schema catalogs). That's correct security behavior, but
-- it also means the QA test table seeded in
-- 20260830090000_qa_test_dataset.sql has no way to actually be scanned/
-- tested without knowing its token in advance.
--
-- This sets a known, obviously-fake, clearly-labeled token on that one row
-- only, matched by its equally obvious TEST label — not by id, so this
-- cannot accidentally match any other row.
--
-- SAFETY: a single UPDATE, one row, one column, scoped by
-- table_number = 'TEST-1' (unique — see 20260830090000). No other row in
-- this table exists to match. No schema, RLS, constraint, trigger, or
-- function is touched. No other table is referenced.
-- ============================================================================

update public.restaurant_tables
set qr_token = 'TEST-QR-TOKEN-0001'
where table_number = 'TEST-1';
