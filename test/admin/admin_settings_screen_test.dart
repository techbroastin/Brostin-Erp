import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:broastin_ordering/admin/presentation/screens/settings/admin_settings_screen.dart';
import 'package:broastin_ordering/admin/services/image_picker_service.dart';
import 'package:broastin_ordering/data/repositories/admin_branding_repository.dart';
import 'package:broastin_ordering/data/repositories/admin_storage_repository.dart';
import 'package:broastin_ordering/models/restaurant.dart';

import 'fake_admin_branding_repository.dart';
import 'fake_admin_storage_repository.dart';
import 'fake_image_picker_service.dart';

const _restaurant = Restaurant(id: 'r1', name: 'Broastin Fried Chicken');

Future<void> _pump(
  WidgetTester tester, {
  required FakeAdminBrandingRepository branding,
  FakeAdminStorageRepository? storage,
  ImagePickerService? picker,
}) async {
  await tester.pumpWidget(
    MultiProvider(
      providers: [
        Provider<AdminBrandingRepository>.value(value: branding),
        Provider<AdminStorageRepository>.value(
          value: storage ?? FakeAdminStorageRepository(),
        ),
        Provider<ImagePickerService>.value(
          value: picker ?? const FakeImagePickerService(null),
        ),
      ],
      child: const MaterialApp(home: Scaffold(body: AdminSettingsScreen())),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  group('AdminSettingsScreen', () {
    testWidgets('shows the restaurant name and an Upload action when no logo is set', (
      tester,
    ) async {
      await _pump(
        tester,
        branding: FakeAdminBrandingRepository(_restaurant),
      );

      expect(find.text('Broastin Fried Chicken'), findsOneWidget);
      expect(find.text('Upload'), findsOneWidget);
      expect(find.text('Remove'), findsNothing);
    });

    testWidgets('uploading a logo persists the URL and shows Replace/Remove', (
      tester,
    ) async {
      final branding = FakeAdminBrandingRepository(_restaurant);
      final storage = FakeAdminStorageRepository();
      final picker = FakeImagePickerService(
        PickedImage(bytes: Uint8List.fromList([1, 2, 3]), fileName: 'logo.png'),
      );
      await _pump(tester, branding: branding, storage: storage, picker: picker);

      await tester.tap(find.text('Upload'));
      await tester.pumpAndSettle();

      expect(storage.uploaded.keys, contains('branding/logo.png'));
      expect(branding.restaurant.logoUrl, contains('branding/logo.png'));
      expect(find.text('Replace'), findsOneWidget);
      expect(find.text('Remove'), findsOneWidget);
    });

    testWidgets('removing the logo clears it and falls back to Upload', (
      tester,
    ) async {
      final withLogo = Restaurant(
        id: _restaurant.id,
        name: _restaurant.name,
        logoUrl:
            'https://example.supabase.co/storage/v1/object/public/menu-media/branding/logo.png',
      );
      final branding = FakeAdminBrandingRepository(withLogo);
      final storage = FakeAdminStorageRepository();
      await _pump(tester, branding: branding, storage: storage);

      await tester.tap(find.text('Remove'));
      await tester.pumpAndSettle();

      expect(branding.restaurant.logoUrl, isNull);
      expect(storage.deleted, contains('branding/logo.png'));
      expect(find.text('Upload'), findsOneWidget);
    });
  });
}
