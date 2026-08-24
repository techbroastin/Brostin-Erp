import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/menu_category.dart';

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
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = categories[index];
          final selected = category.id == selectedCategoryId;
          return ChoiceChip(
            label: Text(category.name),
            selected: selected,
            onSelected: (_) => onSelected(category.id),
            showCheckmark: false,
            labelStyle: TextStyle(
              color: selected ? Colors.white : AppColors.textPrimary,
              fontWeight: FontWeight.w600,
            ),
            selectedColor: AppColors.primaryRed,
            backgroundColor: AppColors.surface,
            side: BorderSide(color: selected ? AppColors.primaryRed : AppColors.border),
          );
        },
      ),
    );
  }
}
