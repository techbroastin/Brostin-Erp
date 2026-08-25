import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

final _rupeeFormat = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '₹',
  decimalDigits: 0,
);

class PriceText extends StatelessWidget {
  final double amount;
  final TextStyle? style;
  final TextAlign? textAlign;

  const PriceText(this.amount, {super.key, this.style, this.textAlign});

  @override
  Widget build(BuildContext context) {
    return Text(
      _rupeeFormat.format(amount),
      style: style,
      textAlign: textAlign,
    );
  }
}

String formatPrice(double amount) => _rupeeFormat.format(amount);
