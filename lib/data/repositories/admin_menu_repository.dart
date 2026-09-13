import '../../models/menu_category.dart';
import '../../models/product.dart';
import '../../models/product_variant.dart';

/// Thrown when deleting a category would silently cascade-delete its
/// products. The caller must delete/move the products first.
class CategoryHasProductsException implements Exception {
  final int productCount;
  const CategoryHasProductsException(this.productCount);
}

/// Thrown when deleting a product would silently cascade-delete its
/// variants. The caller must delete the variants first.
class ProductHasVariantsException implements Exception {
  final int variantCount;
  const ProductHasVariantsException(this.variantCount);
}

/// Thrown when a product/variant can't be deleted because one or more
/// orders already reference it (Postgres FK violation, code 23503) — the
/// database itself is the source of truth for this one, not an app-level
/// pre-check.
class HasOrderHistoryException implements Exception {
  const HasOrderHistoryException();
}

/// Owner-admin port for menu writes. Every implementation must rely on the
/// database's own is_app_admin()-gated RLS policies for authorization —
/// never a service-role key or a client-side admin check.
abstract class AdminMenuRepository {
  /// All categories regardless of is_active (admin needs to see and
  /// re-enable disabled ones too).
  Future<List<MenuCategory>> fetchAllCategories();

  Future<MenuCategory> createCategory({
    required String name,
    required int displayOrder,
    bool isActive = true,
  });

  Future<MenuCategory> updateCategory({
    required String id,
    required String name,
    required int displayOrder,
    required bool isActive,
  });

  /// Throws [CategoryHasProductsException] if the category still has
  /// products.
  Future<void> deleteCategory(String id);

  /// All products regardless of is_available, optionally filtered.
  Future<List<Product>> fetchAllProducts({
    String? categoryId,
    String? searchQuery,
  });

  Future<Product> createProduct({
    required String categoryId,
    required String name,
    String? description,
    required double price,
    required bool isAvailable,
    required bool isFeatured,
    required int displayOrder,
    String? imageUrl,
  });

  Future<Product> updateProduct({
    required String id,
    required String categoryId,
    required String name,
    String? description,
    required double price,
    required bool isAvailable,
    required bool isFeatured,
    required int displayOrder,
    required String? imageUrl,
  });

  /// Throws [ProductHasVariantsException] if the product still has variants,
  /// or [HasOrderHistoryException] if an order already references it.
  Future<void> deleteProduct(String id);

  Future<List<ProductVariant>> fetchAllVariants({required String productId});

  Future<ProductVariant> createVariant({
    required String productId,
    required String name,
    required double price,
    required bool isDefault,
    required bool isAvailable,
    required int displayOrder,
  });

  Future<ProductVariant> updateVariant({
    required String id,
    required String name,
    required double price,
    required bool isDefault,
    required bool isAvailable,
    required int displayOrder,
  });

  /// Throws [HasOrderHistoryException] if an order already references it.
  Future<void> deleteVariant(String id);
}
