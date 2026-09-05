import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'package:broastin_ordering/data/repositories/dining_repository.dart';
import 'package:broastin_ordering/presentation/screens/qr_entry/qr_entry_screen.dart';
import 'package:broastin_ordering/services/dining_context_service.dart';

/// Test double for DiningRepository. [resolved] simulates a valid QR token,
/// null simulates an invalid/inactive one, and [error] simulates a lookup
/// that failed outright (network/server error) rather than just resolving
/// to nothing.
class _FakeDiningRepository implements DiningRepository {
  final ResolvedDiningTable? resolved;
  final Object? error;
  _FakeDiningRepository({this.resolved, this.error});

  @override
  Future<ResolvedDiningTable?> resolveTable(String qrToken) async {
    if (error != null) throw error!;
    return resolved;
  }
}

/// Pumps QrEntryScreen behind its own isolated GoRouter (never the app's
/// global singleton router) so navigation triggered by the screen cannot
/// leak state into other tests.
Future<void> _pumpQrEntry(
  WidgetTester tester, {
  required DiningRepository diningRepository,
  required DiningContextService diningContext,
  String token = 'TEST-QR-TOKEN-0001',
}) async {
  final router = GoRouter(
    initialLocation: '/qr/$token',
    routes: [
      GoRoute(
        path: '/qr/:token',
        builder: (context, state) =>
            QrEntryScreen(token: state.pathParameters['token']!),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) =>
            const Scaffold(body: Center(child: Text('LANDING'))),
      ),
    ],
  );

  await tester.pumpWidget(
    MultiProvider(
      providers: [
        Provider<DiningRepository>.value(value: diningRepository),
        ChangeNotifierProvider<DiningContextService>.value(
          value: diningContext,
        ),
      ],
      child: MaterialApp.router(routerConfig: router),
    ),
  );
}

void main() {
  group('QrEntryScreen', () {
    testWidgets('shows a loading state while the token is resolving', (
      tester,
    ) async {
      await _pumpQrEntry(
        tester,
        diningRepository: _FakeDiningRepository(resolved: null),
        diningContext: DiningContextService(),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets(
      'a valid token stores the resolved table and continues to landing',
      (tester) async {
        final diningContext = DiningContextService();
        await _pumpQrEntry(
          tester,
          diningRepository: _FakeDiningRepository(
            resolved: const ResolvedDiningTable(
              tableId: 'table-1',
              branchId: 'branch-1',
              tableNumber: '7',
            ),
          ),
          diningContext: diningContext,
        );
        await tester.pumpAndSettle();

        expect(find.text('LANDING'), findsOneWidget);
        expect(diningContext.hasDiningContext, isTrue);
        expect(diningContext.tableId, 'table-1');
        expect(diningContext.branchId, 'branch-1');
        expect(diningContext.tableNumber, '7');
      },
    );

    testWidgets(
      'an invalid/inactive token shows the invalid-QR view without blocking ordering',
      (tester) async {
        final diningContext = DiningContextService();
        await _pumpQrEntry(
          tester,
          diningRepository: _FakeDiningRepository(resolved: null),
          diningContext: diningContext,
        );
        await tester.pumpAndSettle();

        expect(
          find.text('This table QR code is invalid or no longer active'),
          findsOneWidget,
        );
        expect(find.text('Continue to Menu'), findsOneWidget);
        expect(diningContext.hasDiningContext, isFalse);
      },
    );

    testWidgets(
      'a lookup error is treated the same as an invalid token, not a crash',
      (tester) async {
        final diningContext = DiningContextService();
        await _pumpQrEntry(
          tester,
          diningRepository: _FakeDiningRepository(
            error: Exception('server unreachable'),
          ),
          diningContext: diningContext,
        );
        await tester.pumpAndSettle();

        expect(
          find.text('This table QR code is invalid or no longer active'),
          findsOneWidget,
        );
        expect(tester.takeException(), isNull);
      },
    );

    testWidgets(
      '"Continue to Menu" clears any stale dining context and goes to landing',
      (tester) async {
        final diningContext = DiningContextService()
          ..setResolvedTable(
            tableId: 'stale-table',
            branchId: 'stale-branch',
            tableNumber: '3',
          );
        await _pumpQrEntry(
          tester,
          diningRepository: _FakeDiningRepository(resolved: null),
          diningContext: diningContext,
        );
        await tester.pumpAndSettle();

        await tester.tap(find.text('Continue to Menu'));
        await tester.pumpAndSettle();

        expect(find.text('LANDING'), findsOneWidget);
        expect(diningContext.hasDiningContext, isFalse);
      },
    );
  });
}
