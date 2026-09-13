import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../services/admin_auth_controller.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AdminAuthController>();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Dashboard', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 4),
          Text(
            'Signed in as ${auth.ownerEmail ?? 'owner'}',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Admin foundation is live',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'This is Phase 12: navigation shell and owner sign-in '
                    'only. Menu, Orders, Tables, Delivery and Customer '
                    'management screens are placeholders until the '
                    'owner-admin RLS policies are reviewed and applied — '
                    'see PHASE_12_ADMIN_FOUNDATION_REPORT.md.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
