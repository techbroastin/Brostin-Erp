import 'package:broastin_ordering/admin/services/image_picker_service.dart';

/// Returns a canned picked file (or null, simulating a cancelled picker)
/// instead of driving a real OS file dialog.
class FakeImagePickerService implements ImagePickerService {
  final PickedImage? result;
  const FakeImagePickerService(this.result);

  @override
  Future<PickedImage?> pickImage() async => result;
}
