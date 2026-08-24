class Branch {
  final String id;
  final String restaurantId;
  final String name;
  final String? address;
  final String? phone;
  final double? latitude;
  final double? longitude;
  final bool isActive;

  const Branch({
    required this.id,
    required this.restaurantId,
    required this.name,
    this.address,
    this.phone,
    this.latitude,
    this.longitude,
    required this.isActive,
  });

  factory Branch.fromJson(Map<String, dynamic> json) => Branch(
        id: json['id'] as String,
        restaurantId: json['restaurant_id'] as String,
        name: json['name'] as String,
        address: json['address'] as String?,
        phone: json['phone'] as String?,
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        isActive: json['is_active'] as bool,
      );
}
