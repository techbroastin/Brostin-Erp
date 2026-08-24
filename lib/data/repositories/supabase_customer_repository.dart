import '../../models/customer.dart';
import '../../services/supabase_service.dart';
import 'customer_repository.dart';

class SupabaseCustomerRepository implements CustomerRepository {
  final _client = SupabaseService.client;

  /// Finds an existing customer by phone or creates a new one, via the
  /// `identify_or_create_customer` SECURITY DEFINER RPC. This never exposes
  /// another customer's saved addresses or order history to the caller —
  /// see docs/07_SECURITY_RLS.md for why.
  @override
  Future<IdentifyCustomerResult> identifyOrCreate({
    required String phone,
    String? name,
  }) async {
    final rows = await _client.rpc(
      'identify_or_create_customer',
      params: {'p_phone': phone, if (name != null) 'p_name': name},
    );
    final row = (rows as List).first as Map<String, dynamic>;
    return IdentifyCustomerResult(
      customerId: row['customer_id'] as String,
      isNewCustomer: row['is_new_customer'] as bool,
    );
  }

  /// Only returns a row if RLS allows it — i.e. this browser's session is the
  /// one that owns this customer record (see auth_user_id linkage).
  @override
  Future<Customer?> fetchOwnProfile(String customerId) async {
    final row = await _client
        .from('customers')
        .select()
        .eq('id', customerId)
        .maybeSingle();
    return row == null ? null : Customer.fromJson(row);
  }
}
