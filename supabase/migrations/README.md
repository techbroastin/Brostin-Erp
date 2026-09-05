# supabase/migrations — read this before touching anything in this folder

This project (`detqohhtihlygwxjasti`) is **shared** with an unrelated POS/
staff-PIN prototype that lives entirely in the `core` schema. That other
application's migration history was applied to this same remote project
*before* Broastin App 1's migrations existed, and it is not going away —
see the "Migration Strategy" decision report (2026-08-26) for the full
investigation.

## Why there are 6 files here that contain nothing but a comment

Supabase's CLI (`supabase db push`) tracks applied migrations in a remote
table, `supabase_migrations.schema_migrations`, keyed by version number.
Before it will push anything, it diffs the **local** files in this folder
against that **remote** table — and it does this comparison by version
number only (the numeric prefix of the filename), never by content.

The remote table already has 6 rows for the POS prototype's migrations,
dated 2026-08-16. Because those 6 versions had no matching local file, the
CLI refused to push anything at all — see error `LegacyDbPushMissingLocalError`.

The fix was **not** `supabase migration repair` and **not** `supabase db
pull` — both were considered and explicitly rejected, because either would
have required touching the remote migration history table's existing rows,
or pulling the POS schema's real definition into this repository (neither
of which Broastin App 1 should ever own).

Instead, this folder contains 6 **placeholder** files, one per POS
migration version, each containing only a comment:

- `20260816185902_core_schema.sql`
- `20260816185928_rls_helpers.sql`
- `20260816185941_staff_pin_management.sql`
- `20260816190016_security_hardening.sql`
- `20260816190033_pos_privilege_baseline.sql`
- `20260816190133_core_till_sessions.sql`

Their version numbers exactly match the 6 rows already in the remote
history table. This makes the CLI's version diff resolve cleanly, so
`supabase db push` only ever considers Broastin's own 4 migrations as
pending — the placeholders are never executed remotely (their
corresponding remote row already exists, so they're skipped as
"already applied"), and the POS prototype's actual schema is never
touched, read, or reproduced by this repository.

## DO NOT

- **Do not delete these 6 placeholder files.** Removing them reintroduces
  `LegacyDbPushMissingLocalError` on the next `supabase db push`.
- **Do not add real SQL to any of them.** They must stay comment-only.
  They correspond to another application's schema, not Broastin's.
- **Do not rename them.** The version prefix must exactly match the
  remote `schema_migrations` row it stands in for.
- **Do not run `supabase migration repair` or `supabase db pull`** to
  "clean this up." That was considered and rejected — see the strategy
  report referenced above.

## For future developers

If the POS/staff-PIN prototype's team adds a new migration to this same
shared project, this repository's next `supabase db push` will hit the
same `LegacyDbPushMissingLocalError` again for that new version. The fix
is the same pattern: add one more comment-only placeholder file here,
named with that migration's exact version and name from the remote
history table. Do not repair or pull to work around it.

This coordination cost is the direct consequence of two independent
applications sharing one Supabase project. If it becomes a recurring
burden, migrating Broastin App 1 to its own dedicated Supabase project is
the clean long-term fix — but that is a separate, deliberate decision, not
something to reach for casually.

## Broastin App 1's own migrations

Unaffected by any of the above — unchanged, in original order:

1. `20260824120001_core_schema.sql`
2. `20260824120002_orders_schema.sql`
3. `20260824120003_rls_policies.sql`
4. `20260824120004_customer_identification_function.sql`
