import '../../models/order.dart';
import '../../models/order_item.dart';
import '../../services/cart_service.dart';
import '../../services/supabase_service.dart';

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

class OrderRepository {
  final _client = SupabaseService.client;

  /// Creates the order row (order_number is generated server-side by a
  /// trigger, never by the client), then the associated order_items. Product
  /// name and price are snapshotted from the cart at order time and never
  /// recalculated from current product data.
  Future<Order> createOrder(NewOrderInput input) async {
    final orderRow = await _client
        .from('orders')
        .insert({
          'customer_id': input.customerId,
          'branch_id': input.branchId,
          'address_id': input.addressId,
          'order_type': input.orderType.name,
          'subtotal': input.subtotal,
          'delivery_charge': input.deliveryCharge,
          'discount': input.discount,
          'grand_total': input.grandTotal,
          'payment_method': input.paymentMethod.name,
        })
        .select()
        .single();

    final order = Order.fromJson(orderRow);

    final itemRows = input.lines
        .map((line) => {
              'order_id': order.id,
              'product_id': line.product.id,
              'product_name': line.product.name,
              'unit_price': line.product.price,
              'quantity': line.quantity,
              'line_total': line.lineTotal,
            })
        .toList();

    await _client.from('order_items').insert(itemRows);

    return order;
  }

  Future<Order> fetchOrder(String orderId) async {
    final row = await _client.from('orders').select().eq('id', orderId).single();
    return Order.fromJson(row);
  }

  Future<List<OrderItem>> fetchOrderItems(String orderId) async {
    final rows = await _client.from('order_items').select().eq('order_id', orderId);
    return (rows as List).map((e) => OrderItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<Order>> fetchCustomerOrders(String customerId) async {
    final rows = await _client
        .from('orders')
        .select()
        .eq('customer_id', customerId)
        .order('created_at', ascending: false);
    return (rows as List).map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
  }
}
