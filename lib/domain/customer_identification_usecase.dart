import '../core/utils/phone_validator.dart';
import '../data/repositories/customer_repository.dart';
import '../services/session_service.dart';

class CustomerIdentificationUseCase {
  final CustomerRepository _customerRepository;
  final SessionService _sessionService;

  CustomerIdentificationUseCase(this._customerRepository, this._sessionService);

  /// Validates the phone, identifies-or-creates the customer via the
  /// backend RPC, and persists the resulting local session.
  Future<IdentifyCustomerResult> identify({
    required String rawPhone,
    String? name,
  }) async {
    final phone = PhoneValidator.toE164(rawPhone);

    final result = await _customerRepository.identifyOrCreate(phone: phone, name: name);

    await _sessionService.save(
      customerId: result.customerId,
      phone: phone,
      name: name,
    );

    return result;
  }
}
