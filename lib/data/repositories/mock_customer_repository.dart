import '../../mock/mock_backend.dart';
import '../../models/customer.dart';
import 'customer_repository.dart';

class MockCustomerRepository implements CustomerRepository {
  final MockBackend _backend;

  MockCustomerRepository(this._backend);

  @override
  Future<IdentifyCustomerResult> identifyOrCreate({
    required String phone,
    String? name,
  }) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final result = _backend.identifyOrCreate(phone: phone, name: name);
    return IdentifyCustomerResult(
      customerId: result.customer.id,
      isNewCustomer: result.isNew,
    );
  }

  @override
  Future<Customer?> fetchOwnProfile(String customerId) async {
    await Future.delayed(const Duration(milliseconds: 150));
    return _backend.customerById(customerId);
  }
}
