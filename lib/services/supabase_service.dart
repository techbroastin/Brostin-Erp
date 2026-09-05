import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/constants/app_constants.dart';

/// Thin wrapper around the Supabase client singleton. Only this file (and the
/// repositories that consume it) may talk to Supabase directly — never the UI.
class SupabaseService {
  SupabaseService._();

  /// True once SUPABASE_URL/SUPABASE_ANON_KEY were supplied via
  /// --dart-define. Lets main() skip Supabase entirely during the
  /// mock-only UI/UX phase — including `flutter test`, which never passes
  /// these — without duplicating this check at the call site.
  static bool get isConfigured =>
      SupabaseConfig.url.isNotEmpty && SupabaseConfig.anonKey.isNotEmpty;

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

  /// Ensures an authenticated (anonymous) Supabase session exists before any
  /// auth.uid()-dependent operation runs. supabase_flutter restores a
  /// persisted session automatically as part of initialize(), so this only
  /// calls signInAnonymously() when no session survived that restore —
  /// never unconditionally, so a normal app restart reuses the existing
  /// anonymous identity instead of minting a new one every time.
  static Future<void> ensureAnonymousSession() async {
    if (client.auth.currentSession != null) {
      return;
    }
    await client.auth.signInAnonymously();
  }
}
