import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import 'food_visual.dart';

/// Curated stock food photography, keyed by the same category/product
/// keyword buckets [FoodVisual] uses. Every URL below was verified (fetched
/// and visually checked) to actually depict the named dish before being
/// added here — do not add new entries without doing the same, a wrong
/// photo is worse than the plain icon fallback.
///
/// This is a presentation-layer stand-in for real branch photography.
/// [Product.imageUrl] (real, per-product photo) always wins when set —
/// see [FoodImageBox].
class CuratedFoodImage {
  CuratedFoodImage._();

  static const _burgers = [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=400&q=70&auto=format&fit=crop',
  ];

  static const _friedChicken = [
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=70&auto=format&fit=crop',
  ];

  static const _buckets = [
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=70&auto=format&fit=crop',
  ];

  static const _fries = [
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=70&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=70&auto=format&fit=crop',
  ];

  static const _grill = [
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&q=70&auto=format&fit=crop',
  ];

  static const _beverages = [
    'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400&q=70&auto=format&fit=crop',
  ];

  /// Returns null when no verified photo exists for this item — callers
  /// fall back to [FoodVisualBox] rather than showing a mismatched photo.
  ///
  /// Buckets are classified via [classifyFoodKeyword], the same function
  /// [FoodVisual] uses, so the icon fallback and the curated photo always
  /// agree on what kind of item this is.
  static String? forProduct({String? categoryName, String? productName}) {
    final haystack = foodKeywordHaystack(
      categoryName: categoryName,
      productName: productName,
    );
    final pool = switch (classifyFoodKeyword(haystack)) {
      FoodKeywordBucket.burger => _burgers,
      FoodKeywordBucket.feastSharing => _buckets,
      FoodKeywordBucket.grill => _grill,
      FoodKeywordBucket.fries => _fries,
      FoodKeywordBucket.beverage => _beverages,
      FoodKeywordBucket.chickenPieces => _friedChicken,
      FoodKeywordBucket.wrapTwist ||
      FoodKeywordBucket.addOnsMisc ||
      FoodKeywordBucket.none =>
        null,
    };
    if (pool == null || pool.isEmpty) return null;
    return pickByHaystack(haystack, pool);
  }
}

/// Food photo for a card, preferring (in order): a real per-product
/// [imageUrl], a verified curated stock photo for the item's category, then
/// the icon-tint [FoodVisualBox] placeholder. A curated photo that fails to
/// load at runtime (offline, CDN hiccup) also falls back to the icon box,
/// so the UI never shows a broken-image glyph.
class FoodImageBox extends StatelessWidget {
  final String? imageUrl;
  final String? categoryName;
  final String? productName;
  final double iconSize;
  final BorderRadius? borderRadius;

  const FoodImageBox({
    super.key,
    required this.imageUrl,
    this.categoryName,
    this.productName,
    this.iconSize = 32,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final visual = FoodVisual.forProduct(
      categoryName: categoryName,
      productName: productName,
    );
    final fallback = FoodVisualBox(
      visual: visual,
      iconSize: iconSize,
      borderRadius: borderRadius,
    );

    final url = imageUrl ??
        CuratedFoodImage.forProduct(
          categoryName: categoryName,
          productName: productName,
        );
    if (url == null) return fallback;

    final image = CachedNetworkImage(
      imageUrl: url,
      fit: BoxFit.cover,
      placeholder: (context, _) => fallback,
      errorWidget: (context, _, _) => fallback,
    );
    return borderRadius == null
        ? image
        : ClipRRect(borderRadius: borderRadius!, child: image);
  }
}
