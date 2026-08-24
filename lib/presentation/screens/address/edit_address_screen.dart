import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/theme/app_colors.dart';
import '../../../domain/address_management_usecase.dart';
import '../../../models/customer_address.dart';
import '../../../services/address_draft_holder.dart';
import '../../../services/session_service.dart';

const _labels = ['Home', 'Work', 'Other'];

/// Screen 7 (continued) — Manual address entry, also used to confirm/enrich
/// a captured GPS location. House/street/area/landmark/pincode are always
/// collected — GPS coordinates never substitute for a typed address, only
/// accompany it (per the spec: "allow customer to enter/confirm" details
/// after capturing coordinates).
class EditAddressScreen extends StatefulWidget {
  const EditAddressScreen({super.key});

  @override
  State<EditAddressScreen> createState() => _EditAddressScreenState();
}

class _EditAddressScreenState extends State<EditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final _houseController = TextEditingController();
  final _streetController = TextEditingController();
  final _areaController = TextEditingController();
  final _landmarkController = TextEditingController();
  final _pincodeController = TextEditingController();
  final _notesController = TextEditingController();
  String _label = 'Home';
  double? _latitude;
  double? _longitude;
  String? _editingId;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final draft = context.read<AddressDraftHolder>();
    _latitude = draft.latitude;
    _longitude = draft.longitude;
    final editing = draft.editing;
    if (editing != null) {
      _editingId = editing.id;
      _label = editing.label;
      _houseController.text = editing.houseBuilding;
      _streetController.text = editing.street ?? '';
      _areaController.text = editing.area ?? '';
      _landmarkController.text = editing.landmark ?? '';
      _pincodeController.text = editing.pincode;
      _notesController.text = editing.deliveryNotes ?? '';
      _latitude = editing.latitude;
      _longitude = editing.longitude;
    }
    draft.clear();
  }

  @override
  void dispose() {
    _houseController.dispose();
    _streetController.dispose();
    _areaController.dispose();
    _landmarkController.dispose();
    _pincodeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final customerId = context.read<SessionService>().customerId;
    if (customerId == null) return;

    setState(() => _saving = true);
    try {
      await context.read<AddressManagementUseCase>().saveAddress(
            CustomerAddress(
              id: _editingId ?? '',
              customerId: customerId,
              label: _label,
              houseBuilding: _houseController.text.trim(),
              street: _emptyToNull(_streetController.text),
              area: _emptyToNull(_areaController.text),
              landmark: _emptyToNull(_landmarkController.text),
              pincode: _pincodeController.text.trim(),
              latitude: _latitude,
              longitude: _longitude,
              deliveryNotes: _emptyToNull(_notesController.text),
              isDefault: false,
            ),
          );
      if (!mounted) return;
      context.pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Could not save address: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  String? _emptyToNull(String value) => value.trim().isEmpty ? null : value.trim();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_editingId == null ? 'Add Address' : 'Edit Address')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_latitude != null && _longitude != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.my_location, size: 18, color: AppColors.success),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Location captured (${_latitude!.toStringAsFixed(4)}, ${_longitude!.toStringAsFixed(4)}) — confirm the details below',
                                style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                              ),
                            ),
                          ],
                        ),
                      ),
                    Text('Address Label', style: Theme.of(context).textTheme.titleSmall),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _labels.map((label) {
                        final selected = label == _label;
                        return ChoiceChip(
                          label: Text(label),
                          selected: selected,
                          onSelected: (_) => setState(() => _label = label),
                          selectedColor: AppColors.primaryRed,
                          labelStyle: TextStyle(color: selected ? Colors.white : AppColors.textPrimary),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _houseController,
                      decoration: const InputDecoration(labelText: 'House / Building'),
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _streetController,
                      decoration: const InputDecoration(labelText: 'Street'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _areaController,
                      decoration: const InputDecoration(labelText: 'Area'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _landmarkController,
                      decoration: const InputDecoration(labelText: 'Landmark'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _pincodeController,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'Pincode'),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Required';
                        if (!RegExp(r'^[0-9]{6}$').hasMatch(v.trim())) return 'Enter a valid 6-digit pincode';
                        return null;
                      },
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notesController,
                      decoration: const InputDecoration(labelText: 'Delivery Notes (optional)'),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _saving ? null : _save,
                      child: _saving
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Save Address'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
