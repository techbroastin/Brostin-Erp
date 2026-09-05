import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../services/cart_service.dart';
import 'price_text.dart';

/// Sticky bottom bar shown whenever the cart is non-empty, so the customer
/// is never more than one tap away from checkout while browsing the menu.
class CartBar extends StatelessWidget {
  final CartService cart;
  final VoidCallback onTap;

  const CartBar({super.key, required this.cart, required this.onTap});

  @override
  Widget build(BuildContext context) {
    if (cart.isEmpty) return const SizedBox.shrink();

    final itemLabel = cart.itemCount == 1 ? 'item' : 'items';

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        child: Material(
          color: AppColors.primaryRed,
          borderRadius: BorderRadius.circular(14),
          elevation: 6,
          shadowColor: AppColors.primaryRed.withValues(alpha: 0.4),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: onTap,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '${cart.itemCount} $itemLabel',
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 12.5,
                              ),
                            ),
                            const SizedBox(width: 8),
                            PriceText(
                              cart.subtotal,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                                fontSize: 12.5,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'View Cart',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            fontSize: 17,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(
                    Icons.arrow_forward_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
