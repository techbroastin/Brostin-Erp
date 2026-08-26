import 'dart:math';

import '../models/customer.dart';
import '../models/customer_address.dart';
import '../models/order.dart';
import '../models/order_item.dart';
import 'mock_menu_data.dart';

/// A single in-memory "database" shared by MockCustomerRepository,
/// MockAddressRepository, and MockOrderRepository, so that data created on
/// one screen (e.g. an address added at checkout) is visible on another
/// (e.g. the saved-addresses list) within the same app session — mirroring
/// how the real Postgres tables behave, without touching Supabase.
///
/// One instance is created in main.dart and shared via Provider. This is
/// intentionally the ONLY stateful mock store — everything else derives
/// from it or from MockMenuData (read-only).
class MockBackend {
  final _random = Random();

  final Map<String, Customer> _customersById = {};
  final Map<String, CustomerAddress> _addressesById = {};
  final Map<String, Order> _ordersById = {};
  final Map<String, List<OrderItem>> _orderItemsByOrderId = {};

  int _orderSequenceToday = 0;

  String _newId(String prefix) =>
      '$prefix-${DateTime.now().microsecondsSinceEpoch}-${_random.nextInt(9999)}';

  // ---------------------------------------------------------------------
  // Customers
  // ---------------------------------------------------------------------

  /// NOTE — mock-only simplification: this looks customers up by phone,
  /// which is intentionally NOT how the real identify_or_create_customer
  /// RPC works (see docs/07_SECURITY_RLS.md — the real function keys
  /// ownership off auth_user_id, never phone, specifically so one session
  /// can never access another's data via a known phone number). That
  /// ownership/security model has nothing to demonstrate in a pure-UI mock
  /// with no concept of "another session" — this mock only needs to make
  /// "returning customer" behavior visible in the UI during development.
  ({Customer customer, bool isNew}) identifyOrCreate({
    required String phone,
    String? name,
  }) {
    Customer? existing;
    for (final c in _customersById.values) {
      if (c.phone == phone) {
        existing = c;
        break;
      }
    }
    if (existing != null) {
      final updated = Customer(
        id: existing.id,
        phone: phone,
        name: name ?? existing.name,
      );
      _customersById[existing.id] = updated;
      return (customer: updated, isNew: false);
    }
    final id = _newId('cust');
    final created = Customer(id: id, phone: phone, name: name);
    _customersById[id] = created;
    return (customer: created, isNew: true);
  }

  Customer? customerById(String customerId) => _customersById[customerId];

  // ---------------------------------------------------------------------
  // Addresses
  // ---------------------------------------------------------------------

  List<CustomerAddress> addressesForCustomer(String customerId) =>
      _addressesById.values.where((a) => a.customerId == customerId).toList()
        ..sort((a, b) => (a.isDefault ? 0 : 1).compareTo(b.isDefault ? 0 : 1));

  CustomerAddress addAddress(CustomerAddress address) {
    final id = _newId('addr');
    final stored = CustomerAddress(
      id: id,
      customerId: address.customerId,
      label: address.label,
      houseBuilding: address.houseBuilding,
      street: address.street,
      area: address.area,
      landmark: address.landmark,
      pincode: address.pincode,
      latitude: address.latitude,
      longitude: address.longitude,
      deliveryNotes: address.deliveryNotes,
      isDefault: address.isDefault,
    );
    _addressesById[id] = stored;
    return stored;
  }

  CustomerAddress updateAddress(CustomerAddress address) {
    _addressesById[address.id] = address;
    return address;
  }

  void deleteAddress(String addressId) => _addressesById.remove(addressId);

  CustomerAddress? addressById(String addressId) => _addressesById[addressId];

  // ---------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------

  /// Mirrors generate_order_number()'s BR-YYYYMMDD-#### format and its
  /// per-day sequential behavior (not concurrency-safe here — that
  /// guarantee is a database property, not something meaningful to fake
  /// client-side; see docs/10_ORDER_LIFECYCLE.md).
  String _nextOrderNumber() {
    _orderSequenceToday += 1;
    final now = DateTime.now();
    final datePart =
        '${now.year.toString().padLeft(4, '0')}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}';
    return 'BR-$datePart-${_orderSequenceToday.toString().padLeft(4, '0')}';
  }

  /// subtotal/discount/grandTotal are computed once by
  /// OrderPlacementUseCase (the domain layer) and passed in here — this
  /// mock intentionally does not recompute them independently. The real
  /// backend's authoritative recalculation is the recalculate_order_totals()
  /// trigger (supabase/migrations/20260824120002_orders_schema.sql), not
  /// this mock; duplicating that logic here served no purpose once the
  /// domain layer already produces the values.
  Order createOrder({
    required String customerId,
    required String branchId,
    String? addressId,
    required OrderType orderType,
    required double subtotal,
    required double deliveryCharge,
    required double discount,
    required double grandTotal,
    required PaymentMethod paymentMethod,
    required List<
      ({
        String productId,
        String? variantId,
        String productName,
        String? variantName,
        double unitPrice,
        int quantity,
      })
    >
    lines,
  }) {
    final orderId = _newId('order');
    final items = lines
        .map(
          (l) => OrderItem(
            id: _newId('item'),
            orderId: orderId,
            productId: l.productId,
            variantId: l.variantId,
            productName: l.productName,
            variantName: l.variantName,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            lineTotal: l.unitPrice * l.quantity,
          ),
        )
        .toList();

    final order = Order(
      id: orderId,
      orderNumber: _nextOrderNumber(),
      customerId: customerId,
      branchId: branchId,
      addressId: addressId,
      orderType: orderType,
      subtotal: subtotal,
      deliveryCharge: deliveryCharge,
      discount: discount,
      grandTotal: grandTotal,
      paymentMethod: paymentMethod,
      paymentStatus: PaymentStatus.pending,
      orderStatus: OrderStatus.placed,
      createdAt: DateTime.now(),
    );

    _ordersById[orderId] = order;
    _orderItemsByOrderId[orderId] = items;
    return order;
  }

  Order? orderById(String orderId) => _ordersById[orderId];

  List<OrderItem> itemsForOrder(String orderId) =>
      _orderItemsByOrderId[orderId] ?? const [];

  List<Order> ordersForCustomer(String customerId) =>
      _ordersById.values.where((o) => o.customerId == customerId).toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  static const branchId = MockMenuData.branchId;
}
