import '../core/constants/app_constants.dart';
import '../models/branch.dart';
import '../models/menu_category.dart';
import '../models/product.dart';
import '../models/product_variant.dart';
import '../models/restaurant.dart';

/// In-memory mirror of supabase/seed.sql — the same approved provisional
/// menu (8 categories, 25 products, 15 variants), same ids where it matters
/// for FK-shaped relationships. Kept in exact sync with the SQL seed so the
/// UI phase and the eventual Supabase-backed phase render identical menus.
class MockMenuData {
  MockMenuData._();

  static const restaurant = Restaurant(
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Broastin Fried Chicken',
    tagline: 'Fresh • Crunchy • Juicy',
  );

  static const branch = Branch(
    id: AppConstants.singleBranchId,
    restaurantId: '11111111-1111-4111-8111-111111111111',
    name: 'Broastin — Main Branch',
    address: 'Demo address — to be replaced with the real outlet address',
    isActive: true,
  );

  static const categories = <MenuCategory>[
    MenuCategory(
      id: 'cat-01',
      branchId: branchId,
      name: 'Signature Broasted Chicken',
      displayOrder: 1,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-02',
      branchId: branchId,
      name: 'Crispy Chicken Burgers',
      displayOrder: 2,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-03',
      branchId: branchId,
      name: 'Crunchy Wraps & Twisters',
      displayOrder: 3,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-04',
      branchId: branchId,
      name: 'Boneless Strips & Bites',
      displayOrder: 4,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-05',
      branchId: branchId,
      name: 'Smoky Arabian Alfaham',
      displayOrder: 5,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-06',
      branchId: branchId,
      name: 'Sharing Feasts & Buckets',
      displayOrder: 6,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-07',
      branchId: branchId,
      name: 'Add-ons',
      displayOrder: 7,
      isActive: true,
    ),
    MenuCategory(
      id: 'cat-08',
      branchId: branchId,
      name: 'Beverages',
      displayOrder: 8,
      isActive: true,
    ),
  ];

  static const branchId = AppConstants.singleBranchId;

  static const products = <Product>[
    // Signature Broasted Chicken
    Product(
      id: 'prod-01',
      categoryId: 'cat-01',
      name: 'Single Piece Broast',
      description: 'Demo item.',
      price: 89,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-02',
      categoryId: 'cat-01',
      name: 'Duo Crunch Box',
      description: 'Demo item.',
      price: 239,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-03',
      categoryId: 'cat-01',
      name: 'Broaster 4-Piece Box',
      description: 'Demo item.',
      price: 439,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),

    // Crispy Chicken Burgers (variants: Solo/Meal)
    Product(
      id: 'prod-04',
      categoryId: 'cat-02',
      name: 'The Big Broaster Burger',
      description: 'Demo item.',
      price: 149,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-05',
      categoryId: 'cat-02',
      name: 'Cheesy Broast Burger',
      description: 'Demo item.',
      price: 169,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-06',
      categoryId: 'cat-02',
      name: 'Monster Crunch Double Burger',
      description: 'Demo item.',
      price: 219,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),

    // Crunchy Wraps & Twisters (variants: Solo/Meal)
    Product(
      id: 'prod-07',
      categoryId: 'cat-03',
      name: 'Classic Crunch Wrap',
      description: 'Demo item.',
      price: 139,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-08',
      categoryId: 'cat-03',
      name: 'Cheesy Twister Wrap',
      description: 'Demo item.',
      price: 169,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-09',
      categoryId: 'cat-03',
      name: 'Peri-Peri Spicy Wrap',
      description: 'Demo item.',
      price: 149,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),

    // Boneless Strips & Bites
    Product(
      id: 'prod-10',
      categoryId: 'cat-04',
      name: 'Crispy Tenders 3 pcs',
      description: 'Demo item.',
      price: 119,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-11',
      categoryId: 'cat-04',
      name: 'Boneless Crunch Box 4 pcs',
      description: 'Demo item.',
      price: 219,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-12',
      categoryId: 'cat-04',
      name: 'Dynamite Boneless Strips 6 pcs',
      description: 'Demo item.',
      price: 299,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),

    // Smoky Arabian Alfaham (variants: Quarter/Half/Full)
    Product(
      id: 'prod-13',
      categoryId: 'cat-05',
      name: 'Smoky Arabian Alfaham',
      description: 'Demo item.',
      price: 199,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),

    // Sharing Feasts & Buckets
    Product(
      id: 'prod-14',
      categoryId: 'cat-06',
      name: 'Coal & Crunch Duo',
      description: 'Demo item.',
      price: 399,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-15',
      categoryId: 'cat-06',
      name: 'Family Bucket 8 pcs',
      description: 'Demo item.',
      price: 849,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-16',
      categoryId: 'cat-06',
      name: 'Mega Party Platter 12 pcs',
      description: 'Demo item.',
      price: 1249,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),

    // Add-ons
    Product(
      id: 'prod-17',
      categoryId: 'cat-07',
      name: 'French Fries',
      description: 'Demo item.',
      price: 79,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-18',
      categoryId: 'cat-07',
      name: 'Peri-Peri French Fries',
      description: 'Demo item.',
      price: 99,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-19',
      categoryId: 'cat-07',
      name: 'Cheesy Lava Dip',
      description: 'Demo item.',
      price: 30,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),
    Product(
      id: 'prod-20',
      categoryId: 'cat-07',
      name: 'Signature Garlic Mayo/Toum',
      description: 'Demo item.',
      price: 20,
      isAvailable: true,
      displayOrder: 4,
      isDemo: true,
    ),
    Product(
      id: 'prod-21',
      categoryId: 'cat-07',
      name: 'Extra Dinner Bun',
      description: 'Demo item.',
      price: 15,
      isAvailable: true,
      displayOrder: 5,
      isDemo: true,
    ),
    Product(
      id: 'prod-22',
      categoryId: 'cat-07',
      name: 'Extra Kuboo(s)',
      description: 'Demo item.',
      price: 10,
      isAvailable: true,
      displayOrder: 6,
      isDemo: true,
    ),

    // Beverages
    Product(
      id: 'prod-23',
      categoryId: 'cat-08',
      name: 'Soft Drink 250ml',
      description: 'Demo item.',
      price: 35,
      isAvailable: true,
      displayOrder: 1,
      isDemo: true,
    ),
    Product(
      id: 'prod-24',
      categoryId: 'cat-08',
      name: 'Fresh Lime Juice',
      description: 'Demo item.',
      price: 40,
      isAvailable: true,
      displayOrder: 2,
      isDemo: true,
    ),
    Product(
      id: 'prod-25',
      categoryId: 'cat-08',
      name: 'Blue Curacao/Mint Mojito',
      description: 'Demo item.',
      price: 89,
      isAvailable: true,
      displayOrder: 3,
      isDemo: true,
    ),
  ];

  static const variants = <ProductVariant>[
    ProductVariant(
      id: 'var-04-solo',
      productId: 'prod-04',
      name: 'Solo',
      price: 149,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-04-meal',
      productId: 'prod-04',
      name: 'Meal',
      price: 229,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-05-solo',
      productId: 'prod-05',
      name: 'Solo',
      price: 169,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-05-meal',
      productId: 'prod-05',
      name: 'Meal',
      price: 249,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-06-solo',
      productId: 'prod-06',
      name: 'Solo',
      price: 219,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-06-meal',
      productId: 'prod-06',
      name: 'Meal',
      price: 299,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),

    ProductVariant(
      id: 'var-07-solo',
      productId: 'prod-07',
      name: 'Solo',
      price: 139,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-07-meal',
      productId: 'prod-07',
      name: 'Meal',
      price: 219,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-08-solo',
      productId: 'prod-08',
      name: 'Solo',
      price: 169,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-08-meal',
      productId: 'prod-08',
      name: 'Meal',
      price: 259,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-09-solo',
      productId: 'prod-09',
      name: 'Solo',
      price: 149,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-09-meal',
      productId: 'prod-09',
      name: 'Meal',
      price: 229,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),

    ProductVariant(
      id: 'var-13-quarter',
      productId: 'prod-13',
      name: 'Quarter',
      price: 199,
      isDefault: true,
      displayOrder: 1,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-13-half',
      productId: 'prod-13',
      name: 'Half',
      price: 360,
      isDefault: false,
      displayOrder: 2,
      isAvailable: true,
    ),
    ProductVariant(
      id: 'var-13-full',
      productId: 'prod-13',
      name: 'Full',
      price: 690,
      isDefault: false,
      displayOrder: 3,
      isAvailable: true,
    ),
  ];

  static List<Product> productsForCategory(String categoryId) =>
      products
          .where((p) => p.categoryId == categoryId && p.isAvailable)
          .toList()
        ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

  static List<ProductVariant> variantsForProduct(String productId) =>
      variants.where((v) => v.productId == productId && v.isAvailable).toList()
        ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

  static Product productById(String productId) =>
      products.firstWhere((p) => p.id == productId);
}
