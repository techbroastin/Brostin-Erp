import 'package:flutter/material.dart';

import 'admin/admin_app.dart';
import 'services/supabase_service.dart';

/// Separate entry point for the Owner Admin interface — run/build with
/// `-t lib/main_admin.dart`. Kept isolated from lib/main.dart so the
/// customer app's anonymous-session bootstrap is never touched: this
/// entry point never calls SupabaseService.ensureAnonymousSession(), only
/// real owner email/password sign-in (see AdminAuthController).
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!SupabaseService.isConfigured) {
    runApp(const _AdminConfigErrorApp());
    return;
  }

  try {
    await SupabaseService.initialize();
  } catch (e) {
    runApp(_AdminConfigErrorApp(message: 'Supabase init failed: $e'));
    return;
  }

  runApp(const AdminApp());
}

/// The Admin app has no mock/offline mode — it manages real business data,
/// so a missing/broken Supabase configuration is a hard stop rather than a
/// silent fallback (unlike the customer app's Mock* repository fallback).
class _AdminConfigErrorApp extends StatelessWidget {
  const _AdminConfigErrorApp({this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              message ??
                  'Missing Supabase configuration. Run with '
                      '--dart-define=SUPABASE_URL=... '
                      '--dart-define=SUPABASE_ANON_KEY=...',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}
