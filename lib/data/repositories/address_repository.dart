import '../../models/customer_address.dart';

abstract class AddressRepository {
  Future<List<CustomerAddress>> fetchAddresses(String customerId);
  Future<CustomerAddress> addAddress(CustomerAddress address);
  Future<CustomerAddress> updateAddress(CustomerAddress address);
  Future<void> deleteAddress(String addressId);
}
