import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../models/customer_address.dart';
import '../models/order.dart';

/// Holds in-progress checkout selections (order type, chosen address,
/// payment method) as the customer moves through Screens 5-8. Reset once an
/// order is successfully placed so the next order starts clean.
class CheckoutService extends ChangeNotifier {
  /// App 1 operates a single branch — see AppConstants.singleBranchId.
  final String branchId = AppConstants.singleBranchId;

  OrderType? orderType;
  CustomerAddress? selectedAddress;
  PaymentMethod paymentMethod = PaymentMethod.cash;

  /// Placeholder delivery fee shown for delivery orders in the UI/UX phase.
  /// No delivery-zone/fee calculation exists yet — see
  /// docs/07_SECURITY_RLS.md and docs/10_ORDER_LIFECYCLE.md.
  static const double flatDeliveryCharge = 30.0;

  double get deliveryCharge => orderType == OrderType.delivery ? flatDeliveryCharge : 0.0;

  void setOrderType(OrderType type) {
    orderType = type;
    if (type == OrderType.takeaway) {
      selectedAddress = null;
    }
    notifyListeners();
  }

  void setAddress(CustomerAddress address) {
    selectedAddress = address;
    notifyListeners();
  }

  void setPaymentMethod(PaymentMethod method) {
    paymentMethod = method;
    notifyListeners();
  }

  bool get isReadyForReview {
    if (orderType == null) return false;
    if (orderType == OrderType.delivery && selectedAddress == null) return false;
    return true;
  }

  void reset() {
    orderType = null;
    selectedAddress = null;
    paymentMethod = PaymentMethod.cash;
    notifyListeners();
  }
}
