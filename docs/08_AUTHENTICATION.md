# 08 — Authentication & Customer Identity

## Current status: Anonymous Auth NOT yet enabled

This is a deliberate, currently-incomplete state. Anonymous Sign-ins must
be enabled in the Supabase dashboard for project `detqohhtihlygwxjasti`
before the identity flow described below can function — that is the
project owner's action, not something applied by migration or by this
codebase. Until it's enabled, `identify_or_create_customer` will raise
`Authentication required: no active session...` for every call, by design
(it refuses to degrade into an insecure fallback).

## Why anonymous auth, not a real login

App 1's UX requirement is: customers browse and order without registering
an account or a password. But Row Level Security needs *some* way to tell
one customer's browser session apart from another's — otherwise "only see
your own orders" cannot be enforced at all. Supabase's **anonymous
sign-in** is the right primitive for this:

- Creates a real `auth.users` row with no credentials collected.
- Issues a session (persisted locally by `supabase_flutter`, survives page
  reloads) whose JWT carries a stable `auth.uid()` and `is_anonymous: true`.
- That session authenticates as Postgres role `authenticated` — not `anon`
  — which is why every ownership-scoped RLS policy in `07_SECURITY_RLS.md`
  targets `authenticated`.

## Identity architecture

```
Supabase anonymous auth.uid()
        ↓
customers.auth_user_id   (UNIQUE — the sole ownership anchor)
        ↓
customer_addresses.customer_id → customers.id
        ↓
orders.customer_id → customers.id
        ↓
order history (orders + order_items, scoped by the same chain)
```

Phone number is **not** part of this ownership chain anywhere. It is
collected at checkout (Screen 5), validated as a 10-digit Indian mobile
number client-side (`PhoneValidator`), normalized to `+91XXXXXXXXXX`, and
passed to `identify_or_create_customer(phone, name)` — which uses it purely
as a contact field on the caller's own row. See `07_SECURITY_RLS.md` for
the full ownership threat model.

## `identify_or_create_customer` behavior

- **New session, any phone:** creates a `customers` row with
  `auth_user_id = auth.uid()` and the given phone/name. Returns
  `(customer_id, is_new_customer = true)`.
- **Returning session (same browser, same anonymous auth.uid()):** finds
  its own existing row via `auth_user_id`, updates phone/name if changed,
  returns `(customer_id, is_new_customer = false)`.
- **A different session typing an already-used phone number:** creates a
  **new, separate** `customers` row for that session — it does not, and
  cannot, attach to the existing row owned by a different `auth_user_id`.
  See `07_SECURITY_RLS.md` for why this is the correct, deliberate
  behavior rather than a bug.

## Local session (not the same thing as auth)

`SessionService` (`lib/services/session_service.dart`) persists
`customer_id`/`phone`/`name` in `SharedPreferences` purely so screens like
"My Orders" and "My Profile" can restore state after a reload without
re-asking for the phone number. **This is a convenience cache, not a
security boundary** — the actual boundary is Supabase RLS via
`auth_user_id`. If `SessionService`'s cached `customer_id` were ever wrong
or tampered with client-side, RLS still only returns rows this session's
`auth_user_id` actually owns.

## Future: real phone OTP authentication

When phone OTP is introduced (SMS or WhatsApp-based, via Supabase Auth's
phone provider):

- Supabase supports **linking an anonymous session to a verified phone
  identity** (`linkIdentity`), which upgrades the *same* `auth.uid()` in
  place. No `customers`/`orders`/`customer_addresses` data migration is
  needed — the existing `auth_user_id` foreign keys keep working unchanged.
- This is also the natural point to reconcile the "same person, multiple
  `customers` rows across devices" situation described in
  `07_SECURITY_RLS.md` — once a phone number is cryptographically verified,
  a backend process can merge those pre-OTP rows into one.
- Do not store OTP codes/secrets in this codebase, ever — Supabase Auth
  owns that entirely once the provider is enabled.
- The `customers.auth_user_id` column and every RLS policy built around it
  require zero changes for this upgrade — that is precisely why
  `auth_user_id` (not phone) was chosen as the identity anchor from the
  start.

## What is NOT built in App 1

- No password-based login.
- No OTP/SMS verification (Twilio is visible as the project's configured
  SMS provider in Supabase Auth settings, but phone auth is not enabled —
  this appears to be pre-existing project configuration, not something set
  up by this codebase).
- No account recovery flow — there is no account to recover; identity is
  re-established by phone number + the same browser's anonymous session.
