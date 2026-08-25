import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/router/app_router.dart';
import '../../../domain/address_management_usecase.dart';
import '../../../models/customer_address.dart';
import '../../../services/address_draft_holder.dart';
import '../../../services/checkout_service.dart';
import '../../../services/geolocation_service.dart';
import '../../../services/session_service.dart';
import '../../widgets/address_card.dart';
import '../../widgets/empty_state_view.dart';
import '../../widgets/error_state_view.dart';
import '../../widgets/loading_view.dart';

enum AddressScreenMode { checkoutSelect, manage }

/// Screen 7 — Address. Handles both "choose/add an address during
/// checkout" and "manage saved addresses from Profile" with one screen —
/// the only difference is whether tapping an address continues checkout or
/// just selects it for editing.
class AddressScreen extends StatefulWidget {
  final AddressScreenMode mode;

  const AddressScreen({super.key, required this.mode});

  @override
  State<AddressScreen> createState() => _AddressScreenState();
}

class _AddressScreenState extends State<AddressScreen> {
  late Future<List<CustomerAddress>> _future;
  bool _locating = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<CustomerAddress>> _load() {
    final customerId = context.read<SessionService>().customerId;
    if (customerId == null) return Future.value(const []);
    return context.read<AddressManagementUseCase>().savedAddresses(customerId);
  }

  void _retry() => setState(() => _future = _load());

  Future<void> _useCurrentLocation() async {
    setState(() => _locating = true);
    try {
      final location = await context
          .read<AddressManagementUseCase>()
          .captureCurrentLocation();
      if (!mounted) return;
      context.read<AddressDraftHolder>().setLocation(
        location.latitude,
        location.longitude,
      );
      final saved = await context.push<bool>(_addressFormRoute(widget.mode));
      if (saved == true) _retry();
    } on LocationPermissionDeniedException catch (e) {
      if (!mounted) return;
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Location permission needed'),
          content: Text(e.message),
          actions: [
            TextButton(onPressed: () => context.pop(), child: const Text('OK')),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not get your location: $e')),
      );
    } finally {
      if (mounted) setState(() => _locating = false);
    }
  }

  Future<void> _addManually() async {
    final saved = await context.push<bool>(_addressFormRoute(widget.mode));
    if (saved == true) _retry();
  }

  Future<void> _edit(CustomerAddress address) async {
    context.read<AddressDraftHolder>().setEditing(address);
    final saved = await context.push<bool>(_addressFormRoute(widget.mode));
    if (saved == true) _retry();
  }

  Future<void> _delete(CustomerAddress address) async {
    await context.read<AddressManagementUseCase>().deleteAddress(address.id);
    _retry();
  }

  void _select(CustomerAddress address) {
    context.read<CheckoutService>().setAddress(address);
    context.push(AppRoutes.checkoutReview);
  }

  @override
  Widget build(BuildContext context) {
    final isCheckout = widget.mode == AddressScreenMode.checkoutSelect;
    return Scaffold(
      appBar: AppBar(
        title: Text(isCheckout ? 'Delivery Address' : 'Saved Addresses'),
      ),
      body: FutureBuilder<List<CustomerAddress>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingView();
          }
          if (snapshot.hasError) {
            return ErrorStateView(
              title: 'Could not load your addresses',
              message: '${snapshot.error}',
              onRetry: _retry,
            );
          }
          final addresses = snapshot.data!;
          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _locating ? null : _useCurrentLocation,
                      icon: _locating
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.my_location),
                      label: Text(
                        _locating
                            ? 'Getting your location…'
                            : 'Use Current Location',
                      ),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: _addManually,
                      icon: const Icon(Icons.add_location_alt_outlined),
                      label: const Text('Add Address Manually'),
                    ),
                    const SizedBox(height: 20),
                    if (addresses.isEmpty)
                      const Padding(
                        padding: EdgeInsets.only(top: 24),
                        child: EmptyStateView(
                          icon: Icons.location_off_outlined,
                          title: 'No saved addresses yet',
                          message:
                              'Add one above to speed up checkout next time.',
                        ),
                      )
                    else ...[
                      Text(
                        'Saved Addresses',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 10),
                      for (final address in addresses)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: AddressCard(
                            address: address,
                            selected:
                                isCheckout &&
                                context
                                        .watch<CheckoutService>()
                                        .selectedAddress
                                        ?.id ==
                                    address.id,
                            onTap: isCheckout ? () => _select(address) : null,
                            onEdit: () => _edit(address),
                            onDelete: () => _delete(address),
                          ),
                        ),
                    ],
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

String _addressFormRoute(AddressScreenMode mode) =>
    mode == AddressScreenMode.checkoutSelect
    ? AppRoutes.checkoutAddressNew
    : AppRoutes.profileAddressNew;
