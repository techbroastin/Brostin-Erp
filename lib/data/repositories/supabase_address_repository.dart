import '../../models/customer_address.dart';
import '../../services/supabase_service.dart';
import 'address_repository.dart';

class SupabaseAddressRepository implements AddressRepository {
  final _client = SupabaseService.client;

  @override
  Future<List<CustomerAddress>> fetchAddresses(String customerId) async {
    final rows = await _client
        .from('customer_addresses')
        .select()
        .eq('customer_id', customerId)
        .order('is_default', ascending: false);
    return (rows as List)
        .map((e) => CustomerAddress.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<CustomerAddress> addAddress(CustomerAddress address) async {
    final row = await _client
        .from('customer_addresses')
        .insert(address.toInsertJson(customerId: address.customerId))
        .select()
        .single();
    return CustomerAddress.fromJson(row);
  }

  @override
  Future<CustomerAddress> updateAddress(CustomerAddress address) async {
    final row = await _client
        .from('customer_addresses')
        .update(address.toInsertJson(customerId: address.customerId))
        .eq('id', address.id)
        .select()
        .single();
    return CustomerAddress.fromJson(row);
  }

  @override
  Future<void> deleteAddress(String addressId) async {
    await _client.from('customer_addresses').delete().eq('id', addressId);
  }
}
