import '../data/repositories/order_repository.dart';
import '../models/order.dart';
import '../services/cart_service.dart';

class OrderValidationException implements Exception {
  final String message;
  const OrderValidationException(this.message);
}

class OrderPlacementUseCase {
  final OrderRepository _orderRepository;

  OrderPlacementUseCase(this._orderRepository);

  /// Validates the order shape before submitting. Price/availability
  /// integrity itself is enforced by the backend (RLS + snapshotted
  /// unit_price + server-derived delivery_charge); this is a fast
  /// client-side check to fail early with a clear message rather than a
  /// raw database error.
  Future<Order> placeOrder({
    required String customerId,
    required String branchId,
    String? addressId,
    String? tableId,
    required OrderType orderType,
    required PaymentMethod paymentMethod,
    required CartService cart,
    required double deliveryCharge,
    double? deliveryDistanceKm,
    Map<String, dynamic>? deliveryAddressSnapshot,
    double? deliveryLatitude,
    double? deliveryLongitude,
    String? deliveryInstructions,
  }) async {
    if (cart.isEmpty) {
      throw const OrderValidationException('Your cart is empty.');
    }
    if (orderType == OrderType.delivery && addressId == null) {
      throw const OrderValidationException('A delivery address is required.');
    }
    if (orderType == OrderType.dining && tableId == null) {
      throw const OrderValidationException(
        'A table is required for dining orders — please scan the table QR code again.',
      );
    }

    final subtotal = cart.subtotal;
    final grandTotal = subtotal + deliveryCharge;

    return _orderRepository.createOrder(
      NewOrderInput(
        customerId: customerId,
        branchId: branchId,
        addressId: addressId,
        tableId: tableId,
        orderType: orderType,
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        discount: 0,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        lines: cart.lines,
        deliveryAddressSnapshot: deliveryAddressSnapshot,
        deliveryLatitude: deliveryLatitude,
        deliveryLongitude: deliveryLongitude,
        deliveryInstructions: deliveryInstructions,
        deliveryDistanceKm: deliveryDistanceKm,
      ),
    );
  }
}
