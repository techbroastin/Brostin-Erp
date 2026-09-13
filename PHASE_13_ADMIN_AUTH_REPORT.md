# Phase 13 — Owner Admin Authorization Backend

## A. Existing Auth/RLS architecture (as inspected)

- **Auth (remote config, via `supabase config diff`)**: `enable_anonymous_sign_ins = true`, email/password provider enabled (default, unchanged), email confirmations on, SMS/Twilio and MFA/TOTP enabled but unused by this app. No admin-specific auth config existed.
- **RLS (`20260824120003_rls_policies.sql` + inline policies)**: public read-only for `restaurants`/`branches`/`menu_categories`/`products`/`product_variants`; `customers`/`customer_addresses`/`orders`/`order_items` scoped strictly to `auth_user_id = auth.uid()`; `restaurant_tables` and `delivery_pricing_rules` have RLS enabled with **zero** policies (reachable only via `resolve_dining_table()` / `calculate_delivery_charge()` SECURITY DEFINER functions); `order_number_sequences` RLS enabled, zero policies. **No admin override existed anywhere** prior to this phase — confirmed by reading every policy file, not assumed.
- **`auth.users` (remote, non-sensitive columns only)**: 10 anonymous customer sessions (`is_anonymous = true`) plus exactly **one** non-anonymous account, `device1@test.local` (id `00000000-0000-0000-0000-0000000000d1`). This account's synthetic all-zeros UUID and creation timestamp match the unrelated POS/staff-PIN prototype's `core.*`/`staff_pin_management` migrations (2026-08-16), not a Broastin owner identity. It was **not** treated as the owner and was **not** granted any admin access.

## B. Owner authorization design

Implemented exactly the drafted architecture — no changes made to it:

```
auth.users → app_admins (auth_user_id, is_active) → is_app_admin() [SECURITY DEFINER] → future admin-gated policies
```

- `public.app_admins`: RLS enabled, one policy (`select` own row only). No insert/update/delete policy for any client role — rows are provisioned only by direct SQL as project owner, never by the app.
- `public.is_app_admin()`: `SECURITY DEFINER`, `STABLE`, no parameters (so a caller cannot pass an arbitrary uid — it always evaluates against the caller's own `auth.uid()`). Returns `false` for any session with no active `app_admins` row.
- Grants **no access to any business table** — identity primitive only, as designed in Phase 12.

## C. Migration applied

`supabase/migrations/20260913120000_owner_admin_foundation.sql` applied to **`detqohhtihlygwxjasti` only**, via `supabase db push` (dry-run reviewed first — confirmed exactly one pending migration, no seeds, no role changes).

Objects created/verified on remote:
- `public.app_admins` — `relrowsecurity = true`; 1 policy (`app_admins_select_own`, SELECT, own row); 0 rows (no owner provisioned yet).
- `public.is_app_admin()` — `SECURITY DEFINER`, `STABLE`, `search_path = public`.
- Migration history: local and remote now show `20260913120000` as applied; all prior 18 migrations unchanged.

## D. Security verification (executed against the live remote DB, read-only/rollback-only queries)

| # | Scenario | Result |
|---|---|---|
| 1 | Unauthenticated request (`anon` role, no JWT) → `is_app_admin()` | **false** (PASS) |
| 2 | Anonymous customer session (`authenticated` role, JWT sub = existing anon customer) → `is_app_admin()` | **false** (PASS) |
| 3 | Existing non-admin authenticated user (`device1@test.local`) → `is_app_admin()` | **false** (PASS) |
| 4 | Authorized owner → `is_app_admin()` returns true | **Not testable — no owner account exists yet.** See section G. |
| 5 | Helper abused to grant another user admin | `is_app_admin()` takes no arguments and reads only the caller's own `auth.uid()` — cannot target another uid. Directly attempting `INSERT INTO app_admins` as an ordinary authenticated user was tested and **rejected**: `ERROR 42501: new row violates row-level security policy for table "app_admins"` (PASS). |
| 6 | Existing customer ordering RLS intact | Policy count on `customers`/`orders`/`order_items`/`customer_addresses` unchanged (7, matching pre-migration policy definitions) (PASS) |
| 7 | Existing RLS behavior otherwise intact | `supabase config diff` and direct catalog queries show no unrelated schema/policy change; `core.*`, `t_tokens`, `t_results`, `t_snapshot` untouched (PASS) |

All test/rollback SQL ran inside `BEGIN; ... ROLLBACK;` blocks (except the read-only checks) — no data was left mutated.

## E. Customer-app regression verification

- No Flutter files changed this phase (backend-only).
- `flutter analyze`: 1 pre-existing info-level lint (unrelated, same as Phase 12) — no new issues.
- `flutter test`: 26/26 passed.
- Customer app's anonymous-session bootstrap, menu read policies, and order placement policies are byte-for-byte unchanged by this migration.

## F. Test/build results

| Check | Result |
|---|---|
| `supabase db push --dry-run` | 1 migration pending, 0 seeds, 0 roles |
| `supabase db push` | Applied successfully |
| `flutter analyze` | 1 pre-existing info-level issue, no new issues |
| `flutter test` | 26/26 passed |
| `flutter build web` (customer) | Succeeds |
| `flutter build web -t lib/main_admin.dart` (admin) | Succeeds |

## G0. Owner provisioning — completed 2026-09-13

The owner Auth account (`admin.broastin@gmail.com`) was created manually by the user in Supabase Studio prior to this step, per the recommendation in section H below (original text preserved further down for the record).

- **Auth user found**: exactly one match for `admin.broastin@gmail.com` — `id 8e60ef17-84ae-461b-8c28-bc8720332933`, `is_anonymous = false`, `email_confirmed_at` set at creation. Verified this is the only account with that email and is not the unrelated `device1@test.local` POS-prototype account — confirmed intended owner.
- **`app_admins` row inserted**: exactly one row (`auth_user_id = 8e60ef17-84ae-461b-8c28-bc8720332933`, `is_active = true`) inserted via `supabase db query --linked`. Table now has exactly 1 row (verified by count).
- **Verification (JWT simulated in a rolled-back transaction against the live remote DB, `set local role` + `set local request.jwt.claims`)**:

| # | Scenario | Result |
|---|---|---|
| 1 | Owner (`8e60ef17-...`) → `is_app_admin()` | **true** (PASS) |
| 2 | Existing anonymous customer session → `is_app_admin()` | **false** (PASS) |
| 3 | Existing non-admin authenticated user (`device1@test.local`) → `is_app_admin()` | **false** (PASS) |
| 4 | Unauthenticated (`anon` role, no JWT) → `is_app_admin()` | **false** (PASS) |
| 5 | Ordinary authenticated user attempts self-insert into `app_admins` | **Rejected**: `ERROR 42501: new row violates row-level security policy for table "app_admins"` (PASS) |
| 6 | Customers/orders RLS unchanged | Policy counts: `customers`=2, `orders`=2, `order_items`=2, `customer_addresses`=1 (total 7) — identical to pre-provisioning baseline (PASS) |
| 7 | `app_admins` row count after failed self-insert attempt | Still exactly 1 (the rollback left no stray row) (PASS) |

No production data mutated outside the single intended `app_admins` insert; all test scenarios ran in `BEGIN; ... ROLLBACK;` blocks.

- **Flutter regression re-verified**: `flutter analyze` (1 pre-existing info-level lint, unchanged), `flutter test` (26/26 passed), `flutter build web` (customer, succeeds), `flutter build web -t lib/main_admin.dart` (admin, succeeds).
- **Live admin login test**: served the admin build locally (`http://localhost:8765`, built with the project's real `SUPABASE_URL` and the **publishable** anon key — never the service-role key) and asked the user to sign in directly in their own browser so the password was never seen, typed, or logged by me. Result: the app returned Supabase's own `Invalid login credentials` error (surfaced verbatim by `AdminAuthController.signIn`, `lib/admin/services/admin_auth_controller.dart:46-49` — no app-side bug in that path). Checked the account server-side for any blocking condition: `email_confirmed_at` set, `confirmed_at` set, `banned_until` null, `deleted_at` null, a password hash is present, `last_sign_in_at` is still null (consistent with no successful sign-in ever occurring). Nothing on the backend is blocking login — this points to a credential-entry mismatch (e.g. typo) at the point the password was typed, not a defect in the authorization foundation. Per rule 10/12, I did not attempt to set, reset, or guess the password. **A successful end-to-end login is therefore not yet confirmed** — if the password needs resetting, that should be done by the user in Supabase Studio (Auth → Users → the account → "Send password recovery" or a manual reset), then the login can be retried.

## G. Remaining security concern (non-blocking, informational)

`is_app_admin()`'s EXECUTE privilege is held by `anon`, `authenticated`, and `service_role` (Supabase's project-level default privileges grant EXECUTE on new `public` functions to these roles automatically; the migration's `revoke all from public` does not remove role-specific default grants, only the `PUBLIC` pseudo-role's). This is **not exploitable**: the function returns only a boolean, takes no arguments, and for an `anon`-role call `auth.uid()` is `NULL`, so it always returns `false` — no data or admin capability is exposed. Flagging for awareness; no fix applied since it changes nothing security-relevant and doing so would be an out-of-scope migration.

**Blocking item — owner identity**: no real owner Auth account exists in `detqohhtihlygwxjasti`. Per this phase's explicit instruction, I did not invent, guess, or repurpose any account (specifically, did not treat `device1@test.local` as the owner — it belongs to the unrelated POS prototype). `app_admins` currently has 0 rows, so **no one** has admin access yet — the interface is safely locked out until you provision one.

## H. Next phase recommendation

**Action required from you before any further admin work:**
1. Provide the real owner email address (and set a password) — either by creating the account yourself in Supabase Studio → Auth → Users, or telling me the email so I can create it via the Management API (I will not set or see the password if you create it yourself).
2. Once the account exists, I'll insert its `auth_user_id` into `app_admins` (one-off SQL, shown to you before running) and re-verify scenario 4 (owner → `is_app_admin()` = true) live.

**Next phase (Phase 14)**, after owner provisioning is confirmed: Menu (Categories + Products) admin CRUD end-to-end — screens + repository + narrowly-scoped per-table admin RLS policies gated on `is_app_admin()`, as recommended in the Phase 12 report.

## Result (original, superseded by section G0): **PARTIAL** — backend authorization foundation is applied, verified, and secure; owner account provisioning is blocked pending your input (section G/H).

## G1. Password reset — account was recreated, re-linked (2026-09-13)

The user reset the owner password in Supabase Studio. Before re-testing login, re-inspected `auth.users` for `admin.broastin@gmail.com` and found the reset had actually **recreated the account** rather than changed the existing one in place:

- The original account (`auth_user_id 8e60ef17-84ae-461b-8c28-bc8720332933`) no longer exists.
- A new account now holds that email: `auth_user_id 38eaf1f9-142c-4d74-a9ab-7d701c700267`, created `2026-09-13 16:46:36 UTC`, `is_anonymous = false`.
- Because `app_admins.auth_user_id` references `auth.users(id) on delete cascade`, deleting the old account **cascade-deleted its `app_admins` row** — the table was back to 0 rows, meaning `is_app_admin()` would have returned `false` for the new account despite a valid login.

This was caught before declaring success, not after. Re-provisioned: inserted one new `app_admins` row for `38eaf1f9-142c-4d74-a9ab-7d701c700267` (table verified back to exactly 1 row) and reran the full verification suite against the live remote DB:

| # | Scenario | Result |
|---|---|---|
| 1 | Owner (new id `38eaf1f9-...`) → `is_app_admin()` | **true** (PASS) |
| 2 | Anonymous customer session → `is_app_admin()` | **false** (PASS) |
| 3 | Non-admin authenticated user (`device1@test.local`) → `is_app_admin()` | **false** (PASS) |
| 4 | Unauthenticated (`anon` role) → `is_app_admin()` | **false** (PASS) |
| 5 | Ordinary authenticated user self-insert into `app_admins` | **Rejected** (`42501` RLS violation) (PASS) |
| 6 | `customers`/`orders`/`order_items`/`customer_addresses` policy counts | 2/2/2/1 = 7, unchanged (PASS) |
| 7 | `app_admins` row count after re-provisioning + failed self-insert | Exactly 1 (PASS) |

**Live login retest**: user opened the locally served admin build (real `SUPABASE_URL` + publishable anon key) and signed in directly in their own browser — password never seen, typed, or logged by me. Result: **login succeeded, admin dashboard/shell loaded**, confirmed by `auth.users.last_sign_in_at` now populated (`2026-09-13 16:46:52 UTC`) for the current owner id. User confirmed no browser console errors.

**Dashboard access model** (`lib/admin/core/admin_router.dart`): the router redirects to `/login` only when `!auth.isSignedIn`; reaching the dashboard shell requires a real (non-anonymous) signed-in session, but does **not** itself check `is_app_admin()` — by design (see `admin_auth_controller.dart` header comment): a signed-in session is not proof of owner access, and actual admin data access is meant to be gated per-table by RLS policies keyed on `is_app_admin()`, which land in Phase 14 (no admin data tables/policies exist yet, so there is nothing sensitive reachable at this shell-only stage). This matches the Phase 12 design and is not a defect.

**Customer app unaffected**: no files under `lib/` other than `lib/admin/**` and `lib/main_admin.dart` were touched this phase; `lib/main.dart`'s anonymous-session bootstrap and customer RLS policies are untouched (git diff confirms no customer-path files modified).

## Final result: **PASS**

- Owner authorization backend: **PASS** — `app_admins` correctly links to the owner's current (post-reset) `auth_user_id`; `is_app_admin()` verified true for the owner and false for every other tested identity; self-insert rejected; customer/order RLS unchanged.
- Flutter regression (`flutter analyze`, `flutter test`, `flutter build web`, `flutter build web -t lib/main_admin.dart`): **PASS**.
- Live admin login with the owner account: **PASS** — real Supabase sign-in succeeded, dashboard shell loaded, no console errors, `last_sign_in_at` recorded server-side.
- Customer app: **PASS** — unaffected, no customer-path files changed.

Committed as Phase 13 (migration + admin auth/login code + this report). Not pushed to git. Not starting Phase 14. Stopping here.
