import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/data/repositories/delivery_pricing_repository.dart';
import 'package:broastin_ordering/domain/delivery_pricing_usecase.dart';
import 'package:broastin_ordering/models/customer_address.dart';

const _branchId = 'branch-1';

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

/// Test double for the calculate_delivery_charge(branch_id, address_id) RPC.
/// Both distance and charge are decided entirely server-side in Phase 6B —
/// this fake stands in for whatever Postgres would have computed.
class _FakeDeliveryPricingRepository implements DeliveryPricingRepository {
  final DeliveryChargeLookup lookup;
  final Object? throwError;

  _FakeDeliveryPricingRepository({
    this.lookup = const DeliveryChargeLookup(),
    this.throwError,
  });

  @override
  Future<DeliveryChargeLookup> calculateCharge({
    required String branchId,
    required String addressId,
  }) async {
    if (throwError != null) throw throwError!;
    return lookup;
  }
}

void main() {
  group('DeliveryPricingUseCase', () {
    test('returns charge and distance on a successful priced lookup', () async {
      final useCase = DeliveryPricingUseCase(
        _FakeDeliveryPricingRepository(
          lookup: const DeliveryChargeLookup(distanceKm: 4.2, charge: 45.0),
        ),
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
          _FakeDeliveryPricingRepository(
            lookup: const DeliveryChargeLookup(distanceKm: 4.2, charge: 45.0),
          ),
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
      'throws DeliveryUnavailableException when the server cannot determine a distance '
      '(missing branch coordinates, or address not owned)',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeDeliveryPricingRepository(
            lookup: const DeliveryChargeLookup(distanceKm: null, charge: null),
          ),
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
      'throws DeliveryUnavailableException when no pricing rule covers the '
      'server-computed distance (unpriced)',
      () async {
        final useCase = DeliveryPricingUseCase(
          _FakeDeliveryPricingRepository(
            lookup: const DeliveryChargeLookup(distanceKm: 50.0, charge: null),
          ),
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

    test('propagates a repository error instead of swallowing it', () async {
      final useCase = DeliveryPricingUseCase(
        _FakeDeliveryPricingRepository(
          throwError: Exception('network error'),
        ),
      );

      await expectLater(
        useCase.calculateForAddress(
          branchId: _branchId,
          address: _address(latitude: 10.01, longitude: 76.01),
        ),
        throwsA(isA<Exception>()),
      );
    });
  });
}
