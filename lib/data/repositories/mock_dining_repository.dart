import 'dining_repository.dart';

/// Mock mode has no real restaurant_tables row to resolve against — every
/// QR is honestly reported as invalid rather than fabricating a fake
/// table, since there is no meaningful "mock table" concept to stand in
/// for the real RLS-gated lookup.
class MockDiningRepository implements DiningRepository {
  @override
  Future<ResolvedDiningTable?> resolveTable(String qrToken) async {
    await Future.delayed(const Duration(milliseconds: 200));
    return null;
  }
}
