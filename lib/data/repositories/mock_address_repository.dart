import '../../mock/mock_backend.dart';
import '../../models/customer_address.dart';
import 'address_repository.dart';

class MockAddressRepository implements AddressRepository {
  final MockBackend _backend;

  MockAddressRepository(this._backend);

  @override
  Future<List<CustomerAddress>> fetchAddresses(String customerId) async {
    await Future.delayed(const Duration(milliseconds: 250));
    return _backend.addressesForCustomer(customerId);
  }

  @override
  Future<CustomerAddress> addAddress(CustomerAddress address) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _backend.addAddress(address);
  }

  @override
  Future<CustomerAddress> updateAddress(CustomerAddress address) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _backend.updateAddress(address);
  }

  @override
  Future<void> deleteAddress(String addressId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _backend.deleteAddress(addressId);
  }
}
