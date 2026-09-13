import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/admin/domain/image_validators.dart';

void main() {
  group('ImageValidators.validate', () {
    test('rejects an empty file', () {
      expect(
        ImageValidators.validate(fileName: 'photo.png', byteLength: 0),
        isNotNull,
      );
    });

    test('rejects a file over the 3 MB limit', () {
      expect(
        ImageValidators.validate(
          fileName: 'photo.png',
          byteLength: 4 * 1024 * 1024,
        ),
        isNotNull,
      );
    });

    test('rejects an unsupported extension', () {
      expect(
        ImageValidators.validate(fileName: 'document.pdf', byteLength: 100),
        isNotNull,
      );
    });

    test('accepts a valid jpg/jpeg/png/webp file within the size limit', () {
      for (final name in ['photo.jpg', 'photo.jpeg', 'photo.PNG', 'photo.webp']) {
        expect(
          ImageValidators.validate(fileName: name, byteLength: 1024),
          isNull,
          reason: name,
        );
      }
    });
  });

  group('ImageValidators.extensionOf', () {
    test('returns the lowercase extension including the dot', () {
      expect(ImageValidators.extensionOf('Photo.PNG'), '.png');
    });

    test('returns null for a name with no extension', () {
      expect(ImageValidators.extensionOf('photo'), isNull);
    });
  });
}
