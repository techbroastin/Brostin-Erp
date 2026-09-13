import 'dart:typed_data';

/// Owner-admin port for raw Storage writes, shared by product-image and
/// logo upload flows so the upload/delete mechanics exist in one place.
/// Authorization is enforced entirely by storage.objects RLS (see
/// supabase/migrations/20260915090000_admin_image_branding.sql) — never a
/// service-role key.
abstract class AdminStorageRepository {
  /// Uploads (upserting) [bytes] at [path] and returns its public URL.
  Future<String> uploadImage({
    required String path,
    required Uint8List bytes,
    required String contentType,
  });

  /// Best-effort delete — callers should not fail the overall operation if
  /// the object was already gone.
  Future<void> deleteImage(String path);
}
