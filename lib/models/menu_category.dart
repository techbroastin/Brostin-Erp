class MenuCategory {
  final String id;
  final String? branchId;
  final String name;
  final int displayOrder;
  final bool isActive;

  const MenuCategory({
    required this.id,
    this.branchId,
    required this.name,
    required this.displayOrder,
    required this.isActive,
  });

  factory MenuCategory.fromJson(Map<String, dynamic> json) => MenuCategory(
    id: json['id'] as String,
    branchId: json['branch_id'] as String?,
    name: json['name'] as String,
    displayOrder: json['display_order'] as int,
    isActive: json['is_active'] as bool,
  );
}
