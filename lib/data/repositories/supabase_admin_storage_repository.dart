import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../../services/supabase_service.dart';
import 'admin_storage_repository.dart';

class SupabaseAdminStorageRepository implements AdminStorageRepository {
  static const _bucket = 'menu-media';

  StorageFileApi get _bucketApi => SupabaseService.client.storage.from(_bucket);

  @override
  Future<String> uploadImage({
    required String path,
    required Uint8List bytes,
    required String contentType,
  }) async {
    await _bucketApi.uploadBinary(
      path,
      bytes,
      fileOptions: FileOptions(upsert: true, contentType: contentType),
    );
    return _bucketApi.getPublicUrl(path);
  }

  @override
  Future<void> deleteImage(String path) async {
    try {
      await _bucketApi.remove([path]);
    } on StorageException {
      // Already gone or never existed — not an error for a best-effort
      // cleanup call (e.g. replacing an image whose old URL didn't
      // actually point into our bucket).
    }
  }
}
