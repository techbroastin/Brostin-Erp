import 'package:broastin_ordering/data/repositories/admin_branding_repository.dart';
import 'package:broastin_ordering/models/restaurant.dart';

class FakeAdminBrandingRepository implements AdminBrandingRepository {
  Restaurant restaurant;
  FakeAdminBrandingRepository(this.restaurant);

  @override
  Future<Restaurant> fetchRestaurant() async => restaurant;

  @override
  Future<Restaurant> updateLogoUrl(String? logoUrl) async {
    restaurant = Restaurant(
      id: restaurant.id,
      name: restaurant.name,
      tagline: restaurant.tagline,
      logoUrl: logoUrl,
    );
    return restaurant;
  }
}
