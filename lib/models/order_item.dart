class OrderItem {
  final String id;
  final String orderId;
  final String productId;
  final String? variantId;
  final String productName;
  final String? variantName;
  final double unitPrice;
  final int quantity;
  final double lineTotal;

  const OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    this.variantId,
    required this.productName,
    this.variantName,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
    id: json['id'] as String,
    orderId: json['order_id'] as String,
    productId: json['product_id'] as String,
    variantId: json['variant_id'] as String?,
    productName: json['product_name'] as String,
    variantName: json['variant_name'] as String?,
    // unit_price/product_name/variant_name/line_total are all assigned
    // server-side by set_order_item_snapshot() — this is just reading
    // back what the trigger computed, never client-trusted input.
    unitPrice: (json['unit_price'] as num).toDouble(),
    quantity: json['quantity'] as int,
    lineTotal: (json['line_total'] as num).toDouble(),
  );
}
