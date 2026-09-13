import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../data/repositories/admin_menu_repository.dart';
import '../../../../data/repositories/admin_storage_repository.dart';
import '../../../../models/menu_category.dart';
import '../../../../models/product.dart';
import '../../../../models/product_variant.dart';
import '../../../domain/image_validators.dart';
import '../../../domain/menu_form_validators.dart';
import '../../../domain/storage_url_utils.dart';
import '../../../services/image_picker_service.dart';
import '../../widgets/admin_confirm_delete_dialog.dart';
import '../../widgets/admin_image_field.dart';

const _menuMediaBucket = 'menu-media';

class AdminProductsScreen extends StatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  State<AdminProductsScreen> createState() => _AdminProductsScreenState();
}

class _AdminProductsScreenState extends State<AdminProductsScreen> {
  late Future<_ProductsData> _future;
  final _searchController = TextEditingController();
  String _search = '';
  String? _categoryFilter;

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

  Future<_ProductsData> _load() async {
    final repo = context.read<AdminMenuRepository>();
    final categories = await repo.fetchAllCategories();
    final products = await repo.fetchAllProducts(
      categoryId: _categoryFilter,
      searchQuery: _search.isEmpty ? null : _search,
    );
    return _ProductsData(categories: categories, products: products);
  }

  void _refresh() => setState(() {
    _future = _load();
  });

  Future<void> _openForm({Product? existing, required List<MenuCategory> categories}) async {
    final repo = context.read<AdminMenuRepository>();
    final storage = context.read<AdminStorageRepository>();
    final picker = context.read<ImagePickerService>();
    final result = await showDialog<Product>(
      context: context,
      builder: (_) => _ProductFormDialog(
        existing: existing,
        categories: categories,
        repo: repo,
        storage: storage,
        picker: picker,
      ),
    );
    // Always refresh, even on a plain Close with no saved field edits — an
    // image upload/remove inside the dialog persists immediately and the
    // list's cached Product needs to pick that up too.
    _refresh();
    if (result != null) {
      // Freshly created — reopen immediately so the owner can add variants
      // without an extra click to find the new row.
      if (existing == null && mounted) {
        await _openForm(existing: result, categories: categories);
      }
    }
  }

  Future<void> _delete(Product product) async {
    final confirmed = await showAdminConfirmDeleteDialog(
      context,
      title: 'Delete "${product.name}"?',
      message: 'This cannot be undone.',
    );
    if (!confirmed) return;
    if (!mounted) return;
    final repo = context.read<AdminMenuRepository>();
    try {
      await repo.deleteProduct(product.id);
      _refresh();
    } on ProductHasVariantsException catch (e) {
      if (!mounted) return;
      await showAdminDeleteBlockedDialog(
        context,
        reason:
            'This product has ${e.variantCount} variant'
            '${e.variantCount == 1 ? '' : 's'} — delete them first.',
      );
    } on HasOrderHistoryException {
      if (!mounted) return;
      await showAdminDeleteBlockedDialog(
        context,
        reason:
            'This product has existing orders and can\'t be deleted — '
            'mark it unavailable instead.',
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
    }
  }

  Future<void> _toggleField(
    Product product, {
    bool? isAvailable,
    bool? isFeatured,
  }) async {
    final repo = context.read<AdminMenuRepository>();
    try {
      await repo.updateProduct(
        id: product.id,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price,
        isAvailable: isAvailable ?? product.isAvailable,
        isFeatured: isFeatured ?? product.isFeatured,
        displayOrder: product.displayOrder,
        imageUrl: product.imageUrl,
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
          FutureBuilder<_ProductsData>(
            future: _future,
            builder: (context, snapshot) {
              final categories = snapshot.data?.categories ?? const [];
              return Row(
                children: [
                  Expanded(
                    child: Text(
                      'Products',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  FilledButton.icon(
                    onPressed: categories.isEmpty
                        ? null
                        : () => _openForm(categories: categories),
                    icon: const Icon(Icons.add),
                    label: const Text('Add Product'),
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              SizedBox(
                width: 320,
                child: TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    labelText: 'Search products',
                    prefixIcon: Icon(Icons.search),
                    isDense: true,
                  ),
                  onSubmitted: (v) {
                    _search = v.trim();
                    _refresh();
                  },
                ),
              ),
              const SizedBox(width: 16),
              FutureBuilder<_ProductsData>(
                future: _future,
                builder: (context, snapshot) {
                  final categories = snapshot.data?.categories ?? const [];
                  return SizedBox(
                    width: 260,
                    child: DropdownButtonFormField<String?>(
                      initialValue: _categoryFilter,
                      isDense: true,
                      decoration: const InputDecoration(labelText: 'Category'),
                      items: [
                        const DropdownMenuItem(value: null, child: Text('All categories')),
                        for (final c in categories)
                          DropdownMenuItem(value: c.id, child: Text(c.name)),
                      ],
                      onChanged: (v) {
                        _categoryFilter = v;
                        _refresh();
                      },
                    ),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: FutureBuilder<_ProductsData>(
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
                        Text('Failed to load products: ${snapshot.error}'),
                        const SizedBox(height: 12),
                        OutlinedButton(onPressed: _refresh, child: const Text('Retry')),
                      ],
                    ),
                  );
                }
                final data = snapshot.data!;
                if (data.products.isEmpty) {
                  return const Center(child: Text('No products found.'));
                }
                final categoryNameById = {
                  for (final c in data.categories) c.id: c.name,
                };
                return ListView.separated(
                  itemCount: data.products.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final product = data.products[index];
                    return Card(
                      child: ListTile(
                        title: Text(product.name),
                        subtitle: Text(
                          '${categoryNameById[product.categoryId] ?? 'Uncategorized'}'
                          ' · ₹${product.price.toStringAsFixed(2)}'
                          ' · Order: ${product.displayOrder}',
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Tooltip(
                              message: 'Available',
                              child: Switch(
                                value: product.isAvailable,
                                onChanged: (v) =>
                                    _toggleField(product, isAvailable: v),
                              ),
                            ),
                            Tooltip(
                              message: 'Featured',
                              child: IconButton(
                                icon: Icon(
                                  product.isFeatured
                                      ? Icons.star
                                      : Icons.star_border,
                                ),
                                onPressed: () => _toggleField(
                                  product,
                                  isFeatured: !product.isFeatured,
                                ),
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.edit_outlined),
                              tooltip: 'Edit',
                              onPressed: () => _openForm(
                                existing: product,
                                categories: data.categories,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline),
                              tooltip: 'Delete',
                              onPressed: () => _delete(product),
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

class _ProductsData {
  final List<MenuCategory> categories;
  final List<Product> products;
  const _ProductsData({required this.categories, required this.products});
}

class _ProductFormDialog extends StatefulWidget {
  final Product? existing;
  final List<MenuCategory> categories;
  final AdminMenuRepository repo;
  final AdminStorageRepository storage;
  final ImagePickerService picker;
  const _ProductFormDialog({
    required this.existing,
    required this.categories,
    required this.repo,
    required this.storage,
    required this.picker,
  });

  @override
  State<_ProductFormDialog> createState() => _ProductFormDialogState();
}

class _ProductFormDialogState extends State<_ProductFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final _nameController = TextEditingController(
    text: widget.existing?.name ?? '',
  );
  late final _descController = TextEditingController(
    text: widget.existing?.description ?? '',
  );
  late final _priceController = TextEditingController(
    text: widget.existing?.price.toString() ?? '',
  );
  late final _orderController = TextEditingController(
    text: (widget.existing?.displayOrder ?? 0).toString(),
  );
  late String? _categoryId =
      widget.existing?.categoryId ?? widget.categories.firstOrNull?.id;
  late bool _isAvailable = widget.existing?.isAvailable ?? true;
  late bool _isFeatured = widget.existing?.isFeatured ?? false;
  late String? _imageUrl = widget.existing?.imageUrl;
  bool _saving = false;
  String? _error;

  Future<List<ProductVariant>>? _variantsFuture;

  @override
  void initState() {
    super.initState();
    if (widget.existing != null) {
      _variantsFuture = widget.repo.fetchAllVariants(
        productId: widget.existing!.id,
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _orderController.dispose();
    super.dispose();
  }

  void _refreshVariants() {
    setState(() {
      _variantsFuture = widget.repo.fetchAllVariants(
        productId: widget.existing!.id,
      );
    });
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_categoryId == null) {
      setState(() => _error = 'Select a category');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final name = _nameController.text.trim();
      final description = _descController.text.trim();
      final price = double.parse(_priceController.text.trim());
      final order = int.parse(_orderController.text.trim());
      final Product saved;
      if (widget.existing == null) {
        saved = await widget.repo.createProduct(
          categoryId: _categoryId!,
          name: name,
          description: description.isEmpty ? null : description,
          price: price,
          isAvailable: _isAvailable,
          isFeatured: _isFeatured,
          displayOrder: order,
        );
      } else {
        saved = await widget.repo.updateProduct(
          id: widget.existing!.id,
          categoryId: _categoryId!,
          name: name,
          description: description.isEmpty ? null : description,
          price: price,
          isAvailable: _isAvailable,
          isFeatured: _isFeatured,
          displayOrder: order,
          imageUrl: _imageUrl,
        );
      }
      if (mounted) Navigator.of(context).pop(saved);
    } catch (e) {
      setState(() {
        _error = 'Save failed: $e';
        _saving = false;
      });
    }
  }

  /// Image upload/remove are independent, immediate actions (like the
  /// Available/Featured toggles in the list) — they persist using the
  /// product's last-known-good other fields rather than whatever is
  /// currently, possibly unsaved, in this dialog's text fields.
  Future<void> _uploadImage(Uint8List bytes, String fileName) async {
    final existing = widget.existing!;
    final ext = ImageValidators.extensionOf(fileName)!;
    final oldPath = storagePathFromPublicUrl(_menuMediaBucket, _imageUrl);
    if (oldPath != null) await widget.storage.deleteImage(oldPath);
    final url = await widget.storage.uploadImage(
      path: 'products/${existing.id}$ext',
      bytes: bytes,
      contentType: ImageValidators.contentTypeFor(ext),
    );
    await widget.repo.updateProduct(
      id: existing.id,
      categoryId: existing.categoryId,
      name: existing.name,
      description: existing.description,
      price: existing.price,
      isAvailable: existing.isAvailable,
      isFeatured: existing.isFeatured,
      displayOrder: existing.displayOrder,
      imageUrl: url,
    );
    setState(() => _imageUrl = url);
  }

  Future<void> _removeImage() async {
    final existing = widget.existing!;
    final oldPath = storagePathFromPublicUrl(_menuMediaBucket, _imageUrl);
    if (oldPath != null) await widget.storage.deleteImage(oldPath);
    await widget.repo.updateProduct(
      id: existing.id,
      categoryId: existing.categoryId,
      name: existing.name,
      description: existing.description,
      price: existing.price,
      isAvailable: existing.isAvailable,
      isFeatured: existing.isFeatured,
      displayOrder: existing.displayOrder,
      imageUrl: null,
    );
    setState(() => _imageUrl = null);
  }

  Future<void> _addOrEditVariant({ProductVariant? existing}) async {
    final saved = await showDialog<bool>(
      context: context,
      builder: (_) => _VariantFormDialog(
        productId: widget.existing!.id,
        existing: existing,
        repo: widget.repo,
      ),
    );
    if (saved == true) _refreshVariants();
  }

  Future<void> _deleteVariant(ProductVariant variant) async {
    final confirmed = await showAdminConfirmDeleteDialog(
      context,
      title: 'Delete "${variant.name}"?',
      message: 'This cannot be undone.',
    );
    if (!confirmed) return;
    try {
      await widget.repo.deleteVariant(variant.id);
      _refreshVariants();
    } on HasOrderHistoryException {
      if (!mounted) return;
      await showAdminDeleteBlockedDialog(
        context,
        reason:
            'This variant has existing orders and can\'t be deleted — '
            'mark it unavailable instead.',
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.existing == null ? 'Add Product' : 'Edit Product'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 420,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Name'),
                  validator: MenuFormValidators.requiredName,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _descController,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String?>(
                  initialValue: _categoryId,
                  decoration: const InputDecoration(labelText: 'Category'),
                  items: [
                    for (final c in widget.categories)
                      DropdownMenuItem(value: c.id, child: Text(c.name)),
                  ],
                  onChanged: (v) => setState(() => _categoryId = v),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _priceController,
                        decoration: const InputDecoration(
                          labelText: 'Price',
                          prefixText: '₹',
                        ),
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                        validator: MenuFormValidators.price,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _orderController,
                        decoration: const InputDecoration(
                          labelText: 'Display order',
                        ),
                        keyboardType: TextInputType.number,
                        validator: MenuFormValidators.displayOrder,
                      ),
                    ),
                  ],
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Available'),
                  value: _isAvailable,
                  onChanged: (v) => setState(() => _isAvailable = v),
                ),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Featured'),
                  value: _isFeatured,
                  onChanged: (v) => setState(() => _isFeatured = v),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ],
                if (widget.existing != null) ...[
                  const Divider(height: 32),
                  Text(
                    'Product photo',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 8),
                  AdminImageField(
                    imageUrl: _imageUrl,
                    fallbackIcon: Icons.fastfood_outlined,
                    picker: widget.picker,
                    onUpload: _uploadImage,
                    onRemove: _removeImage,
                  ),
                  const Divider(height: 32),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Variants',
                          style: Theme.of(context).textTheme.titleSmall,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => _addOrEditVariant(),
                        icon: const Icon(Icons.add, size: 18),
                        label: const Text('Add variant'),
                      ),
                    ],
                  ),
                  FutureBuilder<List<ProductVariant>>(
                    future: _variantsFuture,
                    builder: (context, snapshot) {
                      if (snapshot.connectionState == ConnectionState.waiting) {
                        return const Padding(
                          padding: EdgeInsets.all(8),
                          child: LinearProgressIndicator(),
                        );
                      }
                      if (snapshot.hasError) {
                        return Text('Failed to load variants: ${snapshot.error}');
                      }
                      final variants = snapshot.data ?? const [];
                      if (variants.isEmpty) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8),
                          child: Text('No variants — sold at the price above.'),
                        );
                      }
                      return Column(
                        children: [
                          for (final v in variants)
                            ListTile(
                              contentPadding: EdgeInsets.zero,
                              dense: true,
                              title: Text(
                                '${v.name}${v.isDefault ? ' (default)' : ''}',
                              ),
                              subtitle: Text(
                                '₹${v.price.toStringAsFixed(2)} · '
                                '${v.isAvailable ? 'Available' : 'Unavailable'}',
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit_outlined, size: 20),
                                    onPressed: () =>
                                        _addOrEditVariant(existing: v),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete_outline, size: 20),
                                    onPressed: () => _deleteVariant(v),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _saving ? null : () => Navigator.of(context).pop(),
          child: const Text('Close'),
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

class _VariantFormDialog extends StatefulWidget {
  final String productId;
  final ProductVariant? existing;
  final AdminMenuRepository repo;
  const _VariantFormDialog({
    required this.productId,
    required this.existing,
    required this.repo,
  });

  @override
  State<_VariantFormDialog> createState() => _VariantFormDialogState();
}

class _VariantFormDialogState extends State<_VariantFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late final _nameController = TextEditingController(
    text: widget.existing?.name ?? '',
  );
  late final _priceController = TextEditingController(
    text: widget.existing?.price.toString() ?? '',
  );
  late final _orderController = TextEditingController(
    text: (widget.existing?.displayOrder ?? 0).toString(),
  );
  late bool _isDefault = widget.existing?.isDefault ?? false;
  late bool _isAvailable = widget.existing?.isAvailable ?? true;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
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
      final price = double.parse(_priceController.text.trim());
      final order = int.parse(_orderController.text.trim());
      if (widget.existing == null) {
        await widget.repo.createVariant(
          productId: widget.productId,
          name: name,
          price: price,
          isDefault: _isDefault,
          isAvailable: _isAvailable,
          displayOrder: order,
        );
      } else {
        await widget.repo.updateVariant(
          id: widget.existing!.id,
          name: name,
          price: price,
          isDefault: _isDefault,
          isAvailable: _isAvailable,
          displayOrder: order,
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
      title: Text(widget.existing == null ? 'Add Variant' : 'Edit Variant'),
      content: Form(
        key: _formKey,
        child: SizedBox(
          width: 340,
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
                controller: _priceController,
                decoration: const InputDecoration(
                  labelText: 'Price',
                  prefixText: '₹',
                ),
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: MenuFormValidators.price,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _orderController,
                decoration: const InputDecoration(labelText: 'Display order'),
                keyboardType: TextInputType.number,
                validator: MenuFormValidators.displayOrder,
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Default variant'),
                value: _isDefault,
                onChanged: (v) => setState(() => _isDefault = v),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Available'),
                value: _isAvailable,
                onChanged: (v) => setState(() => _isAvailable = v),
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
