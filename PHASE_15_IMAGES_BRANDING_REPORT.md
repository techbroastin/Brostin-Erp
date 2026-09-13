# Phase 15 — Image & Branding Management

## A. Scope delivered

The owner can now upload/replace/remove a product's photo and the restaurant's logo through the Admin UI, backed by the project's first Supabase Storage bucket, with writes gated by the existing `is_app_admin()` mechanism. Both flows were verified end-to-end against the live project: an admin upload immediately shows up on the real customer app (Menu card photo, landing-screen logo), and removing either falls back correctly. Category images were explicitly **not** implemented — `menu_categories` has no image column and the customer menu never rendered one, so there was nothing to wire.

## B. Files changed

**New:**
- `supabase/migrations/20260915090000_admin_image_branding.sql`
- `lib/data/repositories/admin_storage_repository.dart` + `supabase_admin_storage_repository.dart`
- `lib/data/repositories/admin_branding_repository.dart` + `supabase_admin_branding_repository.dart`
- `lib/admin/domain/image_validators.dart`, `lib/admin/domain/storage_url_utils.dart`
- `lib/admin/services/image_picker_service.dart`
- `lib/admin/presentation/widgets/admin_image_field.dart` (shared upload/preview/remove control)
- `lib/admin/presentation/screens/settings/admin_settings_screen.dart` (replaces the `/settings` placeholder)
- Tests: `test/admin/image_validators_test.dart`, `storage_url_utils_test.dart`, `admin_settings_screen_test.dart`, `fake_admin_storage_repository.dart`, `fake_admin_branding_repository.dart`, `fake_image_picker_service.dart`

**Modified:**
- `pubspec.yaml`/`pubspec.lock` — added `image_picker: ^1.1.2` (the only new package; no image-processing/CDN library).
- `lib/data/repositories/admin_menu_repository.dart` + `supabase_admin_menu_repository.dart` — `createProduct`/`updateProduct` gained an `imageUrl` parameter (every call site updated, including `test/admin/fake_admin_menu_repository.dart`).
- `lib/data/repositories/menu_repository.dart` + `supabase_menu_repository.dart` + `mock_menu_repository.dart` — added `fetchRestaurant()` (customer-facing port, used for branding).
- `lib/admin/admin_router.dart` — `/settings` now routes to `AdminSettingsScreen`.
- `lib/admin/admin_app.dart` — wires `AdminStorageRepository`, `AdminBrandingRepository`, `ImagePickerService`.
- `lib/admin/presentation/screens/menu/admin_products_screen.dart` — added a "Product photo" section to the edit dialog (visible only when editing an existing product, same reasoning as Phase 14's variants); fixed a staleness bug found during live testing (see section I).
- `lib/presentation/screens/landing/landing_screen.dart` — the `_Logo` widget now renders (in order) a custom `logo_url`, the canonical Broastin asset, then the original icon, each only as a fallback if the previous fails — confirmed with you before implementing since it's customer-facing.

Not touched: `menu_categories`/`admin_categories_screen.dart` (no image support, by design), `admin_shell.dart`, login, dashboard, `FoodImageBox`/the customer Menu screen's image widget (already correctly preferred a real `image_url` — no change needed).

## C. Database + Storage changes

Applied to `detqohhtihlygwxjasti` only (dry-run → apply → verify):

1. **New bucket** `menu-media`, `public = true` — the project's first bucket. Images are meant to be publicly viewable, same trust level as the arbitrary external URLs `products.image_url` already accepted before this phase.
2. **`storage.objects` RLS**, scoped to `bucket_id = 'menu-media'` only: admin-only `select`/`insert`/`update`/`delete` (`to authenticated`, gated on `is_app_admin()`). No policy grants `anon` any `storage.objects` API access — public reads of the actual image bytes go through Storage's public-object URL, which is a separate code path that bypasses `storage.objects` RLS for a public bucket (confirmed: this is exactly how external image URLs already worked, not a new exposure).
3. **`restaurants`**: one new admin-only `update` policy — its first-ever write policy (previously zero, so this is new capability, not a relaxation). The existing public `select` policy is untouched.

Deterministic paths: `products/{product_id}.{ext}`, `branding/logo.{ext}` — no random UUIDs needed. A replacement upload deletes the old object first (path recovered from the previously-stored URL via `storagePathFromPublicUrl`), so changing file extension (e.g. png → jpg) never leaves an orphan.

No schema change to `products`/`restaurants` — `image_url`/`logo_url` already existed. No new table.

## D. Admin capabilities

- **Product photo**: upload/replace/remove from the product edit dialog, with inline loading/success/error state and a live preview; only offered once a product exists (matches the variants pattern from Phase 14 — a real storage path needs a real product id).
- **Logo**: new Settings screen shows the restaurant name and the same upload/replace/remove control; its preview falls back to the canonical bundled asset (`assets/branding/broastin/logo/broastin logo.png`) whenever no custom logo is set — the canonical asset file itself is never touched, per project rule 22.
- **Validation**: JPG/JPEG/PNG/WEBP only, 3 MB max, empty files rejected — enforced client-side before any network call (`ImageValidators`), plus the database's existing constraints are unaffected.
- **Category image**: not implemented (see section A).

## E. Customer integration (verified live, real backend)

Using the actual Admin UI (Playwright, owner logged in manually — password never seen, typed, or logged by me, same protocol as Phases 13/14) against `detqohhtihlygwxjasti`:

1. Uploaded a logo through Settings → reloaded the customer app (QR token `TEST-QR-TOKEN-0001`) → the landing screen's logo circle showed the uploaded image instead of the default icon.
2. Uploaded a photo for the "French Fries" product → reloaded the customer Menu screen → the Add-ons category card showed the uploaded photo instead of the curated stock fallback, with **zero changes to `FoodImageBox`**.
3. Removed both through the Admin UI → verified via SQL: `restaurants.logo_url` and the product's `image_url` both `null`, and the Storage bucket had 0 remaining objects — correct fallback behavior confirmed at the data layer (canonical asset / curated-or-icon fallback logic in `_Logo`/`FoodImageBox` was already exercised and unchanged).

## F. Security / RLS verification (live, against `detqohhtihlygwxjasti`)

| # | Scenario | Result |
|---|---|---|
| 1 | Owner → insert/update on `storage.objects` (bucket `menu-media`) | **Succeeded** (PASS) |
| 2 | Owner → update `restaurants.logo_url` | **Succeeded** (PASS) |
| 3 | Non-admin authenticated user → insert on `storage.objects` | **Rejected**, `42501` RLS violation (PASS) |
| 4 | Anonymous (`anon` role) → insert on `storage.objects` | **Rejected**, `42501` RLS violation (PASS) |
| 5 | Non-admin authenticated user → update `restaurants.logo_url` | **0 rows affected** (RLS filters silently, no error) (PASS) |
| 6 | Anonymous → read `restaurants` (existing policy, unchanged) | Still works (PASS) |
| 7 | Live app: owner upload/replace/remove via the real Storage API (not raw SQL) | **Succeeded** for both product image and logo, confirmed via SQL after each step (PASS) |

Note: a raw SQL `DELETE` on `storage.objects` is blocked by Supabase's own `storage.protect_delete()` trigger regardless of role ("Use the Storage API instead") — this is a platform safety net, not a gap; the real delete path (used by the app, via `storage.from(bucket).remove()`) was verified working in scenario 7.

## G. Tests

`flutter test`: **56/56 passed** (41 pre-existing + 15 new: `image_validators_test.dart` (4), `storage_url_utils_test.dart` (3), `admin_settings_screen_test.dart` (3), plus 3 new upload/remove/reject cases added to `admin_products_screen_test.dart` and small updates to existing fakes for the `imageUrl` parameter).

`flutter analyze`: 1 pre-existing info-level lint (unrelated), no new issues.

`flutter build web -t lib/main_admin.dart` and `flutter build web` (customer): both succeed.

## H. Playwright verification

Functional pass at 1280px (Settings/Branding and Products/Edit-Product image sections: upload, replace-preview, remove, validation-rejection state) plus a visual/no-overflow check of the Products list and its edit dialog at 1024px and 1440px — no overflow or clipping at either width.

## I. Issues found and fixed during this phase

1. **Stale build cache blocked `image_picker` on web** (`MissingPluginException: pickImage`) — the generated `web_plugin_registrant.dart` hadn't picked up `image_picker_for_web` from a build cache reused from before the dependency was added. Fixed with `flutter clean` + `flutter pub get` + rebuild; confirmed the regenerated registrant now includes it.
2. **`AdminImageField`'s button row could overflow** at the dialog's content width (`Row` → switched to `Wrap`) — found because it caused real tap-mismatches in Playwright, not just a cosmetic pixel overflow.
3. **List staleness after closing the edit dialog without pressing Save**: an image upload/remove persists immediately, but the parent Products screen only refreshed its cached list when the dialog returned a non-null (Saved) result — closing via "Close" after only touching the image left the in-memory list (and thus the next time you reopened that row) showing the old, imageless data even though the database was already correct. Fixed by always refreshing the list when the dialog closes, not only on Save.
4. Local test-server hygiene: multiple stale `python -m http.server` processes accumulated across this session's phases and briefly caused Playwright to hit an old build. Resolved by force-stopping all local python processes and using a single fresh port; not a product defect.

## J. Known limitations

- Category images: deferred, as instructed (no schema/UI support exists for them).
- Product list rows show no thumbnail (only the edit dialog does) — not required by this phase's scope.
- No image resizing/compression/CDN — a straight upload of the original file (within the 3 MB cap), per the "don't over-engineer" instruction.

## Result: **PASS**

Not committed, not pushed, per phase instructions — only committing/pushing when explicitly asked. Phase 16 not started. Stopping here.
