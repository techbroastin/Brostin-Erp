import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primaryRed = Color(0xFFD32F2F);
  static const Color primaryRedDark = Color(0xFFA02525);
  static const Color accentYellow = Color(0xFFFFC107);

  static const Color background = Color(0xFFFFFBF5);
  static const Color surface = Color(0xFFFFFFFF);

  /// Dark hero-header ground — the "black background, red + yellow accents"
  /// brand energy from the reference menu poster, used only for the Menu
  /// screen's header/search/category band. The rest of the app stays on the
  /// light [background]/[surface] pair.
  static const Color charcoal = Color(0xFF1B1310);
  static const Color charcoalSurface = Color(0xFF2A211C);

  /// Card ground on the dark Menu screen — one step lighter than
  /// [charcoalSurface] so product cards read as distinct surfaces against
  /// the page background rather than blending flat.
  static const Color charcoalCard = Color(0xFF241C17);
  static const Color charcoalBorder = Color(0x1FFFFFFF);

  static const Color textPrimary = Color(0xFF211A16);
  static const Color textSecondary = Color(0xFF6B615B);

  static const Color success = Color(0xFF2E7D32);

  /// Deliberately NOT a shade of [primaryRed]/[primaryRedDark] — an error
  /// border must read as distinct from a plain focused field at a glance.
  /// See `inputDecorationTheme.focusedBorder` vs `errorBorder`/
  /// `focusedErrorBorder` in `app_theme.dart`.
  static const Color error = Color(0xFFE65100);
  static const Color border = Color(0xFFE7E0D8);
}
