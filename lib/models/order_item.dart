class OrderItem {
  final String id;
  final String orderId;
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final double lineTotal;

  const OrderItem({
    required this.id,
    required this.orderId,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) => OrderItem(
        id: json['id'] as String,
        orderId: json['order_id'] as String,
        productId: json['product_id'] as String,
        productName: json['product_name'] as String,
        unitPrice: (json['unit_price'] as num).toDouble(),
        quantity: json['quantity'] as int,
        lineTotal: (json['line_total'] as num).toDouble(),
      );
}
