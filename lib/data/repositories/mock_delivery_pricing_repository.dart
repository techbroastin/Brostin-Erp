import 'delivery_pricing_repository.dart';

/// Mock mode has no real delivery_pricing_rules table — this is a simple,
/// clearly-labeled placeholder tiering for offline UI preview only, never
/// treated as real business logic (see CheckoutService.flatDeliveryCharge's
/// removal note in the changelog for why the old flat ₹30 was retired).
class MockDeliveryPricingRepository implements DeliveryPricingRepository {
  @override
  Future<double?> calculateCharge({
    required String branchId,
    required double distanceKm,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (distanceKm <= 5) return 30.0;
    if (distanceKm <= 10) return 50.0;
    return null; // out of mock delivery range
  }
}
