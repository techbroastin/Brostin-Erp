import '../../mock/mock_menu_data.dart';
import '../../models/branch.dart';
import '../../models/menu_category.dart';
import '../../models/product.dart';
import '../../models/product_variant.dart';
import 'menu_repository.dart';

/// UI/UX phase implementation — returns the approved provisional menu from
/// in-memory mock data, with a simulated network delay so loading states
/// are actually exercised. No Supabase dependency whatsoever.
class MockMenuRepository implements MenuRepository {
  static const _simulatedDelay = Duration(milliseconds: 350);

  @override
  Future<List<Branch>> fetchActiveBranches() async {
    await Future.delayed(_simulatedDelay);
    return [MockMenuData.branch];
  }

  @override
  Future<List<MenuCategory>> fetchCategories({String? branchId}) async {
    await Future.delayed(_simulatedDelay);
    return MockMenuData.categories;
  }

  @override
  Future<List<Product>> fetchProducts({required String categoryId}) async {
    await Future.delayed(_simulatedDelay);
    return MockMenuData.productsForCategory(categoryId);
  }

  @override
  Future<Product> fetchProduct(String productId) async {
    await Future.delayed(_simulatedDelay);
    return MockMenuData.productById(productId);
  }

  @override
  Future<List<ProductVariant>> fetchVariants({
    required String productId,
  }) async {
    await Future.delayed(_simulatedDelay);
    return MockMenuData.variantsForProduct(productId);
  }

  @override
  Future<List<Product>> searchProducts(String query) async {
    await Future.delayed(_simulatedDelay);
    final trimmed = query.trim().toLowerCase();
    if (trimmed.isEmpty) return const [];
    final categoryNamesById = {
      for (final c in MockMenuData.categories) c.id: c.name.toLowerCase(),
    };
    return MockMenuData.products
        .where(
          (p) =>
              p.isAvailable &&
              (p.name.toLowerCase().contains(trimmed) ||
                  (categoryNamesById[p.categoryId] ?? '').contains(trimmed)),
        )
        .toList();
  }
}
