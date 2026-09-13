import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../data/repositories/admin_menu_repository.dart';
import '../../../../models/menu_category.dart';
import '../../../domain/menu_form_validators.dart';
import '../../widgets/admin_confirm_delete_dialog.dart';

class AdminCategoriesScreen extends StatefulWidget {
  const AdminCategoriesScreen({super.key});

  @override
  State<AdminCategoriesScreen> createState() => _AdminCategoriesScreenState();
}

class _AdminCategoriesScreenState extends State<AdminCategoriesScreen> {
  late Future<_CategoriesData> _future;
  final _searchController = TextEditingController();
  String _search = '';

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<_CategoriesData> _load() async {
    final repo = context.read<AdminMenuRepository>();
    final categories = await repo.fetchAllCategories();
    final products = await repo.fetchAllProducts();
    final counts = <String, int>{};
    for (final p in products) {
      counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
    }
    return _CategoriesData(categories: categories, productCounts: counts);
  }

  void _refresh() => setState(() {
    _future = _load();
  });

  Future<void> _openForm({MenuCategory? existing}) async {
    final repo = context.read<AdminMenuRepository>();
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => _CategoryFormDialog(existing: existing, repo: repo),
    );
    if (saved == true) _refresh();
  }

  Future<void> _delete(MenuCategory category) async {
    final confirmed = await showAdminConfirmDeleteDialog(
      context,
      title: 'Delete "${category.name}"?',
      message: 'This cannot be undone.',
    );
    if (!confirmed) return;
    if (!mounted) return;
    final repo = context.read<AdminMenuRepository>();
    try {
      await repo.deleteCategory(category.id);
      _refresh();
    } on CategoryHasProductsException catch (e) {
      if (!mounted) return;
      await showAdminDeleteBlockedDialog(
        context,
        reason:
            'This category has ${e.productCount} product'
            '${e.productCount == 1 ? '' : 's'} — delete or move them to '
            'another category first.',
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
    }
  }

  Future<void> _toggleActive(MenuCategory category, bool value) async {
    final repo = context.read<AdminMenuRepository>();
    try {
      await repo.updateCategory(
        id: category.id,
        name: category.name,
        displayOrder: category.displayOrder,
        isActive: value,
      );
      _refresh();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Update failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Categories',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
              FilledButton.icon(
                onPressed: () => _openForm(),
                icon: const Icon(Icons.add),
                label: const Text('Add Category'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: 320,
            child: TextField(
              controller: _searchController,
              decoration: const InputDecoration(
                labelText: 'Search categories',
                prefixIcon: Icon(Icons.search),
                isDense: true,
              ),
              onChanged: (v) => setState(() => _search = v.trim().toLowerCase()),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: FutureBuilder<_CategoriesData>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Failed to load categories: ${snapshot.error}'),
                        const SizedBox(height: 12),
                        OutlinedButton(
                          onPressed: _refresh,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  );
                }
                final data = snapshot.data!;
                final filtered = _search.isEmpty
                    ? data.categories
                    : data.categories
                          .where((c) => c.name.toLowerCase().contains(_search))
                          .toList();
                if (filtered.isEmpty) {
                  return const Center(child: Text('No categories found.'));
                }
                return ListView.separated(
                  itemCount: filtered.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final category = filtered[index];
                    final count = data.productCounts[category.id] ?? 0;
                    return Card(
                      child: ListTile(
                        title: Text(category.name),
                        subtitle: Text(
                          'Order: ${category.displayOrder} · '
                          '$count product${count == 1 ? '' : 's'}',
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Switch(
                              value: category.isActive,
                              onChanged: (v) => _toggleActive(category, v),
                            ),
                            IconButton(
                              icon: const Icon(Icons.edit_outlined),
                              tooltip: 'Edit',
                              onPressed: () => _openForm(existing: category),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline),
                              tooltip: 'Delete',
                              onPressed: () => _delete(category),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoriesData {
  final List<MenuCategory> categories;
  final Map<String, int> productCounts;
  const _CategoriesData({required this.categories, required this.productCounts});
}

class _CategoryFormDialog extends StatefulWidget {
  final MenuCategory? existing;
  final AdminMenuRepository repo;
  const _CategoryFormDialog({required this.existing, required this.repo});

  @override
  State<_CategoryFormDialog> createState() => _CategoryFormDialogState();
}

class _CategoryFormDialogState extends State<_CategoryFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final _nameController = TextEditingController(
    text: widget.existing?.name ?? '',
  );
  late final _orderController = TextEditingController(
    text: (widget.existing?.displayOrder ?? 0).toString(),
  );
  late bool _isActive = widget.existing?.isActive ?? true;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _orderController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final name = _nameController.text.trim();
      final order = int.parse(_orderController.text.trim());
      if (widget.existing == null) {
        await widget.repo.createCategory(
          name: name,
          displayOrder: order,
          isActive: _isActive,
        );
      } else {
        await widget.repo.updateCategory(
          id: widget.existing!.id,
          name: name,
          displayOrder: order,
          isActive: _isActive,
        );
      }
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      setState(() {
        _error = 'Save failed: $e';
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'Add Category' : 'Edit Category'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 360,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: MenuFormValidators.requiredName,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _orderController,
                decoration: const InputDecoration(labelText: 'Display order'),
                keyboardType: TextInputType.number,
                validator: MenuFormValidators.displayOrder,
              ),
              const SizedBox(height: 12),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Active'),
                value: _isActive,
                onChanged: (v) => setState(() => _isActive = v),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(
                  _error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error),
                ),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saving ? null : () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _saving ? null : _save,
          child: _saving
              ? const SizedBox(
                  height: 16,
                  width: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Save'),
        ),
      ],
    );
  }
}
