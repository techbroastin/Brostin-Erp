import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../../data/repositories/admin_branding_repository.dart';
import '../../../../data/repositories/admin_storage_repository.dart';
import '../../../../models/restaurant.dart';
import '../../../domain/image_validators.dart';
import '../../../domain/storage_url_utils.dart';
import '../../../services/image_picker_service.dart';
import '../../widgets/admin_image_field.dart';

const _logoBucket = 'menu-media';
const _canonicalLogoAsset = 'assets/branding/broastin/logo/broastin logo.png';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({super.key});

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  late Future<Restaurant> _future;

  @override
  void initState() {
    super.initState();
    _future = context.read<AdminBrandingRepository>().fetchRestaurant();
  }

  void _refresh() {
    setState(() {
      _future = context.read<AdminBrandingRepository>().fetchRestaurant();
    });
  }

  Future<void> _uploadLogo(
    Restaurant current,
    Uint8List bytes,
    String fileName,
  ) async {
    final storage = context.read<AdminStorageRepository>();
    final branding = context.read<AdminBrandingRepository>();
    final ext = ImageValidators.extensionOf(fileName)!;
    final oldPath = storagePathFromPublicUrl(_logoBucket, current.logoUrl);
    if (oldPath != null) await storage.deleteImage(oldPath);
    final path = 'branding/logo$ext';
    final url = await storage.uploadImage(
      path: path,
      bytes: bytes,
      contentType: ImageValidators.contentTypeFor(ext),
    );
    await branding.updateLogoUrl(url);
    _refresh();
  }

  Future<void> _removeLogo(Restaurant current) async {
    final storage = context.read<AdminStorageRepository>();
    final branding = context.read<AdminBrandingRepository>();
    final oldPath = storagePathFromPublicUrl(_logoBucket, current.logoUrl);
    if (oldPath != null) await storage.deleteImage(oldPath);
    await branding.updateLogoUrl(null);
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Settings', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          FutureBuilder<Restaurant>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const CircularProgressIndicator();
              }
              if (snapshot.hasError) {
                return Text('Failed to load branding: ${snapshot.error}');
              }
              final restaurant = snapshot.data!;
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Branding',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text(restaurant.name),
                      const SizedBox(height: 16),
                      AdminImageField(
                        imageUrl: restaurant.logoUrl,
                        fallbackAssetPath: _canonicalLogoAsset,
                        picker: context.read<ImagePickerService>(),
                        onUpload: (bytes, fileName) =>
                            _uploadLogo(restaurant, bytes, fileName),
                        onRemove: () => _removeLogo(restaurant),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
