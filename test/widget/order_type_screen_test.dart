import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:broastin_ordering/models/order.dart';
import 'package:broastin_ordering/presentation/screens/order_type/order_type_screen.dart';
import 'package:broastin_ordering/services/checkout_service.dart';
import 'package:broastin_ordering/services/dining_context_service.dart';

/// Pumps OrderTypeScreen behind its own isolated GoRouter (never the app's
/// global singleton router) with placeholder destinations for the review
/// and address screens, since only the navigation choice matters here.
Future<void> _pumpOrderType(
  WidgetTester tester, {
  required DiningContextService diningContext,
  required CheckoutService checkoutService,
}) async {
  final router = GoRouter(
    initialLocation: '/checkout/order-type',
    routes: [
      GoRoute(
        path: '/checkout/order-type',
        builder: (context, state) => const OrderTypeScreen(),
      ),
      GoRoute(
        path: '/checkout/review',
        builder: (context, state) =>
            const Scaffold(body: Center(child: Text('REVIEW'))),
      ),
      GoRoute(
        path: '/checkout/address',
        builder: (context, state) =>
            const Scaffold(body: Center(child: Text('ADDRESS'))),
      ),
    ],
  );

  await tester.pumpWidget(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<DiningContextService>.value(
          value: diningContext,
        ),
        ChangeNotifierProvider<CheckoutService>.value(value: checkoutService),
      ],
      child: MaterialApp.router(routerConfig: router),
    ),
  );
}

void main() {
  group('OrderTypeScreen dining gating', () {
    testWidgets(
      'Dining is hidden with no QR-resolved table context (no way to reach dining)',
      (tester) async {
        await _pumpOrderType(
          tester,
          diningContext: DiningContextService(),
          checkoutService: CheckoutService(),
        );

        expect(find.text('Dining'), findsNothing);
        expect(find.text('Takeaway'), findsOneWidget);
        expect(find.text('Delivery'), findsOneWidget);
      },
    );

    testWidgets(
      'Dining is shown once a valid QR table context is resolved',
      (tester) async {
        final diningContext = DiningContextService()
          ..setResolvedTable(
            tableId: 'table-1',
            branchId: 'branch-1',
            tableNumber: '9',
          );

        await _pumpOrderType(
          tester,
          diningContext: diningContext,
          checkoutService: CheckoutService(),
        );

        expect(find.text('Dining'), findsOneWidget);
        expect(find.textContaining('Table 9'), findsOneWidget);
      },
    );

    testWidgets(
      'choosing Dining sets checkout state from the QR context and proceeds to review',
      (tester) async {
        final diningContext = DiningContextService()
          ..setResolvedTable(
            tableId: 'table-1',
            branchId: 'branch-1',
            tableNumber: '9',
          );
        final checkoutService = CheckoutService();

        await _pumpOrderType(
          tester,
          diningContext: diningContext,
          checkoutService: checkoutService,
        );

        await tester.tap(find.text('Dining'));
        await tester.pumpAndSettle();

        expect(checkoutService.orderType, OrderType.dining);
        expect(checkoutService.branchId, 'branch-1');
        expect(checkoutService.tableId, 'table-1');
        expect(find.text('REVIEW'), findsOneWidget);
      },
    );

    testWidgets('choosing Takeaway proceeds to review with no table', (
      tester,
    ) async {
      final checkoutService = CheckoutService();
      await _pumpOrderType(
        tester,
        diningContext: DiningContextService(),
        checkoutService: checkoutService,
      );

      await tester.tap(find.text('Takeaway'));
      await tester.pumpAndSettle();

      expect(checkoutService.orderType, OrderType.takeaway);
      expect(checkoutService.tableId, isNull);
      expect(find.text('REVIEW'), findsOneWidget);
    });

    testWidgets('choosing Delivery proceeds to the address screen', (
      tester,
    ) async {
      final checkoutService = CheckoutService();
      await _pumpOrderType(
        tester,
        diningContext: DiningContextService(),
        checkoutService: checkoutService,
      );

      await tester.tap(find.text('Delivery'));
      await tester.pumpAndSettle();

      expect(checkoutService.orderType, OrderType.delivery);
      expect(find.text('ADDRESS'), findsOneWidget);
    });
  });
}
