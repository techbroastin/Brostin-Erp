class PhoneValidator {
  PhoneValidator._();

  static final RegExp _indianMobile = RegExp(r'^[6-9]\d{9}$');

  /// Accepts a raw 10-digit Indian mobile number (no country code, no spaces).
  static bool isValid(String input) => _indianMobile.hasMatch(input.trim());

  /// Normalizes a raw 10-digit number to the stored E.164-style format (+91XXXXXXXXXX).
  /// Throws [FormatException] if [raw] is not a valid Indian mobile number.
  static String toE164(String raw) {
    final trimmed = raw.trim();
    if (!isValid(trimmed)) {
      throw const FormatException('Invalid Indian mobile number');
    }
    return '+91$trimmed';
  }
}
