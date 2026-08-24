# 18 — Supabase Setup

## Project

- **Project ref:** `detqohhtihlygwxjasti`
- **URL:** `https://detqohhtihlygwxjasti.supabase.co`
- **Organization:** techbroastin's Org
- **Approved for:** Broastin App 1 (Customer Ordering PWA) exclusively.

This project was chosen after a forensic audit ruled out two other
Supabase projects (`vzamtmsqfmwgggtkkuag` / "afitinteriors project" and
`hivuaquqlwfwlbgtooko` / "afitcrm") — both belong to an unrelated business
("AFIT") and must never be touched by Broastin tooling — and one other
project (`uvhoabgmjylmdehqkflm`) that turned out not to be the intended
target. `detqohhtihlygwxjasti` was confirmed empty of any prior
schema/data before this codebase began writing migrations against it.

## Current state (as of this document)

See `19_DEVELOPER_HANDOVER.md` for the authoritative current-state block —
in short: **nothing in this section has been applied to the remote project
yet.** Everything below is documentation of commands to run later, not a
log of commands already run.

## Required manual step: enable Anonymous Sign-ins

Before Step 8 (wiring customer identification into the Flutter app) can
work, **enable Anonymous Sign-ins** in the Supabase dashboard for this
project: Authentication → Providers → Anonymous Sign-ins. This is a
dashboard action, not something a migration can or should do — it was
intentionally left for the project owner to enable directly. See
`08_AUTHENTICATION.md` for why this is required.

## Local development prerequisites

- Flutter 3.44.8+ (stable channel), Web platform enabled.
- Supabase CLI — available via `npx supabase` if not installed globally.
- The project's **publishable/anon key** (not the service-role key — that
  must never appear in Flutter code or be committed to git).

## Running the app locally

Supabase connection values are supplied at run/build time via
`--dart-define`, never hard-coded:

```
flutter run -d chrome \
  --dart-define=SUPABASE_URL=https://detqohhtihlygwxjasti.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=<publishable key>
```

## Applying the migrations (future step — not yet run)

Once the corrected local migrations are approved for remote application:

```
# From the project root:
npx supabase link --project-ref detqohhtihlygwxjasti

# Review what would be applied (dry run):
npx supabase db push --dry-run

# Apply migrations to the remote project:
npx supabase db push
```

`db push` only applies files under `supabase/migrations/` — it does **not**
run `supabase/seed.sql` automatically. Seeding is a deliberate, separate
step so real menu data entered later is never silently overwritten by demo
data.

## Applying the demo seed data (future step — not yet run, optional)

Only after migrations are applied, and only if demo/test data is wanted in
that environment:

```
# Local Supabase stack (if using `supabase start` for local dev):
npx supabase db reset

# Or, against the linked remote project directly:
npx supabase db execute --file supabase/seed.sql
```

Do not run this against a project that already has real menu data — it is
demo data only, clearly flagged `is_demo = true` on every product row.

## Verifying after applying (future step)

```
npx supabase migration list          # confirm all 4 migrations show as applied
npx supabase db diff                 # confirm no drift between local and remote
```

## What must never happen

- The service-role key must never be placed in Flutter code, `--dart-define`
  values used for the client app, or committed to git.
- `supabase db push` must never be run against `vzamtmsqfmwgggtkkuag` or
  `hivuaquqlwfwlbgtooko` (the unrelated AFIT projects).
- Auth/Storage/RLS settings must not be modified outside of what these
  migrations define, without a fresh review.
