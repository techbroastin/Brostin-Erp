import '../data/repositories/delivery_pricing_repository.dart';
import '../models/customer_address.dart';

class DeliveryUnavailableException implements Exception {
  final String message;
  const DeliveryUnavailableException([
    this.message = 'Delivery is not available to this address.',
  ]);
}

class DeliveryPricingResult {
  final double distanceKm;
  final double charge;

  const DeliveryPricingResult({required this.distanceKm, required this.charge});
}

/// Orchestrates the client-visible half of delivery pricing: ask the
/// database for the distance AND the charge via calculate_delivery_charge()
/// — both are server-computed from branch/address coordinates. This result
/// is a PREVIEW for the checkout screen — the database's own
/// set_delivery_charge() trigger independently re-derives the real distance
/// and charge at order-creation time from the same branch_id/address_id, so
/// nothing computed here is ever trusted as final, and preview/final can
/// never disagree.
class DeliveryPricingUseCase {
  final DeliveryPricingRepository _pricingRepository;

  DeliveryPricingUseCase(this._pricingRepository);

  Future<DeliveryPricingResult> calculateForAddress({
    required String branchId,
    required CustomerAddress address,
  }) async {
    if (address.latitude == null || address.longitude == null) {
      throw const DeliveryUnavailableException(
        'This address has no location saved. Please add it again using '
        '"Use Current Location".',
      );
    }

    final lookup = await _pricingRepository.calculateCharge(
      branchId: branchId,
      addressId: address.id,
    );

    if (lookup.distanceKm == null) {
      throw const DeliveryUnavailableException(
        'This branch does not support delivery right now.',
      );
    }

    if (lookup.charge == null) {
      throw DeliveryUnavailableException(
        'Sorry, we do not deliver to this address '
        '(${lookup.distanceKm!.toStringAsFixed(1)} km away).',
      );
    }

    return DeliveryPricingResult(
      distanceKm: lookup.distanceKm!,
      charge: lookup.charge!,
    );
  }
}
