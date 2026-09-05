import 'dart:math';

/// Straight-line/road distance between two coordinates, in kilometers.
/// Kept behind an interface so a real Directions/routing API can replace
/// the implementation later without touching any caller — the database
/// contract only ever receives a distanceKm number regardless of how it
/// was computed (see calculate_delivery_charge()/set_delivery_charge() in
/// supabase/migrations/20260829120002_delivery_pricing_and_snapshot.sql).
abstract class DistanceProvider {
  double distanceKm({
    required double fromLat,
    required double fromLng,
    required double toLat,
    required double toLng,
  });
}

/// MVP implementation — great-circle (haversine) distance. No Maps/
/// Directions API key exists for this project, so this is deliberately the
/// only implementation registered today; it estimates straight-line
/// distance, not actual road distance, which will run a little short of
/// the real route in most cases. Swapping in a real routing provider later
/// is a single DI registration change in main.dart.
class HaversineDistanceProvider implements DistanceProvider {
  static const _earthRadiusKm = 6371.0;

  @override
  double distanceKm({
    required double fromLat,
    required double fromLng,
    required double toLat,
    required double toLng,
  }) {
    final dLat = _radians(toLat - fromLat);
    final dLng = _radians(toLng - fromLng);
    final a =
        sin(dLat / 2) * sin(dLat / 2) +
        cos(_radians(fromLat)) *
            cos(_radians(toLat)) *
            sin(dLng / 2) *
            sin(dLng / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return _earthRadiusKm * c;
  }

  double _radians(double degrees) => degrees * (pi / 180);
}
