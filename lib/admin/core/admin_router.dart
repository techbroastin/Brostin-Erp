import 'package:go_router/go_router.dart';

import '../presentation/screens/dashboard/admin_dashboard_screen.dart';
import '../presentation/screens/login/admin_login_screen.dart';
import '../presentation/screens/placeholder/admin_placeholder_screen.dart';
import '../presentation/widgets/admin_shell.dart';
import '../services/admin_auth_controller.dart';

class AdminRoutes {
  AdminRoutes._();

  static const login = '/login';
  static const dashboard = '/';
  static const orders = '/orders';
  static const menu = '/menu';
  static const categories = '/menu/categories';
  static const products = '/menu/products';
  static const tables = '/tables';
  static const delivery = '/delivery';
  static const customers = '/customers';
  static const settings = '/settings';
}

GoRouter buildAdminRouter(AdminAuthController auth) {
  return GoRouter(
    initialLocation: AdminRoutes.dashboard,
    refreshListenable: auth,
    redirect: (context, state) {
      final signedIn = auth.isSignedIn;
      final goingToLogin = state.matchedLocation == AdminRoutes.login;
      if (!signedIn && !goingToLogin) return AdminRoutes.login;
      if (signedIn && goingToLogin) return AdminRoutes.dashboard;
      return null;
    },
    routes: [
      GoRoute(
        path: AdminRoutes.login,
        builder: (context, state) => const AdminLoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => AdminShell(
          location: state.matchedLocation,
          child: child,
        ),
        routes: [
          GoRoute(
            path: AdminRoutes.dashboard,
            builder: (context, state) => const AdminDashboardScreen(),
          ),
          GoRoute(
            path: AdminRoutes.orders,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Orders',
              description:
                  'Order list, filtering by dining/takeaway/delivery, and '
                  'status updates land in the next admin phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.menu,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Menu',
              description:
                  'Category and product management lands in the next '
                  'admin phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.categories,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Categories',
              description: 'Category CRUD lands in the next admin phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.products,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Products',
              description:
                  'Product CRUD, variants, images and availability land '
                  'in the next admin phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.tables,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Tables / QR',
              description:
                  'Table and QR token management lands in the next admin '
                  'phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.delivery,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Delivery',
              description:
                  'Delivery pricing rule management lands in the next '
                  'admin phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.customers,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Customers',
              description:
                  'Customer list and order history land in the next '
                  'admin phase.',
            ),
          ),
          GoRoute(
            path: AdminRoutes.settings,
            builder: (context, state) => const AdminPlaceholderScreen(
              title: 'Settings',
              description:
                  'Branch and ordering settings land in the next admin '
                  'phase.',
            ),
          ),
        ],
      ),
    ],
  );
}
