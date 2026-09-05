import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/dining_repository.dart';
import '../../../services/dining_context_service.dart';
import '../../widgets/loading_view.dart';

/// QR entry point — a table's printed QR encodes `/qr/{opaque-token}`.
/// Resolves the token via resolve_dining_table(), stores the result in
/// [DiningContextService], then continues into the normal landing screen.
/// An invalid/inactive token does not block ordering entirely — it just
/// means dining stays unavailable; takeaway/delivery are unaffected.
class QrEntryScreen extends StatefulWidget {
  final String token;

  const QrEntryScreen({super.key, required this.token});

  @override
  State<QrEntryScreen> createState() => _QrEntryScreenState();
}

class _QrEntryScreenState extends State<QrEntryScreen> {
  late Future<ResolvedDiningTable?> _future;
  bool _handled = false;

  @override
  void initState() {
    super.initState();
    _future = context.read<DiningRepository>().resolveTable(widget.token);
  }

  void _onResolved(ResolvedDiningTable resolved) {
    if (_handled) return;
    _handled = true;
    SchedulerBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<DiningContextService>().setResolvedTable(
        tableId: resolved.tableId,
        branchId: resolved.branchId,
        tableNumber: resolved.tableNumber,
      );
      context.go(AppRoutes.landing);
    });
  }

  void _continueWithoutTable() {
    context.read<DiningContextService>().clear();
    context.go(AppRoutes.landing);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<ResolvedDiningTable?>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            final resolved = snapshot.data;
            if (snapshot.hasError || resolved == null) {
              return _InvalidQrView(onContinue: _continueWithoutTable);
            }
            _onResolved(resolved);
            return const LoadingView();
          },
        ),
      ),
    );
  }
}

class _InvalidQrView extends StatelessWidget {
  final VoidCallback onContinue;

  const _InvalidQrView({required this.onContinue});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.qr_code_scanner_outlined,
                size: 64,
                color: AppColors.textSecondary,
              ),
              const SizedBox(height: 20),
              Text(
                'This table QR code is invalid or no longer active',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              const Text(
                'You can still browse the menu and order for takeaway or '
                'delivery — just not dine-in from this link.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onContinue,
                child: const Text('Continue to Menu'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
