import 'package:supabase_flutter/supabase_flutter.dart';

import '../../models/menu_category.dart';
import '../../models/product.dart';
import '../../models/product_variant.dart';
import '../../services/supabase_service.dart';
import 'admin_menu_repository.dart';

/// Owner-admin menu writes. Authorization is enforced entirely by the
/// database's is_app_admin()-gated RLS policies (see
/// supabase/migrations/20260914090000_admin_menu_management.sql) — this
/// class never checks admin status itself and never uses a service-role key.
class SupabaseAdminMenuRepository implements AdminMenuRepository {
  final _client = SupabaseService.client;

  static const _fkViolation = '23503';

  @override
  Future<List<MenuCategory>> fetchAllCategories() async {
    final rows = await _client
        .from('menu_categories')
        .select()
        .order('display_order', ascending: true);
    return (rows as List)
        .map((e) => MenuCategory.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<MenuCategory> createCategory({
    required String name,
    required int displayOrder,
    bool isActive = true,
  }) async {
    final row = await _client
        .from('menu_categories')
        .insert({
          'name': name,
          'display_order': displayOrder,
          'is_active': isActive,
        })
        .select()
        .single();
    return MenuCategory.fromJson(row);
  }

  @override
  Future<MenuCategory> updateCategory({
    required String id,
    required String name,
    required int displayOrder,
    required bool isActive,
  }) async {
    final row = await _client
        .from('menu_categories')
        .update({
          'name': name,
          'display_order': displayOrder,
          'is_active': isActive,
        })
        .eq('id', id)
        .select()
        .single();
    return MenuCategory.fromJson(row);
  }

  @override
  Future<void> deleteCategory(String id) async {
    final response = await _client
        .from('products')
        .select('id')
        .eq('category_id', id)
        .count(CountOption.exact);
    if (response.count > 0) {
      throw CategoryHasProductsException(response.count);
    }
    await _client.from('menu_categories').delete().eq('id', id);
  }

  @override
  Future<List<Product>> fetchAllProducts({
    String? categoryId,
    String? searchQuery,
  }) async {
    var query = _client.from('products').select();
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    final trimmed = searchQuery?.trim();
    if (trimmed != null && trimmed.isNotEmpty) {
      query = query.ilike('name', '%${_escapeLikeWildcards(trimmed)}%');
    }
    final rows = await query.order('display_order', ascending: true);
    return (rows as List)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
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
    final row = await _client
        .from('products')
        .insert({
          'category_id': categoryId,
          'name': name,
          'description': description,
          'price': price,
          'is_available': isAvailable,
          'is_featured': isFeatured,
          'display_order': displayOrder,
        })
        .select()
        .single();
    return Product.fromJson(row);
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
    final row = await _client
        .from('products')
        .update({
          'category_id': categoryId,
          'name': name,
          'description': description,
          'price': price,
          'is_available': isAvailable,
          'is_featured': isFeatured,
          'display_order': displayOrder,
        })
        .eq('id', id)
        .select()
        .single();
    return Product.fromJson(row);
  }

  @override
  Future<void> deleteProduct(String id) async {
    final response = await _client
        .from('product_variants')
        .select('id')
        .eq('product_id', id)
        .count(CountOption.exact);
    if (response.count > 0) {
      throw ProductHasVariantsException(response.count);
    }
    try {
      await _client.from('products').delete().eq('id', id);
    } on PostgrestException catch (e) {
      if (e.code == _fkViolation) throw const HasOrderHistoryException();
      rethrow;
    }
  }

  @override
  Future<List<ProductVariant>> fetchAllVariants({
    required String productId,
  }) async {
    final rows = await _client
        .from('product_variants')
        .select()
        .eq('product_id', productId)
        .order('display_order', ascending: true);
    return (rows as List)
        .map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<ProductVariant> createVariant({
    required String productId,
    required String name,
    required double price,
    required bool isDefault,
    required bool isAvailable,
    required int displayOrder,
  }) async {
    final row = await _client
        .from('product_variants')
        .insert({
          'product_id': productId,
          'name': name,
          'price': price,
          'is_default': isDefault,
          'is_available': isAvailable,
          'display_order': displayOrder,
        })
        .select()
        .single();
    return ProductVariant.fromJson(row);
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
    final row = await _client
        .from('product_variants')
        .update({
          'name': name,
          'price': price,
          'is_default': isDefault,
          'is_available': isAvailable,
          'display_order': displayOrder,
        })
        .eq('id', id)
        .select()
        .single();
    return ProductVariant.fromJson(row);
  }

  @override
  Future<void> deleteVariant(String id) async {
    try {
      await _client.from('product_variants').delete().eq('id', id);
    } on PostgrestException catch (e) {
      if (e.code == _fkViolation) throw const HasOrderHistoryException();
      rethrow;
    }
  }

  /// Escapes `\`, `%`, and `_` so user input can't inject LIKE/ILIKE
  /// wildcards (matches SupabaseMenuRepository's helper of the same name).
  String _escapeLikeWildcards(String input) => input
      .replaceAll(r'\', r'\\')
      .replaceAll('%', r'\%')
      .replaceAll('_', r'\_');
}
