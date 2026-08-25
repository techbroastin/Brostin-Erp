# 01 — Product Overview

## What this is

**Broastin App 1** is the customer-facing ordering PWA for Broastin Fried
Chicken (single branch, see `AppConstants.singleBranchId`). A customer
scans a QR code placed at/near the restaurant, lands directly in the app,
browses the menu, and places a takeaway or delivery order — no app-store
install required.

## Two separate products (strict split)

This repository contains **only the customer ordering app**. It is one of
two products in the eventual system, and they are never to be merged:

| | Customer App (this repo) | Admin/Operations App |
|---|---|---|
| Status | Built (UI/UX phase, mock data) | Not started — out of scope here |
| Device | Mobile phone only | Desktop only |
| Entry point | QR code scan | Direct login |
| Interaction | Touch, portrait | Keyboard + mouse |
| Audience | Walk-in/dine-nearby customers | Restaurant staff/management |

See `02_REQUIREMENTS.md` for the full, strict statement of this split —
it governs every UI/layout decision in this app and must not be
reinterpreted as "just add a responsive desktop admin view later inside
this app."

## Customer journey (summary)

QR scan → Landing → Menu → Product Details → Cart → (identify by phone) →
Order Type → (Address, if delivery) → Review → Place Order → Confirmation
→ Status. Full detail in `11_CUSTOMER_FLOW.md`.

## Current phase

UI/UX built and live-browser QA'd against local mock data only — no
Supabase/backend connection yet. See `19_DEVELOPER_HANDOVER.md` for exact
status and `CHANGELOG.md` for what changed and when.
