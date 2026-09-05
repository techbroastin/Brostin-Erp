import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../models/product.dart';
import '../../services/cart_service.dart';
import 'food_image.dart';
import 'price_text.dart';
import 'product_badge.dart';
import 'quantity_stepper.dart';

/// Zomato-style dark product card — image, badge ribbon, rating, name,
/// price and an Add/stepper control. Lives only on the dark Menu screen
/// (catalog + search results), matching the reference poster's card style.
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final bool hasVariants;
  final String? categoryName;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.hasVariants = false,
    this.categoryName,
  });

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartService>();
    // No-variant products can be added/adjusted right from the list — a
    // variant product's price depends on the choice made in Product Detail,
    // so it always routes there instead of pretending it has one price.
    var cartQuantity = 0;
    if (!hasVariants) {
      for (final line in cart.lines) {
        if (line.cartKey == product.id) {
          cartQuantity = line.quantity;
          break;
        }
      }
    }

    final merch = ProductMerchandising.forId(product.id);

    return Material(
      color: AppColors.charcoalCard,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.charcoalBorder),
          ),
          child: SizedBox(
            height: 152,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  width: 116,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      FoodImageBox(
                        imageUrl: product.imageUrl,
                        categoryName: categoryName,
                        productName: product.name,
                        iconSize: 34,
                        borderRadius: const BorderRadius.horizontal(
                          left: Radius.circular(14),
                        ),
                      ),
                      if (merch.badgeLabel != null)
                        Positioned(
                          top: 6,
                          left: 6,
                          child: BadgeChip(
                            label: merch.badgeLabel!,
                            color: merch.badgeColor,
                          ),
                        ),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          product.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        RatingPill(
                          rating: merch.rating,
                          reviewCountLabel: merch.reviewCountLabel,
                        ),
                        if (product.description != null) ...[
                          const SizedBox(height: 3),
                          Text(
                            product.description!,
                            style: const TextStyle(
                              color: Colors.white60,
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  if (hasVariants)
                                    const Text(
                                      'from ',
                                      style: TextStyle(
                                        color: Colors.white60,
                                        fontSize: 12,
                                      ),
                                    ),
                                  PriceText(
                                    product.price,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      color: AppColors.accentYellow,
                                      fontSize: 15.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (hasVariants || cartQuantity == 0)
                              _AddButton(
                                label: hasVariants ? 'Select' : 'Add',
                                onTap: hasVariants
                                    ? onTap
                                    : () => cart.addProduct(product),
                              )
                            else
                              QuantityStepper(
                                quantity: cartQuantity,
                                min: 0,
                                onChanged: (q) {
                                  if (q <= 0) {
                                    cart.removeProduct(product.id);
                                  } else if (q > cartQuantity) {
                                    cart.incrementQuantity(product.id);
                                  } else {
                                    cart.decrementQuantity(product.id);
                                  }
                                },
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AddButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _AddButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.accentYellow,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: Text(
            label,
            style: const TextStyle(
              color: AppColors.charcoal,
              fontWeight: FontWeight.w800,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}
