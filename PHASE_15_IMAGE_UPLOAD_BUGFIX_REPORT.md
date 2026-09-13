# Phase 15 Bugfix — Product Image Upload Stuck

## Root cause

`ImagePickerServiceImpl.pickImage()` (`lib/admin/services/image_picker_service.dart`) called `ImagePicker().pickImage(source: ImageSource.gallery)` and awaited it directly. On Flutter Web, `image_picker`'s web implementation (`image_picker_for_web`) has no `onchange`/`cancel` event for a dismissed `<input type="file">` dialog — it detects a cancelled pick via a **window-focus heuristic** (assume "cancelled" once the browser window regains focus with no file selected). That heuristic does not always fire reliably. When it's missed, the underlying pick `Future` **never resolves at all** — not with a file, not with `null`, and not with an exception.

Every layer above this call was already correct: `AdminImageField._pickAndUpload()` wraps the whole flow in `try/catch` and resets `_busy` in every exit path, and `_ProductFormDialogState._uploadImage()`/`_removeImage()` have no un-awaited work. But `try/catch` cannot recover from an `await` that simply **never completes** — there was nothing to catch. This is a platform/plugin-level gap, not a logic bug in the upload/save/RLS/URL code.

## Reproduction

Reproduced live in the running Admin UI (Playwright, real browser, real Supabase project): opened Product → Edit → Product photo → **Replace**, then dismissed the native file dialog without selecting a file (`fileChooser.setFiles(undefined)`, i.e. Cancel). Result: the Replace/Remove buttons went disabled and a `CircularProgressIndicator` spun indefinitely — confirmed still stuck after a further 3+ seconds — with zero console errors, matching the reported symptom exactly. A completed, successful pick+upload (selecting a real file) worked correctly both before and after this fix, confirming the bug is specific to the no-file/cancelled path, not the upload/Storage/RLS/persistence code.

## Fix

Wrapped the `pickImage()` call in `ImagePickerServiceImpl` with a 60-second timeout that resolves to "no file" (`null`) instead of leaving the `Future` pending forever:

```dart
// lib/admin/services/image_picker_service.dart
static const _pickTimeout = Duration(seconds: 60);

Future<PickedImage?> pickImage() async {
  XFile? file;
  try {
    file = await _picker.pickImage(source: ImageSource.gallery).timeout(_pickTimeout);
  } on TimeoutException {
    return null;
  }
  if (file == null) return null;
  final bytes = await file.readAsBytes();
  return PickedImage(bytes: bytes, fileName: file.name);
}
```

A timed-out pick is treated identically to a user cancellation (the existing `if (picked == null) { setState(() => _busy = false); return; }` path in `AdminImageField`) — no scary error message for what looks, from the user's side, like "I closed the dialog." One file changed; no other file touched. `AdminImageField`, `admin_products_screen.dart`, the Storage/RLS/repository layers, and the Product dialog's layout are all unchanged.

## Tests

Added one regression test, `test/admin/admin_products_screen_test.dart` — *"a cancelled/no-op file picker leaves the upload button usable, not stuck loading"* — using the existing `FakeImagePickerService(null)` to assert that after tapping Upload with a picker that returns no file, the Upload button is re-enabled and no `CircularProgressIndicator` remains.

`flutter test`: **57/57 passed** (56 pre-existing + 1 new).
`flutter analyze`: 1 pre-existing info-level lint (unrelated), no new issues.
`flutter build web -t lib/main_admin.dart`: succeeds.

## Live verification (against `detqohhtihlygwxjasti`, real browser, owner logged in manually — password never seen)

1. **Reproduced the exact bug** on the pre-fix build (Cancel → stuck spinner, buttons disabled, confirmed still stuck 3s+ later).
2. **Rebuilt with the fix**, repeated the identical Cancel steps on the same product → immediately after cancelling the button was still momentarily busy (the underlying plugin flakiness itself is unchanged — that's expected), then within the 60s timeout window the button **automatically re-enabled itself** — confirmed by successfully opening a fresh file chooser from it (proof the control is interactive again, not just visually reset).
3. **Completed a real upload** immediately after recovery → "Image updated" shown, no stuck state.
4. **Save → Close → Reopen** the product → the uploaded image was still shown in the dialog (persistence confirmed) and via direct SQL: `products.image_url` correctly set to the Storage public URL.
5. **Customer Menu check**: loaded the real customer app (QR token `TEST-QR-TOKEN-0001`) → the Add-ons category card for "French Fries" showed the uploaded photo.
6. **Upload-failure path**: attempted to upload a 4 MB file (over the 3 MB cap) → validation rejected it immediately with "File must be 3 MB or smaller," buttons stayed/returned enabled, no hang — confirms failures still surface correctly and don't regress into the same stuck state.
7. **Cleanup**: removed the test image via the Admin UI; verified via SQL that `products.image_url` is `null` and the `menu-media` bucket has 0 objects.

## Security verification

No Storage RLS, bucket, or policy changes — this was a pure Flutter-side fix. Confirmed via SQL immediately before and after: `storage.objects` policies for `menu-media` unchanged (admin-only insert/update/delete/select, `to authenticated`, `is_app_admin()`-gated); no policy grants `anon` any `storage.objects` access; `restaurants`/`products` write policies untouched. No service-role credential used anywhere in this session.

## Result: **PASS**

Not committed, not pushed, per instructions. Phase 16 not started. Stopping here.
