class Customer {
  final String id;
  final String phone;
  final String? name;

  const Customer({
    required this.id,
    required this.phone,
    this.name,
  });

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as String,
        phone: json['phone'] as String,
        name: json['name'] as String?,
      );
}
