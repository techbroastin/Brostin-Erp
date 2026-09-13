import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../core/admin_router.dart';
import '../../services/admin_auth_controller.dart';

class _NavItem {
  const _NavItem(this.label, this.icon, this.path);
  final String label;
  final IconData icon;
  final String path;
}

const _navItems = [
  _NavItem('Dashboard', Icons.dashboard_outlined, AdminRoutes.dashboard),
  _NavItem('Orders', Icons.receipt_long_outlined, AdminRoutes.orders),
  _NavItem('Menu', Icons.restaurant_menu_outlined, AdminRoutes.menu),
  _NavItem('Categories', Icons.category_outlined, AdminRoutes.categories),
  _NavItem('Products', Icons.fastfood_outlined, AdminRoutes.products),
  _NavItem('Tables / QR', Icons.qr_code_outlined, AdminRoutes.tables),
  _NavItem('Delivery', Icons.delivery_dining_outlined, AdminRoutes.delivery),
  _NavItem('Customers', Icons.people_outline, AdminRoutes.customers),
  _NavItem('Settings', Icons.settings_outlined, AdminRoutes.settings),
];

/// Sidebar + content shell wrapping every authenticated admin route.
/// Desktop-first per rule 3 — no attempt to collapse to a mobile layout.
class AdminShell extends StatelessWidget {
  const AdminShell({super.key, required this.child, required this.location});

  final Widget child;
  final String location;

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AdminAuthController>();
    return Scaffold(
      body: Row(
        children: [
          Container(
            width: 240,
            color: AppColors.charcoal,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    AppConstants.appName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Owner Admin',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ),
                const SizedBox(height: 24),
                Expanded(
                  child: ListView(
                    children: [
                      for (final item in _navItems)
                        _SidebarTile(
                          item: item,
                          selected: location == item.path,
                        ),
                    ],
                  ),
                ),
                const Divider(color: Colors.white24, height: 1),
                ListTile(
                  leading: const Icon(Icons.logout, color: Colors.white70),
                  title: Text(
                    auth.ownerEmail ?? 'Sign out',
                    style: const TextStyle(color: Colors.white70),
                    overflow: TextOverflow.ellipsis,
                  ),
                  onTap: () => context.read<AdminAuthController>().signOut(),
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _SidebarTile extends StatelessWidget {
  const _SidebarTile({required this.item, required this.selected});

  final _NavItem item;
  final bool selected;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.primaryRed.withValues(alpha: 0.18) : null,
      child: ListTile(
        leading: Icon(
          item.icon,
          color: selected ? AppColors.accentYellow : Colors.white70,
        ),
        title: Text(
          item.label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.white70,
            fontWeight: selected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
        onTap: () => context.go(item.path),
      ),
    );
  }
}
