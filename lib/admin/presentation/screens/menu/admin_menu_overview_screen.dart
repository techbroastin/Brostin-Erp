import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../../data/repositories/admin_menu_repository.dart';
import '../../../core/admin_router.dart';

class AdminMenuOverviewScreen extends StatefulWidget {
  const AdminMenuOverviewScreen({super.key});

  @override
  State<AdminMenuOverviewScreen> createState() =>
      _AdminMenuOverviewScreenState();
}

class _AdminMenuOverviewScreenState extends State<AdminMenuOverviewScreen> {
  late final Future<(int, int)> _counts = _load();

  Future<(int, int)> _load() async {
    final repo = context.read<AdminMenuRepository>();
    final categories = await repo.fetchAllCategories();
    final products = await repo.fetchAllProducts();
    return (categories.length, products.length);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Menu', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          FutureBuilder<(int, int)>(
            future: _counts,
            builder: (context, snapshot) {
              final categoryCount = snapshot.data?.$1;
              final productCount = snapshot.data?.$2;
              return Wrap(
                spacing: 16,
                runSpacing: 16,
                children: [
                  _OverviewCard(
                    title: 'Categories',
                    count: categoryCount,
                    onTap: () => context.go(AdminRoutes.categories),
                  ),
                  _OverviewCard(
                    title: 'Products',
                    count: productCount,
                    onTap: () => context.go(AdminRoutes.products),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _OverviewCard extends StatelessWidget {
  final String title;
  final int? count;
  final VoidCallback onTap;

  const _OverviewCard({required this.title, required this.count, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Container(
          width: 220,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              Text(
                count?.toString() ?? '—',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              const Text('Manage →'),
            ],
          ),
        ),
      ),
    );
  }
}
