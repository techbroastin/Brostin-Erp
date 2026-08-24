import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'services/cart_service.dart';
import 'services/session_service.dart';
import 'services/supabase_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SupabaseService.initialize();

  final sessionService = SessionService();
  await sessionService.restore();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartService()),
        Provider<SessionService>.value(value: sessionService),
      ],
      child: const BroastinApp(),
    ),
  );
}
