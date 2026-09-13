import 'dart:typed_data';

import 'package:image_picker/image_picker.dart';

class PickedImage {
  final Uint8List bytes;
  final String fileName;
  const PickedImage({required this.bytes, required this.fileName});
}

/// Behind an interface (like GeolocationService/SessionService elsewhere in
/// this app) so admin screens can be widget-tested without a real OS file
/// dialog.
abstract class ImagePickerService {
  /// Returns null if the user cancelled the picker.
  Future<PickedImage?> pickImage();
}

class ImagePickerServiceImpl implements ImagePickerService {
  final _picker = ImagePicker();

  @override
  Future<PickedImage?> pickImage() async {
    final file = await _picker.pickImage(source: ImageSource.gallery);
    if (file == null) return null;
    final bytes = await file.readAsBytes();
    return PickedImage(bytes: bytes, fileName: file.name);
  }
}
