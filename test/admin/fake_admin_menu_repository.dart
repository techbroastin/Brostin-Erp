import 'package:broastin_ordering/data/repositories/admin_menu_repository.dart';
import 'package:broastin_ordering/models/menu_category.dart';
import 'package:broastin_ordering/models/product.dart';
import 'package:broastin_ordering/models/product_variant.dart';

/// In-memory fake standing in for Supabase — same fake-repository-against-
/// an-interface pattern used elsewhere in this test suite (e.g.
/// test/domain/delivery_pricing_usecase_test.dart's
/// _FakeDeliveryPricingRepository).
class FakeAdminMenuRepository implements AdminMenuRepository {
  final List<MenuCategory> categories;
  final List<Product> products;
  final List<ProductVariant> variants;
  int idCounter = 100;

  FakeAdminMenuRepository({
    List<MenuCategory>? categories,
    List<Product>? products,
    List<ProductVariant>? variants,
  }) : categories = categories ?? [],
       products = products ?? [],
       variants = variants ?? [];

  @override
  Future<List<MenuCategory>> fetchAllCategories() async => List.of(categories);

  @override
  Future<MenuCategory> createCategory({
    required String name,
    required int displayOrder,
    bool isActive = true,
  }) async {
    final category = MenuCategory(
      id: 'cat-${idCounter++}',
      name: name,
      displayOrder: displayOrder,
      isActive: isActive,
    );
    categories.add(category);
    return category;
  }

  @override
  Future<MenuCategory> updateCategory({
    required String id,
    required String name,
    required int displayOrder,
    required bool isActive,
  }) async {
    final index = categories.indexWhere((c) => c.id == id);
    final updated = MenuCategory(
      id: id,
      name: name,
      displayOrder: displayOrder,
      isActive: isActive,
    );
    categories[index] = updated;
    return updated;
  }

  @override
  Future<void> deleteCategory(String id) async {
    final childCount = products.where((p) => p.categoryId == id).length;
    if (childCount > 0) throw CategoryHasProductsException(childCount);
    categories.removeWhere((c) => c.id == id);
  }

  @override
  Future<List<Product>> fetchAllProducts({
    String? categoryId,
    String? searchQuery,
  }) async {
    var result = List.of(products);
    if (categoryId != null) {
      result = result.where((p) => p.categoryId == categoryId).toList();
    }
    if (searchQuery != null && searchQuery.trim().isNotEmpty) {
      final q = searchQuery.trim().toLowerCase();
      result = result.where((p) => p.name.toLowerCase().contains(q)).toList();
    }
    return result;
  }

  @override
  Future<Product> createProduct({
    required String categoryId,
    required String name,
    String? description,
    required double price,
    required bool isAvailable,
    required bool isFeatured,
    required int displayOrder,
  }) async {
    final product = Product(
      id: 'prod-${idCounter++}',
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      isAvailable: isAvailable,
      isFeatured: isFeatured,
      displayOrder: displayOrder,
      isDemo: false,
    );
    products.add(product);
    return product;
  }

  @override
  Future<Product> updateProduct({
    required String id,
    required String categoryId,
    required String name,
    String? description,
    required double price,
    required bool isAvailable,
    required bool isFeatured,
    required int displayOrder,
  }) async {
    final index = products.indexWhere((p) => p.id == id);
    final updated = Product(
      id: id,
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      isAvailable: isAvailable,
      isFeatured: isFeatured,
      displayOrder: displayOrder,
      isDemo: false,
    );
    products[index] = updated;
    return updated;
  }

  @override
  Future<void> deleteProduct(String id) async {
    final childCount = variants.where((v) => v.productId == id).length;
    if (childCount > 0) throw ProductHasVariantsException(childCount);
    products.removeWhere((p) => p.id == id);
  }

  @override
  Future<List<ProductVariant>> fetchAllVariants({
    required String productId,
  }) async => variants.where((v) => v.productId == productId).toList();

  @override
  Future<ProductVariant> createVariant({
    required String productId,
    required String name,
    required double price,
    required bool isDefault,
    required bool isAvailable,
    required int displayOrder,
  }) async {
    final variant = ProductVariant(
      id: 'var-${idCounter++}',
      productId: productId,
      name: name,
      price: price,
      isDefault: isDefault,
      isAvailable: isAvailable,
      displayOrder: displayOrder,
    );
    variants.add(variant);
    return variant;
  }

  @override
  Future<ProductVariant> updateVariant({
    required String id,
    required String name,
    required double price,
    required bool isDefault,
    required bool isAvailable,
    required int displayOrder,
  }) async {
    final index = variants.indexWhere((v) => v.id == id);
    final updated = ProductVariant(
      id: id,
      productId: variants[index].productId,
      name: name,
      price: price,
      isDefault: isDefault,
      isAvailable: isAvailable,
      displayOrder: displayOrder,
    );
    variants[index] = updated;
    return updated;
  }

  @override
  Future<void> deleteVariant(String id) async {
    variants.removeWhere((v) => v.id == id);
  }
}
