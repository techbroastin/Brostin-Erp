/// Pure, Supabase-free validation for admin image uploads (product photos,
/// logo). No decoding/resizing — just extension and byte-size checks, per
/// the "don't over-engineer image processing" instruction.
class ImageValidators {
  ImageValidators._();

  static const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  static const maxBytes = 3 * 1024 * 1024; // 3 MB

  /// Returns null when the file is acceptable, or a user-facing error
  /// string otherwise.
  static String? validate({required String fileName, required int byteLength}) {
    if (byteLength <= 0) return 'File is empty';
    if (byteLength > maxBytes) return 'File must be 3 MB or smaller';
    final ext = extensionOf(fileName);
    if (ext == null || !allowedExtensions.contains(ext)) {
      return 'Unsupported file type — use JPG, PNG, or WEBP';
    }
    return null;
  }

  /// Lowercase extension including the leading dot, or null if the file
  /// name has none.
  static String? extensionOf(String fileName) {
    final dot = fileName.lastIndexOf('.');
    if (dot < 0 || dot == fileName.length - 1) return null;
    return fileName.substring(dot).toLowerCase();
  }

  static String contentTypeFor(String extension) => switch (extension) {
    '.jpg' || '.jpeg' => 'image/jpeg',
    '.png' => 'image/png',
    '.webp' => 'image/webp',
    _ => 'application/octet-stream',
  };
}
