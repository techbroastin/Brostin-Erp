import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/customer_address.dart';

class AddressCard extends StatelessWidget {
  final CustomerAddress address;
  final bool selected;
  final VoidCallback? onTap;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const AddressCard({
    super.key,
    required this.address,
    this.selected = false,
    this.onTap,
    this.onEdit,
    this.onDelete,
  });

  IconData get _labelIcon => switch (address.label) {
        'Home' => Icons.home_outlined,
        'Work' => Icons.work_outline,
        _ => Icons.place_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final lineTwo = [address.street, address.area, address.landmark]
        .whereType<String>()
        .where((s) => s.trim().isNotEmpty)
        .join(', ');

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: selected ? AppColors.primaryRed : AppColors.border, width: selected ? 1.5 : 1),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(_labelIcon, color: AppColors.primaryRed),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(address.label, style: const TextStyle(fontWeight: FontWeight.w700)),
                        if (address.isDefault) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.accentYellow.withValues(alpha: 0.3),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text('Default', style: TextStyle(fontSize: 11)),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(address.houseBuilding, style: const TextStyle(color: AppColors.textPrimary)),
                    if (lineTwo.isNotEmpty)
                      Text(lineTwo, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                    Text('PIN ${address.pincode}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  ],
                ),
              ),
              if (onEdit != null || onDelete != null)
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: AppColors.textSecondary),
                  onSelected: (value) {
                    if (value == 'edit') onEdit?.call();
                    if (value == 'delete') onDelete?.call();
                  },
                  itemBuilder: (context) => [
                    if (onEdit != null) const PopupMenuItem(value: 'edit', child: Text('Edit')),
                    if (onDelete != null) const PopupMenuItem(value: 'delete', child: Text('Delete')),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
