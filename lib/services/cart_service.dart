import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../models/product_variant.dart';

class CartLine {
  final Product product;
  final ProductVariant? variant;
  int quantity;

  CartLine({required this.product, this.variant, this.quantity = 1});

  /// The authoritative unit price is server-computed at order time (see
  /// set_order_item_snapshot() in the orders migration) — this getter is
  /// only for optimistic UI display before checkout.
  double get unitPrice => variant?.price ?? product.price;

  double get lineTotal => unitPrice * quantity;

  /// A product with variants requires one to be selected before it can be
  /// added to the cart — the cart key must include the variant so "Big
  /// Broaster Burger (Solo)" and "Big Broaster Burger (Meal)" are distinct
  /// lines.
  String get cartKey =>
      variant == null ? product.id : '${product.id}::${variant!.id}';
}

/// Cart state for the current ordering session. Provided app-wide via
/// [ChangeNotifierProvider] so the cart badge, cart screen, and checkout flow
/// all read from a single source of truth.
class CartService extends ChangeNotifier {
  final Map<String, CartLine> _lines = {};

  List<CartLine> get lines => List.unmodifiable(_lines.values);
  int get itemCount => _lines.values.fold(0, (sum, l) => sum + l.quantity);
  double get subtotal => _lines.values.fold(0.0, (sum, l) => sum + l.lineTotal);
  bool get isEmpty => _lines.isEmpty;

  void addProduct(
    Product product, {
    ProductVariant? variant,
    int quantity = 1,
  }) {
    final line = CartLine(
      product: product,
      variant: variant,
      quantity: quantity,
    );
    final existing = _lines[line.cartKey];
    if (existing != null) {
      existing.quantity += quantity;
    } else {
      _lines[line.cartKey] = line;
    }
    notifyListeners();
  }

  void incrementQuantity(String cartKey) {
    final line = _lines[cartKey];
    if (line == null) return;
    line.quantity += 1;
    notifyListeners();
  }

  void decrementQuantity(String cartKey) {
    final line = _lines[cartKey];
    if (line == null) return;
    if (line.quantity <= 1) {
      _lines.remove(cartKey);
    } else {
      line.quantity -= 1;
    }
    notifyListeners();
  }

  void removeProduct(String cartKey) {
    _lines.remove(cartKey);
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }
}
