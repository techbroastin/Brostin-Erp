import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/constants/app_constants.dart';
import '../core/theme/app_theme.dart';
import 'core/admin_router.dart';
import 'services/admin_auth_controller.dart';

class AdminApp extends StatefulWidget {
  const AdminApp({super.key});

  @override
  State<AdminApp> createState() => _AdminAppState();
}

class _AdminAppState extends State<AdminApp> {
  late final AdminAuthController _auth;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _auth = AdminAuthController();
    // GoRouter's own refreshListenable (set to _auth below) re-evaluates
    // `redirect` whenever the auth state changes — built once here, not
    // rebuilt per-frame, so in-flight navigation state isn't lost.
    _router = buildAdminRouter(_auth);
  }

  @override
  void dispose() {
    _router.dispose();
    _auth.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AdminAuthController>.value(
      value: _auth,
      child: MaterialApp.router(
        title: '${AppConstants.appName} Admin',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        routerConfig: _router,
      ),
    );
  }
}
