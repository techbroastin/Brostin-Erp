import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/admin/domain/storage_url_utils.dart';

void main() {
  group('storagePathFromPublicUrl', () {
    test('recovers the path from a well-formed public URL', () {
      final url =
          'https://xyz.supabase.co/storage/v1/object/public/menu-media/products/p1.png';
      expect(storagePathFromPublicUrl('menu-media', url), 'products/p1.png');
    });

    test('returns null for a foreign/unrelated URL', () {
      expect(
        storagePathFromPublicUrl(
          'menu-media',
          'https://images.unsplash.com/photo-123',
        ),
        isNull,
      );
    });

    test('returns null for null input', () {
      expect(storagePathFromPublicUrl('menu-media', null), isNull);
    });
  });
}
