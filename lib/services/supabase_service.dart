import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/constants/app_constants.dart';

/// Thin wrapper around the Supabase client singleton. Only this file (and the
/// repositories that consume it) may talk to Supabase directly — never the UI.
class SupabaseService {
  SupabaseService._();

  static Future<void> initialize() async {
    if (SupabaseConfig.url.isEmpty || SupabaseConfig.anonKey.isEmpty) {
      throw StateError(
        'Missing Supabase configuration. Run with '
        '--dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...',
      );
    }

    await Supabase.initialize(
      url: SupabaseConfig.url,
      publishableKey: SupabaseConfig.anonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;
}
