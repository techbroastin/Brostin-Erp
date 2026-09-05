/// Server-side delivery distance + charge lookup. Backed by the
/// calculate_delivery_charge() RPC — see
/// supabase/migrations/20260905210000_server_authoritative_delivery_distance.sql.
///
/// This is a PREVIEW only, for checkout display before the order is
/// created. It is never what actually sets orders.delivery_distance_km/
/// delivery_charge — the database's own set_delivery_charge() trigger
/// independently recomputes both server-side at insert time from the same
/// branch/address coordinates, so a client can never make either value
/// stick by sending something different.
class DeliveryChargeLookup {
  /// Null when the distance itself could not be computed — missing branch
  /// or address coordinates, or the address does not belong to the caller.
  final double? distanceKm;

  /// Null when [distanceKm] is known but no active pricing rule covers it
  /// (delivery not offered that far).
  final double? charge;

  const DeliveryChargeLookup({this.distanceKm, this.charge});
}

abstract class DeliveryPricingRepository {
  Future<DeliveryChargeLookup> calculateCharge({
    required String branchId,
    required String addressId,
  });
}
