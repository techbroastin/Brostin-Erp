import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/order_repository.dart';
import '../../../models/order.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/loading_view.dart';
import '../../widgets/price_text.dart';

/// Post-order screen. Estimated prep time is a static placeholder — not
/// promised as exact per the spec ("Do not promise an exact delivery time
/// unless configured").
class OrderConfirmationScreen extends StatelessWidget {
  final String orderId;

  const OrderConfirmationScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<Order>(
          future: context.read<OrderRepository>().fetchOrder(orderId),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            if (snapshot.hasError) {
              return ErrorStateView(title: 'Could not load your order', message: '${snapshot.error}');
            }
            final order = snapshot.data!;
            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      const SizedBox(height: 16),
                      Container(
                        width: 84,
                        height: 84,
                        decoration: const BoxDecoration(color: AppColors.success, shape: BoxShape.circle),
                        child: const Icon(Icons.check, color: Colors.white, size: 44),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'ORDER CONFIRMED',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge
                            ?.copyWith(fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        order.orderNumber,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primaryRedDark,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              _Row('Order Type', order.orderType == OrderType.delivery ? 'Delivery' : 'Takeaway'),
                              _Row('Estimated Preparation', '20–30 minutes'),
                              _Row('Payment Method', order.paymentMethod == PaymentMethod.upi ? 'UPI' : 'Cash'),
                              _Row('Status', 'Placed'),
                              const Divider(),
                              Row(
                                children: [
                                  const Text('Order Total', style: TextStyle(fontWeight: FontWeight.w700)),
                                  const Spacer(),
                                  PriceText(order.grandTotal, style: const TextStyle(fontWeight: FontWeight.w800)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => context.go(AppRoutes.orderStatus(order.id)),
                        child: const Text('View Order'),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => context.go(AppRoutes.menu),
                        child: const Text('Back to Menu'),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;

  const _Row(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
