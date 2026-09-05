import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../services/cart_service.dart';
import '../../../services/session_service.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/price_text.dart';
import '../../widgets/quantity_stepper.dart';

/// Screen 4 — Cart. No coupons/loyalty per MVP scope — only a disabled
/// discount placeholder row, as specified.
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartService>();

    return Scaffold(
      appBar: AppBar(title: const Text('Your Cart')),
      body: cart.isEmpty
          ? EmptyStateView(
              icon: Icons.shopping_cart_outlined,
              title: 'Your cart is empty',
              message: 'Add something delicious from the menu to get started.',
              actionLabel: 'Browse Menu',
              onAction: () => context.go(AppRoutes.menu),
            )
          : Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: cart.lines.length,
                    separatorBuilder: (_, _) => const Divider(height: 24),
                    itemBuilder: (context, index) {
                      final line = cart.lines[index];
                      return Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  line.variant == null
                                      ? line.product.name
                                      : '${line.product.name} (${line.variant!.name})',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                PriceText(
                                  line.unitPrice,
                                  style: const TextStyle(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          QuantityStepper(
                            quantity: line.quantity,
                            onChanged: (q) {
                              if (q > line.quantity) {
                                cart.incrementQuantity(line.cartKey);
                              } else {
                                cart.decrementQuantity(line.cartKey);
                              }
                            },
                          ),
                          const SizedBox(width: 12),
                          SizedBox(
                            width: 64,
                            child: PriceText(
                              line.lineTotal,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                              textAlign: TextAlign.right,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ),
                const Divider(height: 1),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _SummaryRow(label: 'Subtotal', value: cart.subtotal),
                      const _SummaryRow(
                        label: 'Delivery charge',
                        valueLabel: 'Calculated at checkout',
                      ),
                      const _SummaryRow(label: 'Discount', valueLabel: '—'),
                      const Divider(height: 20),
                      _SummaryRow(
                        label: 'Total',
                        value: cart.subtotal,
                        emphasize: true,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => context.go(AppRoutes.menu),
                              child: const Text('Continue Shopping'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () {
                                final session = context.read<SessionService>();
                                if (session.isIdentified) {
                                  context.push(AppRoutes.checkoutOrderType);
                                } else {
                                  context.push(AppRoutes.checkoutPhone);
                                }
                              },
                              child: const Text('Checkout'),
                            ),
                          ),
                        ],
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

class _SummaryRow extends StatelessWidget {
  final String label;
  final double? value;
  final String? valueLabel;
  final bool emphasize;

  const _SummaryRow({
    required this.label,
    this.value,
    this.valueLabel,
    this.emphasize = false,
  });

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(
      fontWeight: emphasize ? FontWeight.w800 : FontWeight.w400,
      fontSize: emphasize ? 17 : 14,
      color: emphasize ? AppColors.textPrimary : AppColors.textSecondary,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(label, style: style),
          const Spacer(),
          if (value != null)
            PriceText(value!, style: style)
          else
            Text(valueLabel ?? '', style: style),
        ],
      ),
    );
  }
}
