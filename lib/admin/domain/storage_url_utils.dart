/// Pure helper to recover a Supabase Storage object path from a public URL
/// of the form `.../storage/v1/object/public/{bucket}/{path}`, so a
/// replacement upload can delete the old object first (handles an
/// extension change, e.g. png -> jpg, without leaving an orphaned file).
///
/// Returns null for anything that doesn't match this exact shape —
/// including a foreign/external URL (e.g. a seed-data stock photo not
/// stored in our bucket) — so callers can safely skip the delete step
/// rather than mishandle a URL we don't own.
String? storagePathFromPublicUrl(String bucket, String? url) {
  if (url == null) return null;
  final marker = '/storage/v1/object/public/$bucket/';
  final index = url.indexOf(marker);
  if (index < 0) return null;
  final path = url.substring(index + marker.length);
  return path.isEmpty ? null : path;
}
