import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:broastin_ordering/app.dart';
import 'package:broastin_ordering/core/constants/app_constants.dart';
import 'package:broastin_ordering/data/repositories/address_repository.dart';
import 'package:broastin_ordering/data/repositories/customer_repository.dart';
import 'package:broastin_ordering/data/repositories/menu_repository.dart';
import 'package:broastin_ordering/data/repositories/mock_address_repository.dart';
import 'package:broastin_ordering/data/repositories/mock_customer_repository.dart';
import 'package:broastin_ordering/data/repositories/mock_menu_repository.dart';
import 'package:broastin_ordering/data/repositories/mock_order_repository.dart';
import 'package:broastin_ordering/data/repositories/order_repository.dart';
import 'package:broastin_ordering/domain/address_management_usecase.dart';
import 'package:broastin_ordering/domain/customer_identification_usecase.dart';
import 'package:broastin_ordering/domain/order_placement_usecase.dart';
import 'package:broastin_ordering/mock/mock_backend.dart';
import 'package:broastin_ordering/services/address_draft_holder.dart';
import 'package:broastin_ordering/services/cart_service.dart';
import 'package:broastin_ordering/services/checkout_service.dart';
import 'package:broastin_ordering/services/geolocation_service.dart';
import 'package:broastin_ordering/services/session_service.dart';

void main() {
  testWidgets('landing screen renders the Broastin brand and Order Now CTA', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const BroastinApp());
    await tester.pumpAndSettle();

    expect(find.text(AppConstants.appName), findsOneWidget);
    expect(find.text(AppConstants.appTagline), findsOneWidget);
    expect(find.text('Order Now'), findsOneWidget);
  });

  group('responsive layout — no overflow at required widths', () {
    // Required QA widths per 02_REQUIREMENTS.md — this customer app is
    // strictly mobile-only (QR-code entry, Android primary/iPhone
    // supported); tablet/desktop is explicitly not an acceptance
    // criterion, so only phone widths are covered here. Verified via
    // widget tests rather than manual browser resize because this
    // sandbox's Chrome window is fixed-size and does not respond to
    // resize_window (see final QA report). Menu and Product
    // Details/Cart/Address were also checked manually in a live browser
    // at the one width the sandbox does offer.
    const widths = <double>[320, 360, 375, 390, 412, 430, 480];

    Future<void> pumpAppAt(WidgetTester tester, double width) async {
      tester.view.physicalSize = Size(width, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      SharedPreferences.setMockInitialValues({});
      final sessionService = SessionService();
      await sessionService.restore();
      final mockBackend = MockBackend();
      final MenuRepository menuRepository = MockMenuRepository();
      final CustomerRepository customerRepository = MockCustomerRepository(
        mockBackend,
      );
      final AddressRepository addressRepository = MockAddressRepository(
        mockBackend,
      );
      final OrderRepository orderRepository = MockOrderRepository(
        mockBackend,
      );

      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => CartService()),
            ChangeNotifierProvider(create: (_) => CheckoutService()),
            Provider<SessionService>.value(value: sessionService),
            Provider<AddressDraftHolder>(create: (_) => AddressDraftHolder()),
            Provider<MenuRepository>.value(value: menuRepository),
            Provider<CustomerRepository>.value(value: customerRepository),
            Provider<AddressRepository>.value(value: addressRepository),
            Provider<OrderRepository>.value(value: orderRepository),
            Provider<GeolocationService>(create: (_) => GeolocationService()),
            Provider<CustomerIdentificationUseCase>(
              create: (context) => CustomerIdentificationUseCase(
                customerRepository,
                sessionService,
              ),
            ),
            Provider<AddressManagementUseCase>(
              create: (context) => AddressManagementUseCase(
                addressRepository,
                context.read<GeolocationService>(),
              ),
            ),
            Provider<OrderPlacementUseCase>(
              create: (context) => OrderPlacementUseCase(orderRepository),
            ),
          ],
          child: const BroastinApp(),
        ),
      );
    }

    for (final width in widths) {
      testWidgets('Landing — no overflow at ${width}px', (tester) async {
        await pumpAppAt(tester, width);
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      });
    }
  });
}
