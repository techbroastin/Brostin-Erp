import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/menu_repository.dart';
import '../../../models/product.dart';
import '../../../models/product_variant.dart';
import '../../../services/cart_service.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/loading_view.dart';
import '../../widgets/price_text.dart';
import '../../widgets/quantity_stepper.dart';

/// Screen 3 — Product Details, with variant selection when the product has
/// size/meal options (Solo/Meal, Quarter/Half/Full etc).
class ProductDetailsScreen extends StatefulWidget {
  final String productId;

  const ProductDetailsScreen({super.key, required this.productId});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  late Future<({Product product, List<ProductVariant> variants})> _future;
  ProductVariant? _selectedVariant;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<({Product product, List<ProductVariant> variants})> _load() async {
    final repo = context.read<MenuRepository>();
    final product = await repo.fetchProduct(widget.productId);
    final variants = await repo.fetchVariants(productId: widget.productId);
    if (variants.isNotEmpty) {
      _selectedVariant = variants.firstWhere((v) => v.isDefault, orElse: () => variants.first);
    }
    return (product: product, variants: variants);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Item Details')),
      body: FutureBuilder(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorStateView(title: 'Could not load this item', message: '${snapshot.error}');
          }
          final data = snapshot.data!;
          return _Body(
            product: data.product,
            variants: data.variants,
            selectedVariant: _selectedVariant,
            quantity: _quantity,
            onVariantSelected: (v) => setState(() => _selectedVariant = v),
            onQuantityChanged: (q) => setState(() => _quantity = q),
            onAddToCart: () {
              context.read<CartService>().addProduct(
                    data.product,
                    variant: _selectedVariant,
                    quantity: _quantity,
                  );
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('${data.product.name} added to cart')),
              );
              context.pop();
            },
          );
        },
      ),
    );
  }
}

class _Body extends StatelessWidget {
  final Product product;
  final List<ProductVariant> variants;
  final ProductVariant? selectedVariant;
  final int quantity;
  final ValueChanged<ProductVariant> onVariantSelected;
  final ValueChanged<int> onQuantityChanged;
  final VoidCallback onAddToCart;

  const _Body({
    required this.product,
    required this.variants,
    required this.selectedVariant,
    required this.quantity,
    required this.onVariantSelected,
    required this.onQuantityChanged,
    required this.onAddToCart,
  });

  double get _unitPrice => selectedVariant?.price ?? product.price;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                AspectRatio(
                  aspectRatio: 16 / 10,
                  child: product.imageUrl == null
                      ? ColoredBox(
                          color: AppColors.accentYellow.withValues(alpha: 0.18),
                          child: const Center(
                            child: Icon(Icons.restaurant, color: AppColors.primaryRed, size: 64),
                          ),
                        )
                      : Image.network(product.imageUrl!, fit: BoxFit.cover),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.name, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 8),
                      if (product.description != null)
                        Text(
                          product.description!,
                          style: const TextStyle(color: AppColors.textSecondary),
                        ),
                      const SizedBox(height: 16),
                      PriceText(
                        _unitPrice,
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: AppColors.primaryRedDark,
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      if (variants.isNotEmpty) ...[
                        const SizedBox(height: 24),
                        Text('Choose an option', style: Theme.of(context).textTheme.titleMedium),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: variants.map((variant) {
                            final selected = variant.id == selectedVariant?.id;
                            return ChoiceChip(
                              label: Text('${variant.name} · ${formatPrice(variant.price)}'),
                              selected: selected,
                              onSelected: (_) => onVariantSelected(variant),
                              showCheckmark: false,
                              selectedColor: AppColors.primaryRed,
                              labelStyle: TextStyle(
                                color: selected ? Colors.white : AppColors.textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                              side: BorderSide(color: selected ? AppColors.primaryRed : AppColors.border),
                            );
                          }).toList(),
                        ),
                      ],
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          Text('Quantity', style: Theme.of(context).textTheme.titleMedium),
                          const Spacer(),
                          QuantityStepper(quantity: quantity, onChanged: onQuantityChanged),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
              ),
            ),
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: ElevatedButton(
              onPressed: onAddToCart,
              child: Text('Add to Cart · ${formatPrice(_unitPrice * quantity)}'),
            ),
          ),
        ),
      ],
    );
  }
}
