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
        .order('name');
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
    final rows = await query.order('display_order');
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
        .order('display_order');
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
  Future<List<ProductVariant>> fetchVariants({
    required String productId,
  }) async {
    final rows = await _client
        .from('product_variants')
        .select()
        .eq('product_id', productId)
        .eq('is_available', true)
        .order('display_order');
    return (rows as List)
        .map((e) => ProductVariant.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
