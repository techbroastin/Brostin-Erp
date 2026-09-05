import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Builds the lowercase text [FoodKeywordBucket] classification matches
/// against. Shared so [FoodVisual] and `CuratedFoodImage` always classify
/// the same product the same way.
String foodKeywordHaystack({String? categoryName, String? productName}) =>
    '${categoryName ?? ''} ${productName ?? ''}'.toLowerCase();

/// Deterministically picks an entry from [pool] based on [haystack], so the
/// same product name always maps to the same entry (e.g. same photo/tint).
T pickByHaystack<T>(String haystack, List<T> pool) {
  final key = haystack.isEmpty ? 0 : haystack.codeUnits.reduce((a, b) => a + b);
  return pool[key % pool.length];
}

/// Single source of truth for the keyword→category matching that both the
/// icon fallback ([FoodVisual]) and the curated stock photos
/// (`CuratedFoodImage`) use, so the two can no longer drift apart on which
/// bucket a given product/category name falls into.
enum FoodKeywordBucket {
  burger,
  wrapTwist,
  chickenPieces,
  grill,
  feastSharing,
  fries,
  addOnsMisc,
  beverage,
  none,
}

/// [haystack] should come from [foodKeywordHaystack]. Category is matched
/// first (broader, more reliable signal); falls back to product-name
/// keywords for a search-results list where the category may not be loaded.
FoodKeywordBucket classifyFoodKeyword(String haystack) {
  if (haystack.contains('burger')) return FoodKeywordBucket.burger;
  if (haystack.contains('wrap') || haystack.contains('twist')) {
    return FoodKeywordBucket.wrapTwist;
  }
  if (haystack.contains('strip') ||
      haystack.contains('bite') ||
      haystack.contains('boneless') ||
      haystack.contains('tender') ||
      haystack.contains('popcorn') ||
      haystack.contains('broast') ||
      haystack.contains('chicken')) {
    return FoodKeywordBucket.chickenPieces;
  }
  if (haystack.contains('faham') ||
      haystack.contains('grill') ||
      haystack.contains('kebab') ||
      haystack.contains('smoky')) {
    return FoodKeywordBucket.grill;
  }
  if (haystack.contains('feast') ||
      haystack.contains('bucket') ||
      haystack.contains('platter') ||
      haystack.contains('family') ||
      haystack.contains('sharing') ||
      haystack.contains('party')) {
    return FoodKeywordBucket.feastSharing;
  }
  if (haystack.contains('fries')) return FoodKeywordBucket.fries;
  if (haystack.contains('add-on') ||
      haystack.contains('side') ||
      haystack.contains('dip') ||
      haystack.contains('bun') ||
      haystack.contains('kuboo') ||
      haystack.contains('mayo')) {
    return FoodKeywordBucket.addOnsMisc;
  }
  if (haystack.contains('beverage') ||
      haystack.contains('drink') ||
      haystack.contains('juice') ||
      haystack.contains('mojito') ||
      haystack.contains('curacao')) {
    return FoodKeywordBucket.beverage;
  }
  return FoodKeywordBucket.none;
}

/// Icon + tint pairing shown in place of a real food photo. [Product] keeps
/// its `imageUrl` field for when real photography is supplied later — this
/// is purely a presentation-layer fallback, matched by keyword against the
/// category/product name so it works for any menu content, not just the
/// current 8 seeded categories.
class FoodVisual {
  final IconData icon;
  final Color tint;

  const FoodVisual(this.icon, this.tint);

  static const _palette = [
    AppColors.primaryRed,
    Color(0xFFB5651D), // warm smoky amber-brown — grilled/charcoal items
    AppColors.primaryRedDark,
    Color(0xFFC9821A), // toasted amber
  ];

  factory FoodVisual.forProduct({String? categoryName, String? productName}) {
    final haystack = foodKeywordHaystack(
      categoryName: categoryName,
      productName: productName,
    );
    final icon = switch (classifyFoodKeyword(haystack)) {
      FoodKeywordBucket.burger => Icons.lunch_dining,
      FoodKeywordBucket.wrapTwist => Icons.fastfood,
      FoodKeywordBucket.chickenPieces => Icons.set_meal,
      FoodKeywordBucket.grill => Icons.kebab_dining,
      FoodKeywordBucket.feastSharing => Icons.dinner_dining,
      FoodKeywordBucket.fries || FoodKeywordBucket.addOnsMisc => Icons.tapas,
      FoodKeywordBucket.beverage => Icons.local_drink,
      FoodKeywordBucket.none => Icons.restaurant_menu,
    };
    final tint = pickByHaystack(haystack, _palette);
    return FoodVisual(icon, tint);
  }
}

/// The card-visual widget itself — a soft gradient tint with a large
/// centered icon, filling whatever box the caller sizes it to.
class FoodVisualBox extends StatelessWidget {
  final FoodVisual visual;
  final double iconSize;
  final BorderRadius? borderRadius;

  const FoodVisualBox({
    super.key,
    required this.visual,
    this.iconSize = 32,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              visual.tint.withValues(alpha: 0.20),
              visual.tint.withValues(alpha: 0.08),
            ],
          ),
        ),
        child: Center(
          child: Icon(visual.icon, color: visual.tint, size: iconSize),
        ),
      ),
    );
  }
}
