import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../data/repositories/order_repository.dart';
import '../../../models/order.dart';
import '../../../services/dining_context_service.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/loading_view.dart';
import '../../widgets/order_status_timeline.dart';
import '../../widgets/price_text.dart';

class OrderStatusScreen extends StatelessWidget {
  final String orderId;

  const OrderStatusScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Status')),
      body: FutureBuilder<Order>(
        future: context.read<OrderRepository>().fetchOrder(orderId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return const ErrorStateView(
              title: 'Could not load this order',
              message:
                  'We could not find this order. Please check My Orders instead.',
            );
          }
          final order = snapshot.data!;
          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          order.orderNumber,
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const Spacer(),
                        PriceText(
                          order.grandTotal,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      orderTypeLabel(order.orderType),
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                    if (order.orderType == OrderType.dining &&
                        context.watch<DiningContextService>().tableNumber !=
                            null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          'Table ${context.watch<DiningContextService>().tableNumber}',
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    if (order.orderType == OrderType.delivery &&
                        order.deliveryAddressSnapshot != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 4),
                        child: Text(
                          '${order.deliveryAddressSnapshot!['house_building'] ?? ''}, '
                          '${order.deliveryAddressSnapshot!['area'] ?? ''}',
                          style: const TextStyle(color: AppColors.textSecondary),
                        ),
                      ),
                    const SizedBox(height: 28),
                    OrderStatusTimeline(
                      currentStatus: order.orderStatus,
                      orderType: order.orderType,
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
