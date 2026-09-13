class Product {
  final String id;
  final String categoryId;
  final String name;
  final String? description;
  final double price;
  final String? imageUrl;
  final bool isAvailable;
  final int displayOrder;
  final bool isDemo;
  final bool isFeatured;

  const Product({
    required this.id,
    required this.categoryId,
    required this.name,
    this.description,
    required this.price,
    this.imageUrl,
    required this.isAvailable,
    required this.displayOrder,
    required this.isDemo,
    this.isFeatured = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    id: json['id'] as String,
    categoryId: json['category_id'] as String,
    name: json['name'] as String,
    description: json['description'] as String?,
    price: (json['price'] as num).toDouble(),
    imageUrl: json['image_url'] as String?,
    isAvailable: json['is_available'] as bool,
    displayOrder: json['display_order'] as int,
    isDemo: json['is_demo'] as bool? ?? false,
    isFeatured: json['is_featured'] as bool? ?? false,
  );
}
