class ResolvedDiningTable {
  final String tableId;
  final String branchId;
  final String tableNumber;

  const ResolvedDiningTable({
    required this.tableId,
    required this.branchId,
    required this.tableNumber,
  });
}

/// Resolves a scanned QR token to a branch/table. Backed by the
/// resolve_dining_table() RPC — see
/// supabase/migrations/20260829120001_dining_tables_and_order_type.sql.
/// There is no client-readable table listing tokens; a token that doesn't
/// resolve (invalid, inactive, or unknown) returns null, never an error
/// that would distinguish "wrong token" from "server problem".
abstract class DiningRepository {
  Future<ResolvedDiningTable?> resolveTable(String qrToken);
}
