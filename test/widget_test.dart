import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/app.dart';
import 'package:broastin_ordering/core/constants/app_constants.dart';

void main() {
  testWidgets('landing screen renders the Broastin brand and Order Now CTA', (WidgetTester tester) async {
    await tester.pumpWidget(const BroastinApp());
    await tester.pumpAndSettle();

    expect(find.text(AppConstants.appName), findsOneWidget);
    expect(find.text(AppConstants.appTagline), findsOneWidget);
    expect(find.text('Order Now'), findsOneWidget);
  });
}
