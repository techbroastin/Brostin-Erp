import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'data/repositories/address_repository.dart';
import 'data/repositories/customer_repository.dart';
import 'data/repositories/delivery_pricing_repository.dart';
import 'data/repositories/dining_repository.dart';
import 'data/repositories/menu_repository.dart';
import 'data/repositories/mock_address_repository.dart';
import 'data/repositories/mock_customer_repository.dart';
import 'data/repositories/mock_delivery_pricing_repository.dart';
import 'data/repositories/mock_dining_repository.dart';
import 'data/repositories/mock_menu_repository.dart';
import 'data/repositories/mock_order_repository.dart';
import 'data/repositories/order_repository.dart';
import 'data/repositories/supabase_address_repository.dart';
import 'data/repositories/supabase_customer_repository.dart';
import 'data/repositories/supabase_delivery_pricing_repository.dart';
import 'data/repositories/supabase_dining_repository.dart';
import 'data/repositories/supabase_menu_repository.dart';
import 'data/repositories/supabase_order_repository.dart';
import 'domain/address_management_usecase.dart';
import 'domain/customer_identification_usecase.dart';
import 'domain/delivery_pricing_usecase.dart';
import 'domain/order_placement_usecase.dart';
import 'mock/mock_backend.dart';
import 'services/address_draft_holder.dart';
import 'services/cart_service.dart';
import 'services/checkout_service.dart';
import 'services/dining_context_service.dart';
import 'services/distance_provider.dart';
import 'services/geolocation_service.dart';
import 'services/session_service.dart';
import 'services/supabase_service.dart';

/// BACKEND-CONNECTED — every repository now backs onto Supabase when
/// SUPABASE_URL/SUPABASE_ANON_KEY are supplied via --dart-define (see
/// SupabaseService.isConfigured). Without them — e.g. `flutter test`, or a
/// plain `flutter run`/`flutter build web` with no dart-defines — every
/// repository falls back to its Mock* implementation and the app behaves
/// exactly as it did in the UI/UX-only phase. A Supabase init/session
/// failure is non-fatal: it's logged, `supabaseReady` stays false, and
/// every repository falls back to Mock — nothing crashes.
///
/// The abstract repository interfaces (MenuRepository, CustomerRepository,
/// AddressRepository, OrderRepository, DiningRepository,
/// DeliveryPricingRepository) remain the seam — no screen, widget, or
/// domain file needs to change when the Mock/Supabase choice flips here.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  usePathUrlStrategy();

  var supabaseReady = false;
  if (SupabaseService.isConfigured) {
    try {
      await SupabaseService.initialize();
      final hadSession = SupabaseService.client.auth.currentSession != null;
      await SupabaseService.ensureAnonymousSession();
      final session = SupabaseService.client.auth.currentSession;
      debugPrint(
        'Supabase session: '
        '${hadSession ? "restored existing" : "signed in anonymously"} '
        'userId=${session?.user.id} isAnonymous=${session?.user.isAnonymous}',
      );
      supabaseReady = true;
    } catch (e) {
      debugPrint('Supabase anonymous session setup failed: $e');
    }
  }

  final sessionService = SessionService();
  await sessionService.restore();

  final mockBackend = MockBackend();
  final MenuRepository menuRepository = supabaseReady
      ? SupabaseMenuRepository()
      : MockMenuRepository();
  final CustomerRepository customerRepository = supabaseReady
      ? SupabaseCustomerRepository()
      : MockCustomerRepository(mockBackend);
  final AddressRepository addressRepository = supabaseReady
      ? SupabaseAddressRepository()
      : MockAddressRepository(mockBackend);
  final OrderRepository orderRepository = supabaseReady
      ? SupabaseOrderRepository()
      : MockOrderRepository(mockBackend);
  final DiningRepository diningRepository = supabaseReady
      ? SupabaseDiningRepository()
      : MockDiningRepository();
  final DeliveryPricingRepository deliveryPricingRepository = supabaseReady
      ? SupabaseDeliveryPricingRepository()
      : MockDeliveryPricingRepository();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartService()),
        ChangeNotifierProvider(create: (_) => CheckoutService()),
        ChangeNotifierProvider(create: (_) => DiningContextService()),
        Provider<SessionService>.value(value: sessionService),
        Provider<AddressDraftHolder>(create: (_) => AddressDraftHolder()),
        Provider<MenuRepository>.value(value: menuRepository),
        Provider<CustomerRepository>.value(value: customerRepository),
        Provider<AddressRepository>.value(value: addressRepository),
        Provider<OrderRepository>.value(value: orderRepository),
        Provider<DiningRepository>.value(value: diningRepository),
        Provider<DeliveryPricingRepository>.value(
          value: deliveryPricingRepository,
        ),
        Provider<GeolocationService>(create: (_) => GeolocationService()),
        Provider<DistanceProvider>(create: (_) => HaversineDistanceProvider()),
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
        Provider<DeliveryPricingUseCase>(
          create: (context) => DeliveryPricingUseCase(
            menuRepository,
            deliveryPricingRepository,
            context.read<DistanceProvider>(),
          ),
        ),
      ],
      child: const BroastinApp(),
    ),
  );
}
