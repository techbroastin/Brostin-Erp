enum OrderType { takeaway, delivery }

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
  final OrderType orderType;
  final double subtotal;
  final double deliveryCharge;
  final double discount;
  final double grandTotal;
  final PaymentMethod paymentMethod;
  final PaymentStatus paymentStatus;
  final OrderStatus orderStatus;
  final DateTime createdAt;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.customerId,
    required this.branchId,
    this.addressId,
    required this.orderType,
    required this.subtotal,
    required this.deliveryCharge,
    required this.discount,
    required this.grandTotal,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.orderStatus,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        orderNumber: json['order_number'] as String,
        customerId: json['customer_id'] as String,
        branchId: json['branch_id'] as String,
        addressId: json['address_id'] as String?,
        orderType: orderTypeFromString(json['order_type'] as String),
        subtotal: (json['subtotal'] as num).toDouble(),
        deliveryCharge: (json['delivery_charge'] as num).toDouble(),
        discount: (json['discount'] as num).toDouble(),
        grandTotal: (json['grand_total'] as num).toDouble(),
        paymentMethod: paymentMethodFromString(json['payment_method'] as String),
        paymentStatus: paymentStatusFromString(json['payment_status'] as String),
        orderStatus: orderStatusFromString(json['order_status'] as String),
        createdAt: DateTime.parse(json['created_at'] as String),
      );
}
