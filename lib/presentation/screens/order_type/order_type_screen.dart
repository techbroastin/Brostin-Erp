import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../models/order.dart';
import '../../../services/checkout_service.dart';

/// Screen 6 — Order Type. Dine-in is intentionally not offered in App 1 —
/// order_source stays extensible for future table/QR ordering, but the UI
/// only surfaces the two types in scope now.
class OrderTypeScreen extends StatelessWidget {
  const OrderTypeScreen({super.key});

  void _choose(BuildContext context, OrderType type) {
    context.read<CheckoutService>().setOrderType(type);
    if (type == OrderType.delivery) {
      context.push(AppRoutes.checkoutAddress);
    } else {
      context.push(AppRoutes.checkoutReview);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('How would you like your order?')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _OrderTypeCard(
                  icon: Icons.storefront_outlined,
                  title: 'Takeaway',
                  subtitle: 'Pick up your order from the restaurant',
                  onTap: () => _choose(context, OrderType.takeaway),
                ),
                const SizedBox(height: 16),
                _OrderTypeCard(
                  icon: Icons.delivery_dining_outlined,
                  title: 'Delivery',
                  subtitle: 'Get it delivered to your address',
                  onTap: () => _choose(context, OrderType.delivery),
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
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _OrderTypeCard({
    required this.icon,
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
                  color: AppColors.accentYellow.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: AppColors.primaryRed, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text(subtitle, style: const TextStyle(color: AppColors.textSecondary)),
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
