import '../../models/branch.dart';
import '../../models/menu_category.dart';
import '../../models/product.dart';
import '../../models/product_variant.dart';
import '../../services/supabase_service.dart';
import 'menu_repository.dart';

class SupabaseMenuRepository implements MenuRepository {
  final _client = SupabaseService.client;

  @override
  Future<List<Branch>> fetchActiveBranches() async {
    final rows = await _client
        .from('branches')
        .select()
        .eq('is_active', true)
        .order('name', ascending: true);
    return (rows as List)
        .map((e) => Branch.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<List<MenuCategory>> fetchCategories({String? branchId}) async {
    var query = _client.from('menu_categories').select().eq('is_active', true);
    if (branchId != null) {
      query = query.eq('branch_id', branchId);
    }
    final rows = await query.order('display_order', ascending: true);
    return (rows as List)
        .map((e) => MenuCategory.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<List<Product>> fetchProducts({required String categoryId}) async {
    final rows = await _client
        .from('products')
        .select()
        .eq('category_id', categoryId)
        .eq('is_available', true)
        .order('display_order', ascending: true);
    return (rows as List)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<Product> fetchProduct(String productId) async {
    final row = await _client
        .from('products')
        .select()
        .eq('id', productId)
        .single();
    return Product.fromJson(row);
  }

  @override
  Future<List<Product>> fetchFeaturedProducts() async {
    final rows = await _client
        .from('products')
        .select()
        .eq('is_featured', true)
        .eq('is_available', true)
        .order('display_order', ascending: true);
    return (rows as List)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<List<ProductVariant>> fetchVariants({
    required String productId,
  }) async {
    final rows = await _client
        .from('product_variants')
        .select()
        .eq('product_id', productId)
        .eq('is_available', true)
        .order('display_order', ascending: true);
    return (rows as List)
        .map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<List<Product>> searchProducts(String query) async {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return const [];
    final escaped = _escapeLikeWildcards(trimmed);
    final rows = await _client
        .from('products')
        .select()
        .eq('is_available', true)
        .ilike('name', '%$escaped%')
        .order('name', ascending: true);
    return (rows as List)
        .map((e) => Product.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Escapes `\`, `%`, and `_` so user input can't inject LIKE/ILIKE
  /// wildcards (e.g. searching "50%" or "combo_1" matching everything).
  String _escapeLikeWildcards(String input) => input
      .replaceAll(r'\', r'\\')
      .replaceAll('%', r'\%')
      .replaceAll('_', r'\_');
}
