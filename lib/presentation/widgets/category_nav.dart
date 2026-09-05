import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/menu_category.dart';
import 'food_visual.dart';

/// Horizontal, scrollable category navigation strip — Screen 2 requirement.
class CategoryNav extends StatelessWidget {
  final List<MenuCategory> categories;
  final String selectedCategoryId;
  final ValueChanged<String> onSelected;

  const CategoryNav({
    super.key,
    required this.categories,
    required this.selectedCategoryId,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isWide = constraints.maxWidth > 700;
          return ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: EdgeInsets.symmetric(
              horizontal: isWide
                  ? (constraints.maxWidth - 640) / 2 + 16
                  : 16,
            ),
            itemCount: categories.length,
            separatorBuilder: (_, _) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final category = categories[index];
              final selected = category.id == selectedCategoryId;
              final visual = FoodVisual.forProduct(categoryName: category.name);
              return ChoiceChip(
                avatar: Icon(
                  visual.icon,
                  size: 16,
                  color: selected ? AppColors.charcoal : Colors.white70,
                ),
                label: Text(category.name),
                selected: selected,
                onSelected: (_) => onSelected(category.id),
                showCheckmark: false,
                labelStyle: TextStyle(
                  color: selected ? AppColors.charcoal : Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
                selectedColor: AppColors.accentYellow,
                backgroundColor: AppColors.charcoalSurface,
                side: BorderSide(
                  color: selected
                      ? AppColors.accentYellow
                      : Colors.white.withValues(alpha: 0.16),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
