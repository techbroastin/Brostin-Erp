import 'package:flutter_test/flutter_test.dart';

import 'package:broastin_ordering/app.dart';
import 'package:broastin_ordering/core/constants/app_constants.dart';

void main() {
  testWidgets('renders the Broastin foundation placeholder', (WidgetTester tester) async {
    await tester.pumpWidget(const BroastinApp());

    expect(find.text(AppConstants.appName), findsOneWidget);
    expect(find.text(AppConstants.appTagline), findsOneWidget);
  });
}
