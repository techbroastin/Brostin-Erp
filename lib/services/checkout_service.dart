import 'package:flutter/foundation.dart';
import '../core/constants/app_constants.dart';
import '../models/customer_address.dart';
import '../models/order.dart';

/// Holds in-progress checkout selections (order type, branch/table context,
/// chosen address, delivery pricing preview, payment method) as the
/// customer moves through the order-type/address/review screens. Reset
/// once an order is successfully placed so the next order starts clean.
class CheckoutService extends ChangeNotifier {
  /// The real active branch — set by LandingScreen once it resolves the
  /// actual branch from Supabase (see setActiveBranch()). Starts as
  /// AppConstants.singleBranchId only as a placeholder until that first
  /// load completes; that constant does not correspond to any real branch
  /// row and must never reach an actual order insert. [chooseDining]
  /// overrides this with the QR-resolved branch when dining.
  String branchId = AppConstants.singleBranchId;
  String? tableId;

  OrderType? orderType;
  CustomerAddress? selectedAddress;
  PaymentMethod paymentMethod = PaymentMethod.cash;

  /// Set only after a successful calculate_delivery_charge() call for the
  /// selected address — never a client-invented number. See
  /// DeliveryPricingUseCase. Null means "not yet calculated" or
  /// "unavailable", both of which block proceeding to review.
  double? deliveryDistanceKm;
  double? previewDeliveryCharge;

  double get deliveryCharge =>
      orderType == OrderType.delivery ? (previewDeliveryCharge ?? 0.0) : 0.0;

  /// Called once by LandingScreen after it loads the real active branch —
  /// this becomes the branch takeaway/delivery orders are placed against.
  void setActiveBranch(String branchId) {
    this.branchId = branchId;
  }

  void chooseDining({required String branchId, required String tableId}) {
    orderType = OrderType.dining;
    this.branchId = branchId;
    this.tableId = tableId;
    selectedAddress = null;
    deliveryDistanceKm = null;
    previewDeliveryCharge = null;
    notifyListeners();
  }

  void chooseTakeaway() {
    orderType = OrderType.takeaway;
    // branchId intentionally left as-is — the real active branch set by
    // LandingScreen (or, if switching away from dining mid-session, still
    // correct since Broastin is single-branch today).
    tableId = null;
    selectedAddress = null;
    deliveryDistanceKm = null;
    previewDeliveryCharge = null;
    notifyListeners();
  }

  void chooseDelivery() {
    orderType = OrderType.delivery;
    tableId = null;
    notifyListeners();
  }

  void setAddress(CustomerAddress address) {
    selectedAddress = address;
    deliveryDistanceKm = null;
    previewDeliveryCharge = null;
    notifyListeners();
  }

  /// Records a server-calculated delivery charge preview for the currently
  /// selected address. Called only after DeliveryPricingUseCase succeeds.
  void setDeliveryPricing({required double distanceKm, required double charge}) {
    deliveryDistanceKm = distanceKm;
    previewDeliveryCharge = charge;
    notifyListeners();
  }

  void clearDeliveryPricing() {
    deliveryDistanceKm = null;
    previewDeliveryCharge = null;
    notifyListeners();
  }

  void setPaymentMethod(PaymentMethod method) {
    paymentMethod = method;
    notifyListeners();
  }

  bool get isReadyForReview {
    if (orderType == null) return false;
    if (orderType == OrderType.dining && tableId == null) return false;
    if (orderType == OrderType.delivery &&
        (selectedAddress == null || previewDeliveryCharge == null)) {
      return false;
    }
    return true;
  }

  void reset() {
    orderType = null;
    // branchId intentionally NOT reset — stays as the real active branch;
    // resetting it would put the stale mock-phase placeholder back.
    tableId = null;
    selectedAddress = null;
    paymentMethod = PaymentMethod.cash;
    deliveryDistanceKm = null;
    previewDeliveryCharge = null;
    notifyListeners();
  }
}
