import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/admin/domain/menu_form_validators.dart';

void main() {
  group('MenuFormValidators.requiredName', () {
    test('rejects null/empty/whitespace', () {
      expect(MenuFormValidators.requiredName(null), isNotNull);
      expect(MenuFormValidators.requiredName(''), isNotNull);
      expect(MenuFormValidators.requiredName('   '), isNotNull);
    });

    test('accepts a non-empty name', () {
      expect(MenuFormValidators.requiredName('Burgers'), isNull);
    });
  });

  group('MenuFormValidators.price', () {
    test('rejects empty, non-numeric, and negative values', () {
      expect(MenuFormValidators.price(null), isNotNull);
      expect(MenuFormValidators.price(''), isNotNull);
      expect(MenuFormValidators.price('abc'), isNotNull);
      expect(MenuFormValidators.price('-5'), isNotNull);
    });

    test('accepts zero and positive numeric values', () {
      expect(MenuFormValidators.price('0'), isNull);
      expect(MenuFormValidators.price('149.50'), isNull);
    });
  });

  group('MenuFormValidators.displayOrder', () {
    test('rejects empty, non-integer, and negative values', () {
      expect(MenuFormValidators.displayOrder(null), isNotNull);
      expect(MenuFormValidators.displayOrder(''), isNotNull);
      expect(MenuFormValidators.displayOrder('1.5'), isNotNull);
      expect(MenuFormValidators.displayOrder('-1'), isNotNull);
    });

    test('accepts zero and positive whole numbers', () {
      expect(MenuFormValidators.displayOrder('0'), isNull);
      expect(MenuFormValidators.displayOrder('3'), isNull);
    });
  });
}
