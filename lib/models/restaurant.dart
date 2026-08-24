class Restaurant {
  final String id;
  final String name;
  final String? tagline;
  final String? logoUrl;

  const Restaurant({
    required this.id,
    required this.name,
    this.tagline,
    this.logoUrl,
  });

  factory Restaurant.fromJson(Map<String, dynamic> json) => Restaurant(
        id: json['id'] as String,
        name: json['name'] as String,
        tagline: json['tagline'] as String?,
        logoUrl: json['logo_url'] as String?,
      );
}
