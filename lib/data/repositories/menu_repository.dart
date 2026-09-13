import '../../models/branch.dart';
import '../../models/menu_category.dart';
import '../../models/product.dart';
import '../../models/product_variant.dart';

/// Port for menu data. The UI and domain layer depend on this abstraction
/// only — never on Supabase or mock data directly. During the UI/UX phase
/// this is backed by [MockMenuRepository]; after backend integration is
/// approved, [SupabaseMenuRepository] is swapped in at the Provider wiring
/// in main.dart with no changes required anywhere else.
abstract class MenuRepository {
  Future<List<Branch>> fetchActiveBranches();
  Future<List<MenuCategory>> fetchCategories({String? branchId});
  Future<List<Product>> fetchProducts({required String categoryId});
  Future<Product> fetchProduct(String productId);

  /// Products flagged `is_featured` (admin-controlled), for the "Popular
  /// Picks" strip — not scoped to a single category.
  Future<List<Product>> fetchFeaturedProducts();

  /// Empty list means the product has no size/meal options and is sold
  /// directly at Product.price.
  Future<List<ProductVariant>> fetchVariants({required String productId});

  /// Matches available products by name (App 1 is single-branch, so this
  /// intentionally is not branch-scoped — consistent with [fetchProduct]).
  /// Empty/whitespace-only [query] returns an empty list rather than the
  /// full catalog.
  Future<List<Product>> searchProducts(String query);
}
