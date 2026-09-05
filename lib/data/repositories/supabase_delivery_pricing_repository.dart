import '../../services/supabase_service.dart';
import 'delivery_pricing_repository.dart';

class SupabaseDeliveryPricingRepository implements DeliveryPricingRepository {
  final _client = SupabaseService.client;

  @override
  Future<double?> calculateCharge({
    required String branchId,
    required double distanceKm,
  }) async {
    final result = await _client.rpc(
      'calculate_delivery_charge',
      params: {'p_branch_id': branchId, 'p_distance_km': distanceKm},
    );
    if (result == null) return null;
    if (result is num) return result.toDouble();
    return double.parse(result.toString());
  }
}
