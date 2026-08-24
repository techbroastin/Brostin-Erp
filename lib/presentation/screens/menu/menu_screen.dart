import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../data/repositories/menu_repository.dart';
import '../../../models/menu_category.dart';
import '../../../models/product.dart';
import '../../../models/product_variant.dart';
import '../../../services/cart_service.dart';
import '../../widgets/cart_bar.dart';
import '../../widgets/category_nav.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/loading_view.dart';
import '../../widgets/product_card.dart';

/// Screen 2 — Menu. Categories and products load from [MenuRepository] —
/// backed by mock data in the UI/UX phase, Supabase later, with no changes
/// needed here when that swap happens.
class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  late Future<_MenuData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_MenuData> _load() async {
    final repo = context.read<MenuRepository>();
    final categories = await repo.fetchCategories();
    return _MenuData(categories: categories, repo: repo);
  }

  void _retry() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartService>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Menu'),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined),
            onPressed: () => context.push(AppRoutes.cart),
            tooltip: 'Cart',
          ),
        ],
      ),
      body: FutureBuilder<_MenuData>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView(message: 'Loading menu…');
          }
          if (snapshot.hasError) {
            return ErrorStateView(
              title: 'Could not load the menu',
              message: '${snapshot.error}',
              onRetry: _retry,
            );
          }
          final data = snapshot.data!;
          if (data.categories.isEmpty) {
            return const EmptyStateView(
              icon: Icons.restaurant_menu,
              title: 'Menu is not available right now',
              message: 'Please check back shortly.',
            );
          }
          return _MenuBody(categories: data.categories, repo: data.repo);
        },
      ),
      bottomNavigationBar: cart.isEmpty
          ? null
          : Padding(
              padding: const EdgeInsets.only(top: 8),
              child: CartBar(cart: cart, onTap: () => context.push(AppRoutes.cart)),
            ),
    );
  }
}

class _MenuData {
  final List<MenuCategory> categories;
  final MenuRepository repo;

  const _MenuData({required this.categories, required this.repo});
}

class _MenuBody extends StatefulWidget {
  final List<MenuCategory> categories;
  final MenuRepository repo;

  const _MenuBody({required this.categories, required this.repo});

  @override
  State<_MenuBody> createState() => _MenuBodyState();
}

class _MenuBodyState extends State<_MenuBody> {
  late String _selectedCategoryId;
  late Future<List<Product>> _productsFuture;

  @override
  void initState() {
    super.initState();
    _selectedCategoryId = widget.categories.first.id;
    // Deferred to after the first frame rather than kicked off inline here —
    // starting the (timer-based) mock fetch mid-build occasionally left the
    // FutureBuilder waiting indefinitely on web until some other user
    // interaction forced a rebuild. Scheduling it once the widget tree has
    // actually settled avoids that.
    _productsFuture = _fetchAfterFirstFrame(_selectedCategoryId);
  }

  Future<List<Product>> _fetchAfterFirstFrame(String categoryId) async {
    await WidgetsBinding.instance.endOfFrame;
    return widget.repo.fetchProducts(categoryId: categoryId);
  }

  void _selectCategory(String categoryId) {
    setState(() {
      _selectedCategoryId = categoryId;
      _productsFuture = widget.repo.fetchProducts(categoryId: categoryId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 12),
        CategoryNav(
          categories: widget.categories,
          selectedCategoryId: _selectedCategoryId,
          onSelected: _selectCategory,
        ),
        const SizedBox(height: 12),
        Expanded(
          child: FutureBuilder<List<Product>>(
            future: _productsFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const LoadingView();
              }
              if (snapshot.hasError) {
                return ErrorStateView(title: 'Could not load items', message: '${snapshot.error}');
              }
              final products = snapshot.data!;
              if (products.isEmpty) {
                return const EmptyStateView(
                  icon: Icons.no_food_outlined,
                  title: 'No items in this category yet',
                );
              }
              return LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 700;
                  return ListView.separated(
                    padding: EdgeInsets.symmetric(
                      horizontal: isWide ? (constraints.maxWidth - 640) / 2 + 16 : 16,
                      vertical: 8,
                    ),
                    itemCount: products.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      return FutureBuilder<List<ProductVariant>>(
                        future: widget.repo.fetchVariants(productId: product.id),
                        builder: (context, variantSnapshot) {
                          final hasVariants = (variantSnapshot.data ?? const []).isNotEmpty;
                          return ProductCard(
                            product: product,
                            hasVariants: hasVariants,
                            onTap: () => context.push(AppRoutes.productDetails(product.id)),
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
