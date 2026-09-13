import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/menu_repository.dart';
import '../../../models/branch.dart';
import '../../../models/menu_category.dart';
import '../../../models/product.dart';
import '../../../models/product_variant.dart';
import '../../../services/cart_service.dart';
import '../../../services/dining_context_service.dart';
import '../../widgets/cart_bar.dart';
import '../../widgets/category_nav.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/food_image.dart';
import '../../widgets/loading_view.dart';
import '../../widgets/product_card.dart';

/// Screen 2 — Menu. Categories/branch load from [MenuRepository] — backed
/// by mock data or Supabase depending on main.dart's wiring, no changes
/// needed here when that swap happens.
class MenuScreen extends StatefulWidget {
  const MenuScreen({super.key});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  late Future<_MenuData> _future;
  final _searchController = TextEditingController();
  Timer? _debounce;
  String _searchQuery = '';
  Future<List<Product>>? _searchFuture;

  String? _selectedCategoryId;
  Future<List<Product>>? _productsFuture;
  Future<List<Product>>? _featuredFuture;
  final Map<String, Future<List<ProductVariant>>> _variantsCache = {};

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<_MenuData> _load() async {
    final repo = context.read<MenuRepository>();
    final branchesFuture = repo.fetchActiveBranches();
    final categoriesFuture = repo.fetchCategories();
    final branches = await branchesFuture;
    final categories = await categoriesFuture;
    final selectedCategoryId =
        categories.isNotEmpty ? categories.first.id : null;
    return _MenuData(
      branch: branches.isNotEmpty ? branches.first : null,
      categories: categories,
      repo: repo,
      selectedCategoryId: selectedCategoryId,
      productsFuture: selectedCategoryId == null
          ? null
          : repo.fetchProducts(categoryId: selectedCategoryId),
      featuredFuture: categories.isEmpty ? null : repo.fetchFeaturedProducts(),
    );
  }

  void _retry() {
    setState(() {
      _future = _load();
    });
  }

  Future<List<ProductVariant>> _variantsFor(MenuRepository repo, String productId) =>
      _variantsCache.putIfAbsent(
        productId,
        () => repo.fetchVariants(productId: productId),
      );

  void _selectCategory(MenuRepository repo, String categoryId) {
    setState(() {
      _selectedCategoryId = categoryId;
      _productsFuture = repo.fetchProducts(categoryId: categoryId);
    });
  }

  void _onSearchChanged(MenuRepository repo, String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() {
        _searchQuery = value.trim();
        _searchFuture = _searchQuery.isEmpty
            ? null
            : repo.searchProducts(_searchQuery);
      });
    });
  }

  void _clearSearch() {
    _debounce?.cancel();
    _searchController.clear();
    setState(() {
      _searchQuery = '';
      _searchFuture = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartService>();
    final dining = context.watch<DiningContextService>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: FutureBuilder<_MenuData>(
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
              return Column(
                children: [
                  _MenuHeader(
                    branch: data.branch,
                    dining: dining,
                    searchController: _searchController,
                    onSearchChanged: (v) => _onSearchChanged(data.repo, v),
                    onSearchClear: _clearSearch,
                    categoryNav: null,
                  ),
                  const Expanded(
                    child: EmptyStateView(
                      icon: Icons.restaurant_menu,
                      title: 'Menu is not available right now',
                      message: 'Please check back shortly.',
                    ),
                  ),
                ],
              );
            }

            _selectedCategoryId ??= data.selectedCategoryId;
            _productsFuture ??= data.productsFuture;
            _featuredFuture ??= data.featuredFuture;
            final categoryNameById = {
              for (final c in data.categories) c.id: c.name,
            };

            return Column(
              children: [
                _MenuHeader(
                  branch: data.branch,
                  dining: dining,
                  searchController: _searchController,
                  onSearchChanged: (v) => _onSearchChanged(data.repo, v),
                  onSearchClear: _clearSearch,
                  categoryNav: _searchQuery.isNotEmpty
                      ? null
                      : CategoryNav(
                          categories: data.categories,
                          selectedCategoryId: _selectedCategoryId!,
                          onSelected: (id) => _selectCategory(data.repo, id),
                        ),
                ),
                Expanded(
                  child: _searchQuery.isNotEmpty
                      ? _SearchResults(
                          future: _searchFuture!,
                          query: _searchQuery,
                          categoryNameById: categoryNameById,
                          variantsFor: (id) => _variantsFor(data.repo, id),
                        )
                      : _CatalogBody(
                          featuredFuture: _featuredFuture!,
                          featuredCategoryName: data.categories.first.name,
                          productsFuture: _productsFuture!,
                          categoryName: categoryNameById[_selectedCategoryId],
                          variantsFor: (id) => _variantsFor(data.repo, id),
                        ),
                ),
              ],
            );
          },
        ),
      ),
      bottomNavigationBar: cart.isEmpty
          ? null
          : Padding(
              padding: const EdgeInsets.only(top: 8),
              child: CartBar(
                cart: cart,
                onTap: () => context.push(AppRoutes.cart),
              ),
            ),
    );
  }
}

class _MenuData {
  final Branch? branch;
  final List<MenuCategory> categories;
  final MenuRepository repo;
  final String? selectedCategoryId;
  final Future<List<Product>>? productsFuture;
  final Future<List<Product>>? featuredFuture;

  const _MenuData({
    required this.branch,
    required this.categories,
    required this.repo,
    required this.selectedCategoryId,
    required this.productsFuture,
    required this.featuredFuture,
  });
}

/// Dark brand header — logo/name, branch + dining context, search, and (via
/// [categoryNav]) the category strip. All on [AppColors.charcoal] per the
/// reference poster's black-background/red-yellow-accent direction; the
/// rest of the screen stays on the app's usual light background.
class _MenuHeader extends StatelessWidget {
  final Branch? branch;
  final DiningContextService dining;
  final TextEditingController searchController;
  final ValueChanged<String> onSearchChanged;
  final VoidCallback onSearchClear;
  final Widget? categoryNav;

  const _MenuHeader({
    required this.branch,
    required this.dining,
    required this.searchController,
    required this.onSearchChanged,
    required this.onSearchClear,
    required this.categoryNav,
  });

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(color: AppColors.charcoal),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryRed,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.restaurant_menu,
                    color: AppColors.accentYellow,
                    size: 18,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Broastin',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 17,
                          height: 1.1,
                        ),
                      ),
                      if (branch != null)
                        Text(
                          branch!.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 11.5,
                          ),
                        ),
                    ],
                  ),
                ),
                if (dining.hasDiningContext) ...[
                  _HeaderPill(
                    icon: Icons.table_restaurant_outlined,
                    label: 'Table ${dining.tableNumber}',
                  ),
                  const SizedBox(width: 8),
                ],
                _HeaderIconButton(
                  icon: Icons.person_outline,
                  tooltip: 'Profile',
                  onPressed: () => context.push(AppRoutes.profile),
                ),
                const SizedBox(width: 4),
                _HeaderIconButton(
                  icon: Icons.shopping_cart_outlined,
                  tooltip: 'Cart',
                  onPressed: () => context.push(AppRoutes.cart),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: searchController,
              onChanged: onSearchChanged,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14.5),
              decoration: InputDecoration(
                isDense: true,
                filled: true,
                fillColor: Colors.white,
                hintText: 'Search burgers, wraps, drinks…',
                hintStyle: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
                prefixIcon: const Icon(
                  Icons.search,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
                suffixIcon: ValueListenableBuilder<TextEditingValue>(
                  valueListenable: searchController,
                  builder: (context, value, _) => value.text.isEmpty
                      ? const SizedBox.shrink()
                      : IconButton(
                          icon: const Icon(
                            Icons.close,
                            color: AppColors.textSecondary,
                            size: 18,
                          ),
                          onPressed: onSearchClear,
                        ),
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
            if (categoryNav != null) ...[
              const SizedBox(height: 12),
              categoryNav!,
            ],
          ],
        ),
      ),
    );
  }
}

class _HeaderPill extends StatelessWidget {
  final IconData icon;
  final String label;

  const _HeaderPill({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.accentYellow.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.accentYellow.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.accentYellow),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.accentYellow,
              fontWeight: FontWeight.w700,
              fontSize: 11.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _HeaderIconButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  const _HeaderIconButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, color: Colors.white, size: 22),
      tooltip: tooltip,
      onPressed: onPressed,
      visualDensity: VisualDensity.compact,
    );
  }
}

/// Featured strip + the selected category's product list, on the light
/// background below the dark header.
class _CatalogBody extends StatelessWidget {
  final Future<List<Product>> featuredFuture;
  final String? featuredCategoryName;
  final Future<List<Product>> productsFuture;
  final String? categoryName;
  final Future<List<ProductVariant>> Function(String productId) variantsFor;

  const _CatalogBody({
    required this.featuredFuture,
    required this.featuredCategoryName,
    required this.productsFuture,
    required this.categoryName,
    required this.variantsFor,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 700;
        final hPad = isWide ? (constraints.maxWidth - 640) / 2 + 16 : 16.0;
        return ListView(
          padding: EdgeInsets.symmetric(vertical: 14),
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: hPad),
              child: Text(
                'Popular Picks',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 168,
              child: FutureBuilder<List<Product>>(
                future: featuredFuture,
                builder: (context, snapshot) {
                  final items = snapshot.data ?? const [];
                  if (items.isEmpty) return const SizedBox.shrink();
                  return ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: EdgeInsets.symmetric(horizontal: hPad),
                    itemCount: items.length > 4 ? 4 : items.length,
                    separatorBuilder: (_, _) => const SizedBox(width: 12),
                    itemBuilder: (context, index) => _FeaturedCard(
                      product: items[index],
                      categoryName: featuredCategoryName,
                      onTap: () => context.push(
                        AppRoutes.productDetails(items[index].id),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: hPad),
              child: Text(
                categoryName ?? 'Menu',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 10),
            FutureBuilder<List<Product>>(
              future: productsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                if (snapshot.hasError) {
                  return ErrorStateView(
                    title: 'Could not load items',
                    message: '${snapshot.error}',
                  );
                }
                final products = snapshot.data!;
                if (products.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: EmptyStateView(
                      icon: Icons.no_food_outlined,
                      title: 'No items in this category yet',
                    ),
                  );
                }
                return Padding(
                  padding: EdgeInsets.symmetric(horizontal: hPad),
                  child: Column(
                    children: [
                      for (final product in products) ...[
                        FutureBuilder<List<ProductVariant>>(
                          future: variantsFor(product.id),
                          builder: (context, variantSnapshot) {
                            final hasVariants =
                                (variantSnapshot.data ?? const []).isNotEmpty;
                            return ProductCard(
                              product: product,
                              hasVariants: hasVariants,
                              categoryName: categoryName,
                              onTap: () => context.push(
                                AppRoutes.productDetails(product.id),
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 10),
                      ],
                    ],
                  ),
                );
              },
            ),
          ],
        );
      },
    );
  }
}

class _SearchResults extends StatelessWidget {
  final Future<List<Product>> future;
  final String query;
  final Map<String, String> categoryNameById;
  final Future<List<ProductVariant>> Function(String productId) variantsFor;

  const _SearchResults({
    required this.future,
    required this.query,
    required this.categoryNameById,
    required this.variantsFor,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isWide = constraints.maxWidth > 700;
        final hPad = isWide ? (constraints.maxWidth - 640) / 2 + 16 : 16.0;
        return FutureBuilder<List<Product>>(
          future: future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const LoadingView();
            }
            if (snapshot.hasError) {
              return ErrorStateView(
                title: 'Search failed',
                message: '${snapshot.error}',
              );
            }
            final results = snapshot.data!;
            if (results.isEmpty) {
              return EmptyStateView(
                icon: Icons.search_off,
                title: 'No dishes match "$query"',
                message: 'Try a different name, like "burger" or "wrap".',
              );
            }
            return ListView.separated(
              padding: EdgeInsets.symmetric(horizontal: hPad, vertical: 14),
              itemCount: results.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final product = results[index];
                return FutureBuilder<List<ProductVariant>>(
                  future: variantsFor(product.id),
                  builder: (context, variantSnapshot) {
                    final hasVariants =
                        (variantSnapshot.data ?? const []).isNotEmpty;
                    return ProductCard(
                      product: product,
                      hasVariants: hasVariants,
                      categoryName: categoryNameById[product.categoryId],
                      onTap: () =>
                          context.push(AppRoutes.productDetails(product.id)),
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  }
}

class _FeaturedCard extends StatelessWidget {
  final Product product;
  final String? categoryName;
  final VoidCallback onTap;

  const _FeaturedCard({
    required this.product,
    required this.categoryName,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 148,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 96,
                width: double.infinity,
                child: FoodImageBox(
                  imageUrl: product.imageUrl,
                  categoryName: categoryName,
                  productName: product.name,
                  iconSize: 34,
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '₹${product.price.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryRedDark,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
