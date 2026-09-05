enum OrderType { takeaway, delivery, dining }

enum PaymentMethod { cash, upi }

enum PaymentStatus { pending, paid, failed, cancelled }

enum OrderStatus {
  placed,
  confirmed,
  preparing,
  ready,
  outForDelivery,
  delivered,
  completed,
  cancelled,
}

OrderType orderTypeFromString(String value) =>
    OrderType.values.firstWhere((e) => e.name == value);

String orderTypeLabel(OrderType type) => switch (type) {
  OrderType.dining => 'Dining',
  OrderType.takeaway => 'Takeaway',
  OrderType.delivery => 'Delivery',
};

PaymentMethod paymentMethodFromString(String value) =>
    PaymentMethod.values.firstWhere((e) => e.name == value);

PaymentStatus paymentStatusFromString(String value) =>
    PaymentStatus.values.firstWhere((e) => e.name == value);

OrderStatus orderStatusFromString(String value) {
  final dbValue = value.replaceAll('_', '');
  return OrderStatus.values.firstWhere(
    (e) => e.name.toLowerCase() == dbValue.toLowerCase(),
  );
}

class Order {
  final String id;
  final String orderNumber;
  final String customerId;
  final String branchId;
  final String? addressId;
  final String? tableId;
  final OrderType orderType;
  final double subtotal;
  final double deliveryCharge;
  final double discount;
  final double grandTotal;
  final PaymentMethod paymentMethod;
  final PaymentStatus paymentStatus;
  final String? paymentReference;
  final OrderStatus orderStatus;
  final DateTime createdAt;
  final Map<String, dynamic>? deliveryAddressSnapshot;
  final double? deliveryLatitude;
  final double? deliveryLongitude;
  final String? deliveryInstructions;
  final double? deliveryDistanceKm;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    required this.branchId,
    this.addressId,
    this.tableId,
    required this.orderType,
    required this.subtotal,
    required this.deliveryCharge,
    required this.discount,
    required this.grandTotal,
    required this.paymentMethod,
    required this.paymentStatus,
    this.paymentReference,
    required this.orderStatus,
    required this.createdAt,
    this.deliveryAddressSnapshot,
    this.deliveryLatitude,
    this.deliveryLongitude,
    this.deliveryInstructions,
    this.deliveryDistanceKm,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
    id: json['id'] as String,
    orderNumber: json['order_number'] as String,
    customerId: json['customer_id'] as String,
    branchId: json['branch_id'] as String,
    addressId: json['address_id'] as String?,
    tableId: json['table_id'] as String?,
    orderType: orderTypeFromString(json['order_type'] as String),
    subtotal: (json['subtotal'] as num).toDouble(),
    deliveryCharge: (json['delivery_charge'] as num).toDouble(),
    discount: (json['discount'] as num).toDouble(),
    grandTotal: (json['grand_total'] as num).toDouble(),
    paymentMethod: paymentMethodFromString(json['payment_method'] as String),
    paymentStatus: paymentStatusFromString(json['payment_status'] as String),
    paymentReference: json['payment_reference'] as String?,
    orderStatus: orderStatusFromString(json['order_status'] as String),
    createdAt: DateTime.parse(json['created_at'] as String),
    deliveryAddressSnapshot:
        json['delivery_address_snapshot'] as Map<String, dynamic>?,
    deliveryLatitude: (json['delivery_latitude'] as num?)?.toDouble(),
    deliveryLongitude: (json['delivery_longitude'] as num?)?.toDouble(),
    deliveryInstructions: json['delivery_instructions'] as String?,
    deliveryDistanceKm: (json['delivery_distance_km'] as num?)?.toDouble(),
  );
}
