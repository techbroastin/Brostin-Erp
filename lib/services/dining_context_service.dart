import 'package:flutter/foundation.dart';

/// Holds the branch/table resolved from a scanned QR code for the current
/// browser session (in-memory only — not persisted across a reload; a
/// customer who reloads mid-visit needs to rescan, which is an accepted
/// limitation, not a bug). Dining is only ever offered in OrderTypeScreen
/// when [hasDiningContext] is true, so a customer who did not scan a valid
/// table QR cannot reach the dining flow through the UI at all.
class DiningContextService extends ChangeNotifier {
  String? tableId;
  String? branchId;
  String? tableNumber;

  bool get hasDiningContext => tableId != null && branchId != null;

  void setResolvedTable({
    required String tableId,
    required String branchId,
    required String tableNumber,
  }) {
    this.tableId = tableId;
    this.branchId = branchId;
    this.tableNumber = tableNumber;
    notifyListeners();
  }

  void clear() {
    tableId = null;
    branchId = null;
    tableNumber = null;
    notifyListeners();
  }
}
