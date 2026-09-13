import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:broastin_ordering/admin/presentation/screens/menu/admin_products_screen.dart';
import 'package:broastin_ordering/admin/services/image_picker_service.dart';
import 'package:broastin_ordering/data/repositories/admin_menu_repository.dart';
import 'package:broastin_ordering/data/repositories/admin_storage_repository.dart';
import 'package:broastin_ordering/models/menu_category.dart';
import 'package:broastin_ordering/models/product.dart';
import 'package:broastin_ordering/models/product_variant.dart';

import 'fake_admin_menu_repository.dart';
import 'fake_admin_storage_repository.dart';
import 'fake_image_picker_service.dart';

const _category = MenuCategory(
  id: 'cat-1',
  name: 'Burgers',
  displayOrder: 1,
  isActive: true,
);

Future<void> _pump(
  WidgetTester tester,
  FakeAdminMenuRepository repo, {
  FakeAdminStorageRepository? storage,
  ImagePickerService? picker,
}) async {
  await tester.pumpWidget(
    MultiProvider(
      providers: [
        Provider<AdminMenuRepository>.value(value: repo),
        Provider<AdminStorageRepository>.value(
          value: storage ?? FakeAdminStorageRepository(),
        ),
        Provider<ImagePickerService>.value(
          value: picker ?? const FakeImagePickerService(null),
        ),
      ],
      child: const MaterialApp(home: Scaffold(body: AdminProductsScreen())),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  group('AdminProductsScreen', () {
    testWidgets('shows the empty state with no products', (tester) async {
      await _pump(tester, FakeAdminMenuRepository(categories: [_category]));
      expect(find.text('No products found.'), findsOneWidget);
    });

    testWidgets('lists existing products with category and price', (
      tester,
    ) async {
      final repo = FakeAdminMenuRepository(
        categories: [_category],
        products: [
          const Product(
            id: 'p1',
            categoryId: 'cat-1',
            name: 'Classic Burger',
            price: 149,
            isAvailable: true,
            displayOrder: 1,
            isDemo: false,
          ),
        ],
      );
      await _pump(tester, repo);

      expect(find.text('Classic Burger'), findsOneWidget);
      expect(find.textContaining('149.00'), findsOneWidget);
    });

    testWidgets('toggling featured calls updateProduct with isFeatured true', (
      tester,
    ) async {
      final repo = FakeAdminMenuRepository(
        categories: [_category],
        products: [
          const Product(
            id: 'p1',
            categoryId: 'cat-1',
            name: 'Classic Burger',
            price: 149,
            isAvailable: true,
            displayOrder: 1,
            isDemo: false,
            isFeatured: false,
          ),
        ],
      );
      await _pump(tester, repo);

      await tester.tap(find.byIcon(Icons.star_border));
      await tester.pumpAndSettle();

      expect(repo.products.single.isFeatured, isTrue);
    });

    testWidgets(
      'deleting a product with variants shows the blocked dialog',
      (tester) async {
        final repo = FakeAdminMenuRepository(
          categories: [_category],
          products: [
            const Product(
              id: 'p1',
              categoryId: 'cat-1',
              name: 'Classic Burger',
              price: 149,
              isAvailable: true,
              displayOrder: 1,
              isDemo: false,
            ),
          ],
          variants: [
            const ProductVariant(
              id: 'v1',
              productId: 'p1',
              name: 'Meal',
              price: 199,
              isDefault: true,
              displayOrder: 1,
              isAvailable: true,
            ),
          ],
        );
        await _pump(tester, repo);

        await tester.tap(find.byIcon(Icons.delete_outline));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Delete'));
        await tester.pumpAndSettle();

        expect(find.text('Can\'t delete'), findsOneWidget);
        expect(repo.products, hasLength(1));
      },
    );

    testWidgets('creating a product calls the repository and refreshes list', (
      tester,
    ) async {
      final repo = FakeAdminMenuRepository(categories: [_category]);
      await _pump(tester, repo);

      await tester.tap(find.text('Add Product'));
      await tester.pumpAndSettle();
      await tester.enterText(find.widgetWithText(TextFormField, 'Name'), 'Fries');
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Price'),
        '99',
      );
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Display order'),
        '1',
      );
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(repo.products, hasLength(1));
      expect(repo.products.single.name, 'Fries');
    });

    testWidgets(
      'uploading a valid image on an existing product persists and updates the preview',
      (tester) async {
        final repo = FakeAdminMenuRepository(
          categories: [_category],
          products: [
            const Product(
              id: 'p1',
              categoryId: 'cat-1',
              name: 'Classic Burger',
              price: 149,
              isAvailable: true,
              displayOrder: 1,
              isDemo: false,
            ),
          ],
        );
        final storage = FakeAdminStorageRepository();
        final picker = FakeImagePickerService(
          PickedImage(bytes: Uint8List.fromList([1, 2, 3]), fileName: 'photo.png'),
        );
        await _pump(tester, repo, storage: storage, picker: picker);

        await tester.tap(find.byIcon(Icons.edit_outlined));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('Upload'));
        await tester.tap(find.text('Upload'));
        await tester.pumpAndSettle();

        expect(storage.uploaded.keys, contains('products/p1.png'));
        expect(repo.products.single.imageUrl, contains('products/p1.png'));
        expect(find.text('Image updated'), findsOneWidget);
      },
    );

    testWidgets(
      'an oversized file is rejected before any repository or storage call',
      (tester) async {
        final repo = FakeAdminMenuRepository(
          categories: [_category],
          products: [
            const Product(
              id: 'p1',
              categoryId: 'cat-1',
              name: 'Classic Burger',
              price: 149,
              isAvailable: true,
              displayOrder: 1,
              isDemo: false,
            ),
          ],
        );
        final storage = FakeAdminStorageRepository();
        final picker = FakeImagePickerService(
          PickedImage(
            bytes: Uint8List(4 * 1024 * 1024),
            fileName: 'big.png',
          ),
        );
        await _pump(tester, repo, storage: storage, picker: picker);

        await tester.tap(find.byIcon(Icons.edit_outlined));
        await tester.pumpAndSettle();
        await tester.ensureVisible(find.text('Upload'));
        await tester.tap(find.text('Upload'));
        await tester.pumpAndSettle();

        expect(storage.uploaded, isEmpty);
        expect(repo.products.single.imageUrl, isNull);
        expect(find.text('File must be 3 MB or smaller'), findsOneWidget);
      },
    );

    testWidgets('removing an existing image clears it', (tester) async {
      final repo = FakeAdminMenuRepository(
        categories: [_category],
        products: [
          const Product(
            id: 'p1',
            categoryId: 'cat-1',
            name: 'Classic Burger',
            price: 149,
            isAvailable: true,
            displayOrder: 1,
            isDemo: false,
            imageUrl:
                'https://example.supabase.co/storage/v1/object/public/menu-media/products/p1.png',
          ),
        ],
      );
      final storage = FakeAdminStorageRepository();
      await _pump(tester, repo, storage: storage);

      await tester.tap(find.byIcon(Icons.edit_outlined));
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Remove'));
      await tester.tap(find.text('Remove'));
      await tester.pumpAndSettle();

      expect(repo.products.single.imageUrl, isNull);
      expect(storage.deleted, contains('products/p1.png'));
    });
  });
}
