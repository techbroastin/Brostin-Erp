import 'package:go_router/go_router.dart';

import '../../presentation/screens/address/address_screen.dart';
import '../../presentation/screens/address/edit_address_screen.dart';
import '../../presentation/screens/cart/cart_screen.dart';
import '../../presentation/screens/customer_identification/customer_identification_screen.dart';
import '../../presentation/screens/landing/landing_screen.dart';
import '../../presentation/screens/menu/menu_screen.dart';
import '../../presentation/screens/my_orders/my_orders_screen.dart';
import '../../presentation/screens/my_profile/my_profile_screen.dart';
import '../../presentation/screens/order_confirmation/order_confirmation_screen.dart';
import '../../presentation/screens/order_review/order_review_screen.dart';
import '../../presentation/screens/order_status/order_status_screen.dart';
import '../../presentation/screens/order_type/order_type_screen.dart';
import '../../presentation/screens/product_details/product_details_screen.dart';

class AppRoutes {
  AppRoutes._();

  static const landing = '/';
  static const menu = '/menu';
  static String productDetails(String productId) => '/product/$productId';
  static const cart = '/cart';
  static const checkoutPhone = '/checkout/phone';
  static const checkoutOrderType = '/checkout/order-type';
  static const checkoutAddress = '/checkout/address';
  static const checkoutAddressNew = '/checkout/address/new';
  static const checkoutReview = '/checkout/review';
  static String orderConfirmation(String orderId) =>
      '/order/$orderId/confirmation';
  static String orderStatus(String orderId) => '/order/$orderId/status';
  static const myOrders = '/orders';
  static const profile = '/profile';
  static const profileAddresses = '/profile/addresses';
  static const profileAddressNew = '/profile/addresses/new';
}

final appRouter = GoRouter(
  initialLocation: AppRoutes.landing,
  routes: [
    GoRoute(
      path: AppRoutes.landing,
      builder: (context, state) => const LandingScreen(),
    ),
    GoRoute(
      path: AppRoutes.menu,
      builder: (context, state) => const MenuScreen(),
    ),
    GoRoute(
      path: '/product/:productId',
      builder: (context, state) =>
          ProductDetailsScreen(productId: state.pathParameters['productId']!),
    ),
    GoRoute(
      path: AppRoutes.cart,
      builder: (context, state) => const CartScreen(),
    ),
    GoRoute(
      path: AppRoutes.checkoutPhone,
      builder: (context, state) => const CustomerIdentificationScreen(),
    ),
    GoRoute(
      path: AppRoutes.checkoutOrderType,
      builder: (context, state) => const OrderTypeScreen(),
    ),
    GoRoute(
      path: AppRoutes.checkoutAddress,
      builder: (context, state) =>
          const AddressScreen(mode: AddressScreenMode.checkoutSelect),
    ),
    GoRoute(
      path: AppRoutes.checkoutAddressNew,
      builder: (context, state) => const EditAddressScreen(),
    ),
    GoRoute(
      path: AppRoutes.checkoutReview,
      builder: (context, state) => const OrderReviewScreen(),
    ),
    GoRoute(
      path: '/order/:orderId/confirmation',
      builder: (context, state) =>
          OrderConfirmationScreen(orderId: state.pathParameters['orderId']!),
    ),
    GoRoute(
      path: '/order/:orderId/status',
      builder: (context, state) =>
          OrderStatusScreen(orderId: state.pathParameters['orderId']!),
    ),
    GoRoute(
      path: AppRoutes.myOrders,
      builder: (context, state) => const MyOrdersScreen(),
    ),
    GoRoute(
      path: AppRoutes.profile,
      builder: (context, state) => const MyProfileScreen(),
    ),
    GoRoute(
      path: AppRoutes.profileAddresses,
      builder: (context, state) =>
          const AddressScreen(mode: AddressScreenMode.manage),
    ),
    GoRoute(
      path: AppRoutes.profileAddressNew,
      builder: (context, state) => const EditAddressScreen(),
    ),
  ],
);
