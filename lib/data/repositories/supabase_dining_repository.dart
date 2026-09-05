import '../../services/supabase_service.dart';
import 'dining_repository.dart';

class SupabaseDiningRepository implements DiningRepository {
  final _client = SupabaseService.client;

  /// Calls the resolve_dining_table() SECURITY DEFINER RPC. It returns at
  /// most one row for an exact, active token match and never exposes
  /// qr_token itself — see the RPC definition for why a direct table read
  /// is never used here (RLS on restaurant_tables allows no client policy
  /// at all).
  @override
  Future<ResolvedDiningTable?> resolveTable(String qrToken) async {
    final rows =
        await _client.rpc(
              'resolve_dining_table',
              params: {'p_qr_token': qrToken},
            )
            as List;
    if (rows.isEmpty) return null;
    final row = rows.first as Map<String, dynamic>;
    return ResolvedDiningTable(
      tableId: row['table_id'] as String,
      branchId: row['branch_id'] as String,
      tableNumber: row['table_number'] as String,
    );
  }
}
