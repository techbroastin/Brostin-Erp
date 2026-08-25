import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'data/repositories/address_repository.dart';
import 'data/repositories/customer_repository.dart';
import 'data/repositories/menu_repository.dart';
import 'data/repositories/mock_address_repository.dart';
import 'data/repositories/mock_customer_repository.dart';
import 'data/repositories/mock_menu_repository.dart';
import 'data/repositories/mock_order_repository.dart';
import 'data/repositories/order_repository.dart';
import 'domain/address_management_usecase.dart';
import 'domain/customer_identification_usecase.dart';
import 'domain/order_placement_usecase.dart';
import 'mock/mock_backend.dart';
import 'services/address_draft_holder.dart';
import 'services/cart_service.dart';
import 'services/checkout_service.dart';
import 'services/geolocation_service.dart';
import 'services/session_service.dart';

/// UI/UX PHASE — this app currently runs entirely on local mock data.
///
/// Per project sequencing (UI first, backend second), Supabase is NOT
/// initialized here and none of the Mock* repositories below ever call it.
/// The abstract repository interfaces (MenuRepository, CustomerRepository,
/// AddressRepository, OrderRepository) are the seam: swapping the Mock*
/// implementations below for Supabase* implementations — once backend
/// integration is explicitly approved — requires editing only this file.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  usePathUrlStrategy();

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
  final OrderRepository orderRepository = MockOrderRepository(mockBackend);

  runApp(
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
          create: (context) =>
              CustomerIdentificationUseCase(customerRepository, sessionService),
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
