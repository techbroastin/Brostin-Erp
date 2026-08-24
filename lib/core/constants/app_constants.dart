class AppConstants {
  AppConstants._();

  static const String appName = 'Broastin Fried Chicken';
  static const String appTagline = 'Fresh • Crunchy • Juicy';

  // SharedPreferences keys for the local customer ordering session.
  static const String prefsCustomerId = 'broastin_customer_id';
  static const String prefsCustomerPhone = 'broastin_customer_phone';
  static const String prefsCustomerName = 'broastin_customer_name';
}

/// Supabase connection values are supplied at build/run time via
/// --dart-define, never hard-coded into source or committed to git:
///   flutter run -d chrome \
///     --dart-define=SUPABASE_URL=https://xxx.supabase.co \
///     --dart-define=SUPABASE_ANON_KEY=sb_publishable_xxx
class SupabaseConfig {
  SupabaseConfig._();

  static const String url = String.fromEnvironment('SUPABASE_URL');
  static const String anonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
}
