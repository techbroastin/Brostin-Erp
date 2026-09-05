/// Server-side delivery charge lookup. Backed by the
/// calculate_delivery_charge() RPC — see
/// supabase/migrations/20260829120002_delivery_pricing_and_snapshot.sql.
///
/// This is a PREVIEW only, for checkout display before the order is
/// created. It is never what actually sets orders.delivery_charge — the
/// database's own set_delivery_charge() trigger re-derives that
/// server-side at insert time from the same delivery_pricing_rules table,
/// so a client can never make the charge stick by sending a different
/// value.
abstract class DeliveryPricingRepository {
  /// Returns null if no active pricing rule covers this distance for this
  /// branch (i.e. delivery is not available that far).
  Future<double?> calculateCharge({
    required String branchId,
    required double distanceKm,
  });
}
