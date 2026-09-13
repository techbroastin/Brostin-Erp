import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../domain/image_validators.dart';
import '../../services/image_picker_service.dart';

/// One reusable upload/preview/remove control, used for both a product's
/// photo and the restaurant logo. Owns its own busy/error/success state;
/// callers only supply what to do with a validated picked file.
class AdminImageField extends StatefulWidget {
  final String? imageUrl;

  /// Shown when [imageUrl] is null and fails to load — e.g. the canonical
  /// Broastin logo asset for the branding screen. Null for product images,
  /// which fall back to a plain icon instead.
  final String? fallbackAssetPath;
  final IconData fallbackIcon;
  final ImagePickerService picker;
  final Future<void> Function(Uint8List bytes, String fileName) onUpload;
  final Future<void> Function() onRemove;

  const AdminImageField({
    super.key,
    required this.imageUrl,
    this.fallbackAssetPath,
    this.fallbackIcon = Icons.image_outlined,
    required this.picker,
    required this.onUpload,
    required this.onRemove,
  });

  @override
  State<AdminImageField> createState() => _AdminImageFieldState();
}

class _AdminImageFieldState extends State<AdminImageField> {
  bool _busy = false;
  String? _error;
  String? _success;

  Future<void> _pickAndUpload() async {
    setState(() {
      _busy = true;
      _error = null;
      _success = null;
    });
    try {
      final picked = await widget.picker.pickImage();
      if (picked == null) {
        setState(() => _busy = false);
        return;
      }
      final validationError = ImageValidators.validate(
        fileName: picked.fileName,
        byteLength: picked.bytes.length,
      );
      if (validationError != null) {
        setState(() {
          _error = validationError;
          _busy = false;
        });
        return;
      }
      await widget.onUpload(picked.bytes, picked.fileName);
      if (!mounted) return;
      setState(() {
        _success = 'Image updated';
        _busy = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Upload failed: $e';
        _busy = false;
      });
    }
  }

  Future<void> _remove() async {
    setState(() {
      _busy = true;
      _error = null;
      _success = null;
    });
    try {
      await widget.onRemove();
      if (!mounted) return;
      setState(() {
        _success = 'Image removed';
        _busy = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'Remove failed: $e';
        _busy = false;
      });
    }
  }

  Widget _preview() {
    const size = 96.0;
    Widget fallback() => widget.fallbackAssetPath != null
        ? Image.asset(
            widget.fallbackAssetPath!,
            width: size,
            height: size,
            fit: BoxFit.contain,
            errorBuilder: (_, _, _) => Icon(widget.fallbackIcon, size: 40),
          )
        : Icon(widget.fallbackIcon, size: 40);

    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(8),
      ),
      clipBehavior: Clip.antiAlias,
      child: widget.imageUrl == null
          ? fallback()
          : Image.network(
              widget.imageUrl!,
              width: size,
              height: size,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => fallback(),
            ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _preview(),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Wrap(
                spacing: 8,
                runSpacing: 4,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  OutlinedButton.icon(
                    onPressed: _busy ? null : _pickAndUpload,
                    icon: const Icon(Icons.upload_outlined, size: 18),
                    label: Text(
                      widget.imageUrl == null ? 'Upload' : 'Replace',
                    ),
                  ),
                  if (widget.imageUrl != null)
                    TextButton.icon(
                      onPressed: _busy ? null : _remove,
                      icon: const Icon(Icons.delete_outline, size: 18),
                      label: const Text('Remove'),
                    ),
                  if (_busy)
                    const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                ],
              ),
              if (_error != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    _error!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),
              if (_success != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    _success!,
                    style: const TextStyle(color: Colors.green),
                  ),
                ),
              const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Text(
                  'JPG, PNG, or WEBP — up to 3 MB',
                  style: TextStyle(fontSize: 12, color: Colors.grey),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
