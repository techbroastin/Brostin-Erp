import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

import 'package:broastin_ordering/admin/presentation/screens/menu/admin_categories_screen.dart';
import 'package:broastin_ordering/data/repositories/admin_menu_repository.dart';
import 'package:broastin_ordering/models/menu_category.dart';
import 'package:broastin_ordering/models/product.dart';

import 'fake_admin_menu_repository.dart';

Future<void> _pump(WidgetTester tester, FakeAdminMenuRepository repo) async {
  await tester.pumpWidget(
    Provider<AdminMenuRepository>.value(
      value: repo,
      child: const MaterialApp(home: Scaffold(body: AdminCategoriesScreen())),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  group('AdminCategoriesScreen', () {
    testWidgets('shows the empty state with no categories', (tester) async {
      await _pump(tester, FakeAdminMenuRepository());
      expect(find.text('No categories found.'), findsOneWidget);
    });

    testWidgets('lists existing categories with product counts', (
      tester,
    ) async {
      final repo = FakeAdminMenuRepository(
        categories: [
          const MenuCategory(
            id: 'cat-1',
            name: 'Burgers',
            displayOrder: 1,
            isActive: true,
          ),
        ],
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

      expect(find.text('Burgers'), findsOneWidget);
      expect(find.textContaining('1 product'), findsOneWidget);
    });

    testWidgets('creating a category calls the repository and refreshes list', (
      tester,
    ) async {
      final repo = FakeAdminMenuRepository();
      await _pump(tester, repo);

      await tester.tap(find.text('Add Category'));
      await tester.pumpAndSettle();
      await tester.enterText(find.widgetWithText(TextFormField, 'Name'), 'Wraps');
      await tester.enterText(
        find.widgetWithText(TextFormField, 'Display order'),
        '2',
      );
      await tester.tap(find.text('Save'));
      await tester.pumpAndSettle();

      expect(repo.categories, hasLength(1));
      expect(repo.categories.single.name, 'Wraps');
      expect(find.text('Wraps'), findsOneWidget);
    });

    testWidgets('deleting a category with products shows the blocked dialog', (
      tester,
    ) async {
      final repo = FakeAdminMenuRepository(
        categories: [
          const MenuCategory(
            id: 'cat-1',
            name: 'Burgers',
            displayOrder: 1,
            isActive: true,
          ),
        ],
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

      await tester.tap(find.byIcon(Icons.delete_outline));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Delete'));
      await tester.pumpAndSettle();

      expect(find.text('Can\'t delete'), findsOneWidget);
      expect(repo.categories, hasLength(1));
    });
  });
}
