import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/menu_repository.dart';
import '../../../models/branch.dart';
import '../../../models/menu_category.dart';
import '../../../services/checkout_service.dart';
import '../../../services/dining_context_service.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/loading_view.dart';

/// Screen 1 — Landing/Restaurant. Menu browsing starts here with zero
/// account/phone requirement, per the App 1 UX rule. Branch/category data
/// comes from [MenuRepository] — backed by mock data in the UI/UX phase,
/// Supabase later, with no changes needed here when that swap happens.
class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  late Future<_LandingData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_LandingData> _load() async {
    final repo = context.read<MenuRepository>();
    final branches = await repo.fetchActiveBranches();
    final categories = await repo.fetchCategories();
    final branch = branches.isNotEmpty ? branches.first : null;
    // Threads the real branch id into CheckoutService so takeaway/delivery
    // orders are placed against an actual branch row, not the mock-phase
    // placeholder AppConstants.singleBranchId. Dining still overrides this
    // with the QR-resolved branch — see CheckoutService.chooseDining().
    if (branch != null && mounted) {
      context.read<CheckoutService>().setActiveBranch(branch.id);
    }
    return _LandingData(branch: branch, categories: categories);
  }

  void _retry() {
    setState(() {
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: FutureBuilder<_LandingData>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            if (snapshot.hasError) {
              return ErrorStateView(
                title: 'Could not load restaurant info',
                message: '${snapshot.error}',
                onRetry: _retry,
              );
            }
            final data = snapshot.data!;
            return LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 700;
                return Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      maxWidth: isWide ? 640 : double.infinity,
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 32,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const SizedBox(height: 24),
                          _Logo(),
                          const SizedBox(height: 20),
                          Text(
                            AppConstants.appName,
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.headlineMedium
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            AppConstants.appTagline,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: AppColors.primaryRedDark,
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const _OpenStatusBadge(),
                          if (context.watch<DiningContextService>().hasDiningContext) ...[
                            const SizedBox(height: 10),
                            _TableBadge(
                              tableNumber: context
                                  .watch<DiningContextService>()
                                  .tableNumber!,
                            ),
                          ],
                          const SizedBox(height: 32),
                          ElevatedButton(
                            onPressed: () => context.go(AppRoutes.menu),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(vertical: 4),
                              child: Text(
                                'Order Now',
                                style: TextStyle(fontSize: 17),
                              ),
                            ),
                          ),
                          const SizedBox(height: 32),
                          Text(
                            'Explore the Menu',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: data.categories
                                .map(
                                  (c) => ActionChip(
                                    label: Text(c.name),
                                    onPressed: () => context.go(AppRoutes.menu),
                                    backgroundColor: AppColors.surface,
                                    side: const BorderSide(
                                      color: AppColors.border,
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                          if (data.branch != null) ...[
                            const SizedBox(height: 32),
                            const Divider(),
                            const SizedBox(height: 16),
                            Text(
                              'Restaurant Information',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            _InfoRow(
                              icon: Icons.storefront_outlined,
                              text: data.branch!.name,
                            ),
                            if (data.branch!.address != null)
                              _InfoRow(
                                icon: Icons.location_on_outlined,
                                text: data.branch!.address!,
                              ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _LandingData {
  final Branch? branch;
  final List<MenuCategory> categories;

  const _LandingData({required this.branch, required this.categories});
}

class _Logo extends StatelessWidget {
  const _Logo();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 96,
        height: 96,
        decoration: const BoxDecoration(
          color: AppColors.primaryRed,
          shape: BoxShape.circle,
        ),
        child: const Center(
          child: Icon(
            Icons.restaurant_menu,
            color: AppColors.accentYellow,
            size: 44,
          ),
        ),
      ),
    );
  }
}

/// Mock: opening status is not yet backed by real branch.opening_hours
/// logic — always shows Open. See "Backend requirements discovered".
class _OpenStatusBadge extends StatelessWidget {
  const _OpenStatusBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, size: 8, color: AppColors.success),
          SizedBox(width: 6),
          Text(
            'Open Now',
            style: TextStyle(
              color: AppColors.success,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

/// Confirms the scanned table QR was recognized — shown whenever
/// DiningContextService holds a resolved table for this session.
class _TableBadge extends StatelessWidget {
  final String tableNumber;

  const _TableBadge({required this.tableNumber});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primaryRed.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primaryRed.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.table_restaurant_outlined,
            size: 16,
            color: AppColors.primaryRedDark,
          ),
          const SizedBox(width: 6),
          Text(
            'Table $tableNumber',
            style: const TextStyle(
              color: AppColors.primaryRedDark,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoRow({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
