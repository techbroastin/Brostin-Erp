import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../domain/order_placement_usecase.dart';
import '../../../models/order.dart';
import '../../../services/cart_service.dart';
import '../../../services/checkout_service.dart';
import '../../../services/dining_context_service.dart';
import '../../../services/session_service.dart';
import '../../widgets/price_text.dart';

/// Screen 8 — Order Review. Validates customer/items/prices/availability/
/// address before allowing PLACE ORDER, per the spec — though the real
/// authoritative validation (price/availability) happens server-side once
/// backend integration is connected; here it's a fast-fail UX check.
class OrderReviewScreen extends StatefulWidget {
  const OrderReviewScreen({super.key});

  @override
  State<OrderReviewScreen> createState() => _OrderReviewScreenState();
}

class _OrderReviewScreenState extends State<OrderReviewScreen> {
  bool _placing = false;
  String? _error;

  Future<void> _placeOrder() async {
    final cart = context.read<CartService>();
    final checkout = context.read<CheckoutService>();
    final session = context.read<SessionService>();

    setState(() {
      _placing = true;
      _error = null;
    });
    try {
      final address = checkout.selectedAddress;
      final isDelivery = checkout.orderType == OrderType.delivery;
      final order = await context.read<OrderPlacementUseCase>().placeOrder(
        customerId: session.customerId!,
        branchId: checkout.branchId,
        addressId: address?.id,
        tableId: checkout.tableId,
        orderType: checkout.orderType!,
        paymentMethod: checkout.paymentMethod,
        cart: cart,
        deliveryCharge: checkout.deliveryCharge,
        deliveryDistanceKm: isDelivery ? checkout.deliveryDistanceKm : null,
        deliveryAddressSnapshot: isDelivery && address != null
            ? address.toDeliverySnapshot()
            : null,
        deliveryLatitude: isDelivery ? address?.latitude : null,
        deliveryLongitude: isDelivery ? address?.longitude : null,
        deliveryInstructions: isDelivery ? address?.deliveryNotes : null,
      );
      cart.clear();
      if (!mounted) return;
      // Navigate away before resetting checkout state: this screen watches
      // CheckoutService, and its own null-orderType guard (below) would
      // otherwise race checkout.reset()'s notifyListeners() and bounce the
      // customer back to Order Type instead of Confirmation.
      context.go(AppRoutes.orderConfirmation(order.id));
      checkout.reset();
    } on OrderValidationException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = 'Could not place your order. Please try again.');
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartService>();
    final checkout = context.watch<CheckoutService>();
    final session = context.watch<SessionService>();
    final grandTotal = cart.subtotal + checkout.deliveryCharge;

    return Scaffold(
      appBar: AppBar(title: const Text('Review Order')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 560),
            child: Column(
              children: [
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      _SectionCard(
                        title: 'Customer',
                        children: [
                          _KeyValueRow('Name', session.customerName ?? '—'),
                          _KeyValueRow(
                            'Phone',
                            '+91 ${session.customerPhone?.replaceFirst('+91', '') ?? '—'}',
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _SectionCard(
                        title: 'Order Type',
                        children: [
                          _KeyValueRow(
                            'Type',
                            checkout.orderType != null
                                ? orderTypeLabel(checkout.orderType!)
                                : '—',
                          ),
                          if (checkout.orderType == OrderType.dining)
                            _KeyValueRow(
                              'Table',
                              context.watch<DiningContextService>().tableNumber ??
                                  '—',
                            ),
                          if (checkout.orderType == OrderType.delivery &&
                              checkout.selectedAddress != null) ...[
                            _KeyValueRow(
                              'Address',
                              '${checkout.selectedAddress!.houseBuilding}, ${checkout.selectedAddress!.area ?? ''}',
                            ),
                            if (checkout.deliveryDistanceKm != null)
                              _KeyValueRow(
                                'Distance',
                                '${checkout.deliveryDistanceKm!.toStringAsFixed(1)} km',
                              ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 12),
                      _SectionCard(
                        title: 'Items',
                        children: [
                          for (final line in cart.lines)
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      '${line.quantity} × ${line.variant == null ? line.product.name : '${line.product.name} (${line.variant!.name})'}',
                                    ),
                                  ),
                                  PriceText(line.lineTotal),
                                ],
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _SectionCard(
                        title: 'Payment Method',
                        children: [
                          RadioGroup<PaymentMethod>(
                            groupValue: checkout.paymentMethod,
                            onChanged: (v) => checkout.setPaymentMethod(v!),
                            child: const Column(
                              children: [
                                RadioListTile<PaymentMethod>(
                                  contentPadding: EdgeInsets.zero,
                                  title: Text('Cash on Delivery / Cash'),
                                  value: PaymentMethod.cash,
                                  activeColor: AppColors.primaryRed,
                                ),
                                RadioListTile<PaymentMethod>(
                                  contentPadding: EdgeInsets.zero,
                                  title: Text('UPI'),
                                  value: PaymentMethod.upi,
                                  activeColor: AppColors.primaryRed,
                                ),
                              ],
                            ),
                          ),
                          if (checkout.paymentMethod == PaymentMethod.upi)
                            const Padding(
                              padding: EdgeInsets.only(top: 4),
                              child: Text(
                                'Payment is not automatically verified — pay the delivery/pickup staff via UPI and it will be confirmed manually.',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      _SectionCard(
                        title: 'Total',
                        children: [
                          _KeyValueRow('Subtotal', formatPrice(cart.subtotal)),
                          _KeyValueRow(
                            'Delivery Charge',
                            formatPrice(checkout.deliveryCharge),
                          ),
                          const Divider(),
                          _KeyValueRow(
                            'Grand Total',
                            formatPrice(grandTotal),
                            emphasize: true,
                          ),
                        ],
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 12),
                        Text(
                          _error!,
                          style: const TextStyle(color: AppColors.error),
                        ),
                      ],
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: ElevatedButton(
                    onPressed: _placing ? null : _placeOrder,
                    child: _placing
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Colors.white,
                            ),
                          )
                        : const Text('Place Order'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SectionCard({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _KeyValueRow extends StatelessWidget {
  final String label;
  final String value;
  final bool emphasize;

  const _KeyValueRow(this.label, this.value, {this.emphasize = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontWeight: emphasize ? FontWeight.w800 : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
