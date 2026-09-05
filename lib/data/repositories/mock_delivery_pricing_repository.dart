import 'delivery_pricing_repository.dart';

/// Mock mode has no real delivery_pricing_rules table and no server-side
/// haversine — this derives a deterministic placeholder distance from the
/// address id (not a real coordinate calculation) purely so the offline UI
/// preview has something to display. Clearly labeled, never treated as real
/// business logic (see CheckoutService.flatDeliveryCharge's removal note in
/// the changelog for why the old flat ₹30 was retired).
class MockDeliveryPricingRepository implements DeliveryPricingRepository {
  @override
  Future<DeliveryChargeLookup> calculateCharge({
    required String branchId,
    required String addressId,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final distanceKm = (addressId.hashCode.abs() % 120) / 10.0;
    final charge = distanceKm <= 5
        ? 30.0
        : distanceKm <= 10
        ? 50.0
        : null; // out of mock delivery range
    return DeliveryChargeLookup(distanceKm: distanceKm, charge: charge);
  }
}
