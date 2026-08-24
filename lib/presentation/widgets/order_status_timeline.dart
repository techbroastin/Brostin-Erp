import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../models/order.dart';

const _takeawaySteps = [
  OrderStatus.placed,
  OrderStatus.confirmed,
  OrderStatus.preparing,
  OrderStatus.ready,
  OrderStatus.completed,
];

const _deliverySteps = [
  OrderStatus.placed,
  OrderStatus.confirmed,
  OrderStatus.preparing,
  OrderStatus.ready,
  OrderStatus.outForDelivery,
  OrderStatus.delivered,
];

String orderStatusLabel(OrderStatus status) => switch (status) {
      OrderStatus.placed => 'Placed',
      OrderStatus.confirmed => 'Confirmed',
      OrderStatus.preparing => 'Preparing',
      OrderStatus.ready => 'Ready',
      OrderStatus.outForDelivery => 'Out for Delivery',
      OrderStatus.delivered => 'Delivered',
      OrderStatus.completed => 'Completed',
      OrderStatus.cancelled => 'Cancelled',
    };

class OrderStatusTimeline extends StatelessWidget {
  final OrderStatus currentStatus;
  final OrderType orderType;

  const OrderStatusTimeline({super.key, required this.currentStatus, required this.orderType});

  @override
  Widget build(BuildContext context) {
    if (currentStatus == OrderStatus.cancelled) {
      return const Row(
        children: [
          Icon(Icons.cancel, color: AppColors.error),
          SizedBox(width: 8),
          Text('This order was cancelled', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
        ],
      );
    }

    final steps = orderType == OrderType.delivery ? _deliverySteps : _takeawaySteps;
    final currentIndex = steps.indexOf(currentStatus);

    return Column(
      children: [
        for (var i = 0; i < steps.length; i++)
          _TimelineRow(
            label: orderStatusLabel(steps[i]),
            state: i < currentIndex
                ? _StepState.done
                : i == currentIndex
                    ? _StepState.current
                    : _StepState.upcoming,
            isLast: i == steps.length - 1,
          ),
      ],
    );
  }
}

enum _StepState { done, current, upcoming }

class _TimelineRow extends StatelessWidget {
  final String label;
  final _StepState state;
  final bool isLast;

  const _TimelineRow({required this.label, required this.state, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final color = switch (state) {
      _StepState.done => AppColors.success,
      _StepState.current => AppColors.primaryRed,
      _StepState.upcoming => AppColors.border,
    };

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: state == _StepState.upcoming ? Colors.white : color,
                  border: Border.all(color: color, width: 2),
                ),
                child: state == _StepState.done
                    ? const Icon(Icons.check, size: 13, color: Colors.white)
                    : null,
              ),
              if (!isLast) Expanded(child: Container(width: 2, color: color.withValues(alpha: 0.4))),
            ],
          ),
          const SizedBox(width: 14),
          Padding(
            padding: const EdgeInsets.only(bottom: 20),
            child: Text(
              label,
              style: TextStyle(
                fontWeight: state == _StepState.current ? FontWeight.w700 : FontWeight.w500,
                color: state == _StepState.upcoming ? AppColors.textSecondary : AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
