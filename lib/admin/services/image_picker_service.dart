import 'dart:async';
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

  /// image_picker_for_web detects a cancelled/dismissed file dialog via a
  /// window-focus heuristic that doesn't always fire (a known limitation
  /// of that plugin) — when it's missed, pickImage()'s Future never
  /// resolves at all, which previously left the upload UI stuck in its
  /// loading state forever with no error. A bounded wait treats a stalled
  /// pick the same as a cancellation instead of hanging indefinitely.
  static const _pickTimeout = Duration(seconds: 60);

  @override
  Future<PickedImage?> pickImage() async {
    XFile? file;
    try {
      file = await _picker
          .pickImage(source: ImageSource.gallery)
          .timeout(_pickTimeout);
    } on TimeoutException {
      return null;
    }
    if (file == null) return null;
    final bytes = await file.readAsBytes();
    return PickedImage(bytes: bytes, fileName: file.name);
  }
}
