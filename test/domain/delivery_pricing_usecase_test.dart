import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/data/repositories/delivery_pricing_repository.dart';
import 'package:broastin_ordering/data/repositories/menu_repository.dart';
import 'package:broastin_ordering/domain/delivery_pricing_usecase.dart';
import 'package:broastin_ordering/models/branch.dart';
import 'package:broastin_ordering/models/customer_address.dart';
import 'package:broastin_ordering/models/menu_category.dart';
import 'package:broastin_ordering/models/product.dart';
import 'package:broastin_ordering/models/product_variant.dart';
import 'package:broastin_ordering/services/distance_provider.dart';

const _branchId = 'branch-1';

Branch _branch({double? latitude, double? longitude}) => Branch(
  id: _branchId,
  restaurantId: 'restaurant-1',
  name: 'Test Branch',
  latitude: latitude,
  longitude: longitude,
  isActive: true,
);

CustomerAddress _address({double? latitude, double? longitude}) =>
    CustomerAddress(
      id: 'addr-1',
      customerId: 'cust-1',
      label: 'Home',
      houseBuilding: '12',
      pincode: '682001',
      latitude: latitude,
      longitude: longitude,
      isDefault: true,
    );

/// Test double for MenuRepository — only fetchActiveBranches is exercised by
/// DeliveryPricingUseCase; every other member throws if hit, so a test that
/// accidentally depends on unrelated menu data fails loudly instead of
/// silently returning made-up data.
class _FakeMenuRepository implements MenuRepository {
  final List<Branch> branches;
  _FakeMenuRepository(this.branches);

  @override
  Future<List<Branch>> fetchActiveBranches() async => branches;

  @override
  Future<List<MenuCategory>> fetchCategories({String? branchId}) =>
      throw UnimplementedError();

  @override
  Future<Product> fetchProduct(String productId) =>
      throw UnimplementedError();

  @override
  Future<List<Product>> fetchProducts({required String categoryId}) =>
      throw UnimplementedError();

  @override
  Future<List<ProductVariant>> fetchVariants({required String productId}) =>
      throw UnimplementedError();

  @override
  Future<List<Product>> searchProducts(String query) =>
      throw UnimplementedError();
}

/// Test double standing in for the calculate_delivery_charge() RPC. Returns
/// a fixed charge, null (out of range), or throws, depending on the test.
class _FakeDeliveryPricingRepository implements DeliveryPricingRepository {
  final double? fixedCharge;
  final Object? throwError;

  _FakeDeliveryPricingRepository({this.fixedCharge, this.throwError});

  @override
  Future<double?> calculateCharge({
    required String branchId,
    required double distanceKm,
  }) async {
    if (throwError != null) throw throwError!;
    return fixedCharge;
  }
}

class _FixedDistanceProvider implements DistanceProvider {
  final double fixedDistanceKm;
  _FixedDistanceProvider(this.fixedDistanceKm);

  @override
  double distanceKm({
    required double fromLat,
    required double fromLng,
    required double toLat,
    required double toLng,
  }) => fixedDistanceKm;
}

void main() {
  group('DeliveryPricingUseCase', () {
    test('returns charge and distance on a successful priced lookup', () async {
      final useCase = DeliveryPricingUseCase(
        _FakeMenuRepository([_branch(latitude: 10.0, longitude: 76.0)]),
        _FakeDeliveryPricingRepository(fixedCharge: 45.0),
        _FixedDistanceProvider(4.2),
      );

      final result = await useCase.calculateForAddress(
        branchId: _branchId,
        address: _address(latitude: 10.01, longitude: 76.01),
      );

      expect(result.distanceKm, 4.2);
      expect(result.charge, 45.0);
    });

    test(
      'throws DeliveryUnavailableException when the address has no saved coordinates',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeMenuRepository([_branch(latitude: 10.0, longitude: 76.0)]),
          _FakeDeliveryPricingRepository(fixedCharge: 45.0),
          _FixedDistanceProvider(4.2),
        );

        await expectLater(
          useCase.calculateForAddress(
            branchId: _branchId,
            address: _address(),
          ),
          throwsA(isA<DeliveryUnavailableException>()),
        );
      },
    );

    test(
      'throws DeliveryUnavailableException when the branch is unknown',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeMenuRepository(const []),
          _FakeDeliveryPricingRepository(fixedCharge: 45.0),
          _FixedDistanceProvider(4.2),
        );

        await expectLater(
          useCase.calculateForAddress(
            branchId: _branchId,
            address: _address(latitude: 10.01, longitude: 76.01),
          ),
          throwsA(isA<DeliveryUnavailableException>()),
        );
      },
    );

    test(
      'throws DeliveryUnavailableException when the branch has no coordinates',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeMenuRepository([_branch()]),
          _FakeDeliveryPricingRepository(fixedCharge: 45.0),
          _FixedDistanceProvider(4.2),
        );

        await expectLater(
          useCase.calculateForAddress(
            branchId: _branchId,
            address: _address(latitude: 10.01, longitude: 76.01),
          ),
          throwsA(isA<DeliveryUnavailableException>()),
        );
      },
    );

    test(
      'throws DeliveryUnavailableException when no pricing rule covers the distance (unpriced)',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeMenuRepository([_branch(latitude: 10.0, longitude: 76.0)]),
          _FakeDeliveryPricingRepository(fixedCharge: null),
          _FixedDistanceProvider(50.0),
        );

        await expectLater(
          useCase.calculateForAddress(
            branchId: _branchId,
            address: _address(latitude: 10.4, longitude: 76.4),
          ),
          throwsA(isA<DeliveryUnavailableException>()),
        );
      },
    );

    test(
      'propagates a repository error instead of swallowing it',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeMenuRepository([_branch(latitude: 10.0, longitude: 76.0)]),
          _FakeDeliveryPricingRepository(
            throwError: Exception('network error'),
          ),
          _FixedDistanceProvider(4.2),
        );

        await expectLater(
          useCase.calculateForAddress(
            branchId: _branchId,
            address: _address(latitude: 10.01, longitude: 76.01),
          ),
          throwsA(isA<Exception>()),
        );
      },
    );
  });
}
