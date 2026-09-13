import 'dart:typed_data';

import 'package:broastin_ordering/data/repositories/admin_storage_repository.dart';

/// In-memory fake standing in for Supabase Storage.
class FakeAdminStorageRepository implements AdminStorageRepository {
  final Map<String, Uint8List> uploaded = {};
  final List<String> deleted = [];

  @override
  Future<String> uploadImage({
    required String path,
    required Uint8List bytes,
    required String contentType,
  }) async {
    uploaded[path] = bytes;
    return 'https://example.supabase.co/storage/v1/object/public/menu-media/$path';
  }

  @override
  Future<void> deleteImage(String path) async {
    uploaded.remove(path);
    deleted.add(path);
  }
}
