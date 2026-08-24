import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/product.dart';
import 'price_text.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final bool hasVariants;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.hasVariants = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: SizedBox(
          height: 140,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _ProductImage(imageUrl: product.imageUrl, name: product.name),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        product.name,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      if (product.description != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          product.description!,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12.5),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          if (hasVariants)
                            Text(
                              'from ',
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                            ),
                          PriceText(
                            product.price,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryRedDark,
                            ),
                          ),
                          const Spacer(),
                          const Icon(Icons.add_circle, color: AppColors.primaryRed, size: 26),
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
    );
  }
}

class _ProductImage extends StatelessWidget {
  final String? imageUrl;
  final String name;

  const _ProductImage({required this.imageUrl, required this.name});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 96,
      child: imageUrl == null
          ? ColoredBox(
              color: AppColors.accentYellow.withValues(alpha: 0.18),
              child: const Center(
                child: Icon(Icons.restaurant, color: AppColors.primaryRed, size: 32),
              ),
            )
          : Image.network(imageUrl!, fit: BoxFit.cover),
    );
  }
}
