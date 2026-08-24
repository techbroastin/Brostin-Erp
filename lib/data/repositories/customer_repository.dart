import '../../models/customer.dart';

class IdentifyCustomerResult {
  final String customerId;
  final bool isNewCustomer;

  const IdentifyCustomerResult({required this.customerId, required this.isNewCustomer});
}

/// Port for customer identity. Backed by [MockCustomerRepository] during the
/// UI/UX phase; [SupabaseCustomerRepository] calls the identify_or_create_customer
/// RPC once backend integration is approved — see docs/08_AUTHENTICATION.md.
abstract class CustomerRepository {
  Future<IdentifyCustomerResult> identifyOrCreate({required String phone, String? name});

  Future<Customer?> fetchOwnProfile(String customerId);
}
