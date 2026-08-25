class ProductVariant {
  final String id;
  final String productId;
  final String name;
  final double price;
  final bool isDefault;
  final int displayOrder;
  final bool isAvailable;

  const ProductVariant({
    required this.id,
    required this.productId,
    required this.name,
    required this.price,
    required this.isDefault,
    required this.displayOrder,
    required this.isAvailable,
  });

  factory ProductVariant.fromJson(Map<String, dynamic> json) => ProductVariant(
    id: json['id'] as String,
    productId: json['product_id'] as String,
    name: json['name'] as String,
    price: (json['price'] as num).toDouble(),
    isDefault: json['is_default'] as bool,
    displayOrder: json['display_order'] as int,
    isAvailable: json['is_available'] as bool,
  );
}
