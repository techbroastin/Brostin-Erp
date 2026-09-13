/// Pure, Supabase-free form validation for the admin Menu screens. Every
/// function returns null when the input is valid, or a user-facing error
/// string otherwise — the shape `TextFormField.validator` expects.
class MenuFormValidators {
  MenuFormValidators._();

  static String? requiredName(String? value) {
    if (value == null || value.trim().isEmpty) return 'Required';
    return null;
  }

  /// Non-empty, numeric, and non-negative — prices are never allowed to be
  /// negative (matches the database's own `check (price >= 0)` constraint).
  static String? price(String? value) {
    if (value == null || value.trim().isEmpty) return 'Required';
    final parsed = double.tryParse(value.trim());
    if (parsed == null) return 'Enter a valid number';
    if (parsed < 0) return 'Price cannot be negative';
    return null;
  }

  static String? displayOrder(String? value) {
    if (value == null || value.trim().isEmpty) return 'Required';
    final parsed = int.tryParse(value.trim());
    if (parsed == null) return 'Enter a whole number';
    if (parsed < 0) return 'Cannot be negative';
    return null;
  }
}
