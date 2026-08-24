import 'package:geolocator/geolocator.dart';

class LocationResult {
  final double latitude;
  final double longitude;

  const LocationResult({required this.latitude, required this.longitude});
}

class LocationPermissionDeniedException implements Exception {
  final String message;
  const LocationPermissionDeniedException([
    this.message = 'Location permission was denied.',
  ]);
}

/// Wraps browser/device geolocation. Permission is only ever requested when
/// this is explicitly called (i.e. the customer tapped "Use Current
/// Location") — never on app startup or page load.
class GeolocationService {
  Future<LocationResult> getCurrentLocation() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw const LocationPermissionDeniedException(
        'Location services are disabled.',
      );
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw const LocationPermissionDeniedException();
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw const LocationPermissionDeniedException(
        'Location permission is permanently denied.',
      );
    }

    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    );

    return LocationResult(latitude: position.latitude, longitude: position.longitude);
  }
}
