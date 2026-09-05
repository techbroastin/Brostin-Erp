import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../services/session_service.dart';
import '../../widgets/empty_state_view.dart';

String _avatarInitial(SessionService session) {
  final name = session.customerName;
  if (name != null && name.isNotEmpty) {
    return name.substring(0, 1).toUpperCase();
  }
  final phone = session.customerPhone;
  if (phone != null && phone.isNotEmpty) {
    return phone.substring(phone.length - 1);
  }
  return '?';
}

class MyProfileScreen extends StatelessWidget {
  const MyProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionService>();

    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: !session.isIdentified
          ? EmptyStateView(
              icon: Icons.person_outline,
              title: 'You have not placed an order yet',
              message:
                  'Your profile appears here once you provide your details at checkout.',
              actionLabel: 'Browse Menu',
              onAction: () => context.go(AppRoutes.menu),
            )
          : Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                Center(
                  child: CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.accentYellow.withValues(
                      alpha: 0.3,
                    ),
                    child: Text(
                      _avatarInitial(session),
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryRed,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Center(
                  child: Text(
                    session.customerName ?? 'Broastin Customer',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                Center(
                  child: Text(
                    session.customerPhone ?? '',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ),
                const SizedBox(height: 28),
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(
                          Icons.location_on_outlined,
                          color: AppColors.primaryRed,
                        ),
                        title: const Text('Saved Addresses'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push(AppRoutes.profileAddresses),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(
                          Icons.receipt_long_outlined,
                          color: AppColors.primaryRed,
                        ),
                        title: const Text('Order History'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push(AppRoutes.myOrders),
                      ),
                    ],
                  ),
                ),
              ],
                ),
              ),
            ),
    );
  }
}
