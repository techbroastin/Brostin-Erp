import '../../models/restaurant.dart';

/// Owner-admin port for the single restaurant's branding fields. Never
/// inserts or deletes a restaurant row — App 1 operates exactly one, per
/// project rules.
abstract class AdminBrandingRepository {
  Future<Restaurant> fetchRestaurant();

  /// Pass null to clear the logo (fall back to the canonical asset).
  Future<Restaurant> updateLogoUrl(String? logoUrl);
}
