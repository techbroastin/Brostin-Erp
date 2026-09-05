import '../../models/order.dart';
import '../../models/order_item.dart';
import '../../services/cart_service.dart';

class NewOrderInput {
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
  final List<CartLine> lines;
  final Map<String, dynamic>? deliveryAddressSnapshot;
  final double? deliveryLatitude;
  final double? deliveryLongitude;
  final String? deliveryInstructions;
  final double? deliveryDistanceKm;

  const NewOrderInput({
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
    required this.lines,
    this.deliveryAddressSnapshot,
    this.deliveryLatitude,
    this.deliveryLongitude,
    this.deliveryInstructions,
    this.deliveryDistanceKm,
  });
}

abstract class OrderRepository {
  Future<Order> createOrder(NewOrderInput input);
  Future<Order> fetchOrder(String orderId);
  Future<List<OrderItem>> fetchOrderItems(String orderId);
  Future<List<Order>> fetchCustomerOrders(String customerId);
}
