import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';

/// Local, non-authenticated ordering session for the current browser.
///
/// This is intentionally lightweight: it remembers which customer this
/// browser last identified as (by phone), so "My Orders" / "My Profile" work
/// across page reloads without a password. It is NOT an authentication
/// mechanism — see the Supabase RLS/auth design for how identity is actually
/// protected server-side. This can be layered under future OTP auth without
/// changing its public shape.
class SessionService {
  String? _customerId;
  String? _customerPhone;
  String? _customerName;

  String? get customerId => _customerId;
  String? get customerPhone => _customerPhone;
  String? get customerName => _customerName;
  bool get isIdentified => _customerId != null;

  Future<void> restore() async {
    final prefs = await SharedPreferences.getInstance();
    _customerId = prefs.getString(AppConstants.prefsCustomerId);
    _customerPhone = prefs.getString(AppConstants.prefsCustomerPhone);
    _customerName = prefs.getString(AppConstants.prefsCustomerName);
  }

  Future<void> save({
    required String customerId,
    required String phone,
    String? name,
  }) async {
    _customerId = customerId;
    _customerPhone = phone;
    _customerName = name;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.prefsCustomerId, customerId);
    await prefs.setString(AppConstants.prefsCustomerPhone, phone);
    if (name != null) {
      await prefs.setString(AppConstants.prefsCustomerName, name);
    }
  }

  Future<void> clear() async {
    _customerId = null;
    _customerPhone = null;
    _customerName = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.prefsCustomerId);
    await prefs.remove(AppConstants.prefsCustomerPhone);
    await prefs.remove(AppConstants.prefsCustomerName);
  }
}
