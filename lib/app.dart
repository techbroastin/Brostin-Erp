import 'package:flutter/material.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';

/// Root widget. This currently renders a foundation placeholder — the actual
/// screen flow (landing → menu → cart → checkout → confirmation) is built in
/// the next phase once this foundation is approved.
class BroastinApp extends StatelessWidget {
  const BroastinApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const _FoundationPlaceholderScreen(),
    );
  }
}

class _FoundationPlaceholderScreen extends StatelessWidget {
  const _FoundationPlaceholderScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                AppConstants.appName,
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                AppConstants.appTagline,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 24),
              const Text(
                'Foundation build — screens are implemented in the next phase.',
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
