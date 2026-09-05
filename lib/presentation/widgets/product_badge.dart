import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Deterministic, presentation-only "badge" (Bestseller, Chef's Special…)
/// and star rating shown on a product card — mirrors the reference menu
/// poster's Zomato-style merchandising. Neither field exists in the
/// `products` table; both are derived from the product id so they stay
/// stable across rebuilds without needing backend/schema changes.
class ProductMerchandising {
  final String? badgeLabel;
  final Color badgeColor;
  final double rating;
  final String reviewCountLabel;

  const ProductMerchandising({
    required this.badgeLabel,
    required this.badgeColor,
    required this.rating,
    required this.reviewCountLabel,
  });

  static const _badges = [
    (label: 'Bestseller', color: AppColors.primaryRed),
    (label: "Chef's Special", color: AppColors.primaryRed),
    (label: 'Most Loved', color: AppColors.primaryRedDark),
    (label: 'Double Crunch', color: Color(0xFFB8860B)),
    (label: 'Kids Favourite', color: Color(0xFF1565C0)),
  ];

  factory ProductMerchandising.forId(String id) {
    final hash = id.codeUnits.fold<int>(0, (a, b) => a + b);

    // Only ~2 in 5 products carry a badge, like the reference — every card
    // wearing one would flatten the signal.
    final badge = hash % 5 < 2 ? _badges[hash % _badges.length] : null;

    final rating = 4.3 + (hash % 7) * 0.1; // 4.3–4.9
    final reviews = 300 + (hash * 37) % 1800; // 300–2099
    final reviewLabel = reviews >= 1000
        ? '${(reviews / 1000).toStringAsFixed(1)}K+'
        : '$reviews';

    return ProductMerchandising(
      badgeLabel: badge?.label,
      badgeColor: badge?.color ?? AppColors.primaryRed,
      rating: double.parse(rating.toStringAsFixed(1)),
      reviewCountLabel: reviewLabel,
    );
  }
}

class BadgeChip extends StatelessWidget {
  final String label;
  final Color color;

  const BadgeChip({super.key, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
          fontSize: 10,
          height: 1.2,
        ),
      ),
    );
  }
}

class RatingPill extends StatelessWidget {
  final double rating;
  final String reviewCountLabel;

  const RatingPill({
    super.key,
    required this.rating,
    required this.reviewCountLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.star_rounded, size: 14, color: AppColors.accentYellow),
        const SizedBox(width: 2),
        Text(
          '$rating',
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
        const SizedBox(width: 3),
        Text(
          '($reviewCountLabel)',
          style: const TextStyle(color: Colors.white54, fontSize: 11),
        ),
      ],
    );
  }
}
