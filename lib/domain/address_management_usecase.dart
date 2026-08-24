import '../data/repositories/address_repository.dart';
import '../models/customer_address.dart';
import '../services/geolocation_service.dart';

class AddressManagementUseCase {
  final AddressRepository _addressRepository;
  final GeolocationService _geolocationService;

  AddressManagementUseCase(this._addressRepository, this._geolocationService);

  Future<List<CustomerAddress>> savedAddresses(String customerId) =>
      _addressRepository.fetchAddresses(customerId);

  /// Only triggers the browser/device location permission prompt when the
  /// customer explicitly chose "Use Current Location" — never on page load.
  Future<LocationResult> captureCurrentLocation() =>
      _geolocationService.getCurrentLocation();

  Future<CustomerAddress> saveAddress(CustomerAddress address) {
    return address.id.isEmpty
        ? _addressRepository.addAddress(address)
        : _addressRepository.updateAddress(address);
  }

  Future<void> deleteAddress(String addressId) =>
      _addressRepository.deleteAddress(addressId);
}
