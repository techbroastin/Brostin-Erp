import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/services/dining_context_service.dart';

void main() {
  group('DiningContextService', () {
    test('has no dining context before a table is resolved', () {
      final service = DiningContextService();

      expect(service.hasDiningContext, isFalse);
      expect(service.tableId, isNull);
      expect(service.branchId, isNull);
      expect(service.tableNumber, isNull);
    });

    test('setResolvedTable stores the QR-resolved context and notifies', () {
      final service = DiningContextService();
      var notified = 0;
      service.addListener(() => notified++);

      service.setResolvedTable(
        tableId: 'table-1',
        branchId: 'branch-1',
        tableNumber: '12',
      );

      expect(service.hasDiningContext, isTrue);
      expect(service.tableId, 'table-1');
      expect(service.branchId, 'branch-1');
      expect(service.tableNumber, '12');
      expect(notified, 1);
    });

    test('clear resets context and notifies', () {
      final service = DiningContextService();
      service.setResolvedTable(
        tableId: 'table-1',
        branchId: 'branch-1',
        tableNumber: '12',
      );
      var notified = 0;
      service.addListener(() => notified++);

      service.clear();

      expect(service.hasDiningContext, isFalse);
      expect(service.tableId, isNull);
      expect(service.branchId, isNull);
      expect(service.tableNumber, isNull);
      expect(notified, 1);
    });
  });
}
