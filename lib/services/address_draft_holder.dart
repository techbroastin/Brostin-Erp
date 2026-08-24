import '../models/customer_address.dart';

/// Ephemeral hand-off between AddressScreen and EditAddressScreen — carries
/// a captured GPS location or an address being edited across the
/// navigation. Not persisted (losing it on a page refresh is fine; unlike
/// CheckoutService/CartService this holds no data the customer would be
/// upset to re-enter).
class AddressDraftHolder {
  double? latitude;
  double? longitude;
  CustomerAddress? editing;

  void setLocation(double lat, double lng) {
    latitude = lat;
    longitude = lng;
  }

  void setEditing(CustomerAddress address) => editing = address;

  void clear() {
    latitude = null;
    longitude = null;
    editing = null;
  }
}
