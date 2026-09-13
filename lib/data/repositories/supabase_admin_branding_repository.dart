import '../../models/restaurant.dart';
import '../../services/supabase_service.dart';
import 'admin_branding_repository.dart';

class SupabaseAdminBrandingRepository implements AdminBrandingRepository {
  final _client = SupabaseService.client;

  @override
  Future<Restaurant> fetchRestaurant() async {
    final row = await _client.from('restaurants').select().single();
    return Restaurant.fromJson(row);
  }

  @override
  Future<Restaurant> updateLogoUrl(String? logoUrl) async {
    final current = await fetchRestaurant();
    final row = await _client
        .from('restaurants')
        .update({'logo_url': logoUrl})
        .eq('id', current.id)
        .select()
        .single();
    return Restaurant.fromJson(row);
  }
}
