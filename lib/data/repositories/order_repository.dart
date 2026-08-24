import '../../models/order.dart';
import '../../models/order_item.dart';
import '../../services/cart_service.dart';

class NewOrderInput {
  final String customerId;
  final String branchId;
  final String? addressId;
  final OrderType orderType;
  final double subtotal;
  final double deliveryCharge;
  final double discount;
  final double grandTotal;
  final PaymentMethod paymentMethod;
  final List<CartLine> lines;

  const NewOrderInput({
    required this.customerId,
    required this.branchId,
    this.addressId,
    required this.orderType,
    required this.subtotal,
    required this.deliveryCharge,
    required this.discount,
    required this.grandTotal,
    required this.paymentMethod,
    required this.lines,
  });
}

abstract class OrderRepository {
  Future<Order> createOrder(NewOrderInput input);
  Future<Order> fetchOrder(String orderId);
  Future<List<OrderItem>> fetchOrderItems(String orderId);
  Future<List<Order>> fetchCustomerOrders(String customerId);
}
