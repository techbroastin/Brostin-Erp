class CustomerAddress {
  final String id;
  final String customerId;
  final String label;
  final String houseBuilding;
  final String? street;
  final String? area;
  final String? landmark;
  final String pincode;
  final double? latitude;
  final double? longitude;
  final String? deliveryNotes;
  final bool isDefault;

  const CustomerAddress({
    required this.id,
    required this.customerId,
    required this.label,
    required this.houseBuilding,
    this.street,
    this.area,
    this.landmark,
    required this.pincode,
    this.latitude,
    this.longitude,
    this.deliveryNotes,
    required this.isDefault,
  });

  factory CustomerAddress.fromJson(Map<String, dynamic> json) => CustomerAddress(
        id: json['id'] as String,
        customerId: json['customer_id'] as String,
        label: json['label'] as String,
        houseBuilding: json['house_building'] as String,
        street: json['street'] as String?,
        area: json['area'] as String?,
        landmark: json['landmark'] as String?,
        pincode: json['pincode'] as String,
        latitude: (json['latitude'] as num?)?.toDouble(),
        longitude: (json['longitude'] as num?)?.toDouble(),
        deliveryNotes: json['delivery_notes'] as String?,
        isDefault: json['is_default'] as bool,
      );

  Map<String, dynamic> toInsertJson({required String customerId}) => {
        'customer_id': customerId,
        'label': label,
        'house_building': houseBuilding,
        'street': street,
        'area': area,
        'landmark': landmark,
        'pincode': pincode,
        'latitude': latitude,
        'longitude': longitude,
        'delivery_notes': deliveryNotes,
        'is_default': isDefault,
      };
}
