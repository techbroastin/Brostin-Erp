import '../../mock/mock_backend.dart';
import '../../models/order.dart';
import '../../models/order_item.dart';
import 'order_repository.dart';

class MockOrderRepository implements OrderRepository {
  final MockBackend _backend;

  MockOrderRepository(this._backend);

  @override
  Future<Order> createOrder(NewOrderInput input) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return _backend.createOrder(
      customerId: input.customerId,
      branchId: input.branchId,
      addressId: input.addressId,
      orderType: input.orderType,
      deliveryCharge: input.deliveryCharge,
      paymentMethod: input.paymentMethod,
      lines: input.lines
          .map(
            (l) => (
              productId: l.product.id,
              variantId: l.variant?.id,
              productName: l.product.name,
              variantName: l.variant?.name,
              unitPrice: l.unitPrice,
              quantity: l.quantity,
            ),
          )
          .toList(),
    );
  }

  @override
  Future<Order> fetchOrder(String orderId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final order = _backend.orderById(orderId);
    if (order == null) {
      throw StateError('Order $orderId not found');
    }
    return order;
  }

  @override
  Future<List<OrderItem>> fetchOrderItems(String orderId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return _backend.itemsForOrder(orderId);
  }

  @override
  Future<List<Order>> fetchCustomerOrders(String customerId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _backend.ordersForCustomer(customerId);
  }
}
