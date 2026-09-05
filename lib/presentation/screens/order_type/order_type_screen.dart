import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../services/checkout_service.dart';
import '../../../services/dining_context_service.dart';

/// Screen 6 — Order Type. Dining only appears when the customer scanned a
/// valid table QR this session (see DiningContextService) — there is no
/// way to reach the dining flow through this UI otherwise.
class OrderTypeScreen extends StatelessWidget {
  const OrderTypeScreen({super.key});

  void _chooseDining(BuildContext context) {
    final dining = context.read<DiningContextService>();
    if (!dining.hasDiningContext) return;
    context.read<CheckoutService>().chooseDining(
      branchId: dining.branchId!,
      tableId: dining.tableId!,
    );
    context.push(AppRoutes.checkoutReview);
  }

  void _chooseTakeaway(BuildContext context) {
    context.read<CheckoutService>().chooseTakeaway();
    context.push(AppRoutes.checkoutReview);
  }

  void _chooseDelivery(BuildContext context) {
    context.read<CheckoutService>().chooseDelivery();
    context.push(AppRoutes.checkoutAddress);
  }

  @override
  Widget build(BuildContext context) {
    final dining = context.watch<DiningContextService>();
    return Scaffold(
      appBar: AppBar(title: const Text('Order Type')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                if (dining.hasDiningContext) ...[
                  _OrderTypeCard(
                    icon: Icons.restaurant_outlined,
                    color: AppColors.primaryRed,
                    title: 'Dining',
                    subtitle: 'Table ${dining.tableNumber} — order to your table',
                    onTap: () => _chooseDining(context),
                  ),
                  const SizedBox(height: 16),
                ],
                _OrderTypeCard(
                  icon: Icons.storefront_outlined,
                  color: AppColors.primaryRedDark,
                  title: 'Takeaway',
                  subtitle: 'Pick up your order from the restaurant',
                  onTap: () => _chooseTakeaway(context),
                ),
                const SizedBox(height: 16),
                _OrderTypeCard(
                  icon: Icons.delivery_dining_outlined,
                  color: AppColors.charcoal,
                  title: 'Delivery',
                  subtitle: 'Get it delivered to your address',
                  onTap: () => _chooseDelivery(context),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderTypeCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _OrderTypeCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.16),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
