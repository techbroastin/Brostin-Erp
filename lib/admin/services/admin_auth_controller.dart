import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../services/supabase_service.dart';

/// Owner-only auth state for the Admin app. Deliberately separate from the
/// customer app's anonymous session (lib/main.dart / SessionService) — the
/// Admin entry point (main_admin.dart) never calls
/// SupabaseService.ensureAnonymousSession(), so a session here is only ever
/// a real signed-in Supabase Auth user or nothing.
///
/// A signed-in session is not itself proof of owner access — every admin
/// data query is still gated by RLS (see the draft app_admins migration).
/// This controller only decides whether the Admin UI shell is reachable.
class AdminAuthController extends ChangeNotifier {
  AdminAuthController() {
    _session = SupabaseService.client.auth.currentSession;
    _sub = SupabaseService.client.auth.onAuthStateChange.listen((data) {
      _session = data.session;
      notifyListeners();
    });
  }

  Session? _session;
  StreamSubscription<AuthState>? _sub;
  String? _lastError;

  /// True only for a real (non-anonymous) signed-in user — an anonymous
  /// session should never be possible here, but this guards against it if
  /// one is ever restored from shared browser storage.
  bool get isSignedIn => _session != null && !(_session!.user.isAnonymous);

  String? get ownerEmail => _session?.user.email;
  String? get lastError => _lastError;

  Future<bool> signIn(String email, String password) async {
    _lastError = null;
    try {
      await SupabaseService.client.auth.signInWithPassword(
        email: email,
        password: password,
      );
      return true;
    } on AuthException catch (e) {
      _lastError = e.message;
      notifyListeners();
      return false;
    } catch (e) {
      _lastError = 'Sign-in failed. Check your connection and try again.';
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    await SupabaseService.client.auth.signOut();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
