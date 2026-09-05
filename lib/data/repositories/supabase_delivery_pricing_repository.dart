import '../../services/supabase_service.dart';
import 'delivery_pricing_repository.dart';

class SupabaseDeliveryPricingRepository implements DeliveryPricingRepository {
  final _client = SupabaseService.client;

  @override
  Future<DeliveryChargeLookup> calculateCharge({
    required String branchId,
    required String addressId,
  }) async {
    final result = await _client.rpc(
      'calculate_delivery_charge',
      params: {'p_branch_id': branchId, 'p_address_id': addressId},
    );

    if (result is! List || result.isEmpty) {
      return const DeliveryChargeLookup();
    }

    final row = result.first as Map<String, dynamic>;
    return DeliveryChargeLookup(
      distanceKm: (row['distance_km'] as num?)?.toDouble(),
      charge: (row['charge'] as num?)?.toDouble(),
    );
  }
}
