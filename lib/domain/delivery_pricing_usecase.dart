import '../data/repositories/delivery_pricing_repository.dart';
import '../data/repositories/menu_repository.dart';
import '../models/branch.dart';
import '../models/customer_address.dart';
import '../services/distance_provider.dart';

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

/// Orchestrates the client-visible half of delivery pricing: look up the
/// branch's coordinates, compute a distance estimate (see
/// [DistanceProvider]), then ask the database for the actual charge via
/// calculate_delivery_charge(). This result is a PREVIEW for the checkout
/// screen — the database's own set_delivery_charge() trigger independently
/// re-derives the real charge at order-creation time, so nothing computed
/// here is ever trusted as final.
class DeliveryPricingUseCase {
  final MenuRepository _menuRepository;
  final DeliveryPricingRepository _pricingRepository;
  final DistanceProvider _distanceProvider;

  DeliveryPricingUseCase(
    this._menuRepository,
    this._pricingRepository,
    this._distanceProvider,
  );

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

    final branches = await _menuRepository.fetchActiveBranches();
    Branch? branch;
    for (final b in branches) {
      if (b.id == branchId) {
        branch = b;
        break;
      }
    }
    if (branch == null ||
        branch.latitude == null ||
        branch.longitude == null) {
      throw const DeliveryUnavailableException(
        'This branch does not support delivery right now.',
      );
    }

    final distanceKm = _distanceProvider.distanceKm(
      fromLat: branch.latitude!,
      fromLng: branch.longitude!,
      toLat: address.latitude!,
      toLng: address.longitude!,
    );

    final charge = await _pricingRepository.calculateCharge(
      branchId: branchId,
      distanceKm: distanceKm,
    );
    if (charge == null) {
      throw DeliveryUnavailableException(
        'Sorry, we do not deliver to this address '
        '(${distanceKm.toStringAsFixed(1)} km away).',
      );
    }

    return DeliveryPricingResult(distanceKm: distanceKm, charge: charge);
  }
}
