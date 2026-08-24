import 'package:flutter/foundation.dart';
import '../models/product.dart';

class CartLine {
  final Product product;
  int quantity;

  CartLine({required this.product, this.quantity = 1});

  double get lineTotal => product.price * quantity;
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

  void addProduct(Product product, {int quantity = 1}) {
    final existing = _lines[product.id];
    if (existing != null) {
      existing.quantity += quantity;
    } else {
      _lines[product.id] = CartLine(product: product, quantity: quantity);
    }
    notifyListeners();
  }

  void incrementQuantity(String productId) {
    final line = _lines[productId];
    if (line == null) return;
    line.quantity += 1;
    notifyListeners();
  }

  void decrementQuantity(String productId) {
    final line = _lines[productId];
    if (line == null) return;
    if (line.quantity <= 1) {
      _lines.remove(productId);
    } else {
      line.quantity -= 1;
    }
    notifyListeners();
  }

  void removeProduct(String productId) {
    _lines.remove(productId);
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }
}
