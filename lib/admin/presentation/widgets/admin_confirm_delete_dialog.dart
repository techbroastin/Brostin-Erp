import 'package:flutter/material.dart';

/// Confirms a destructive delete. Returns true only if the user tapped
/// Delete. Used for categories, products, and variants alike.
Future<bool> showAdminConfirmDeleteDialog(
  BuildContext context, {
  required String title,
  required String message,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        FilledButton.tonal(
          onPressed: () => Navigator.of(context).pop(true),
          style: FilledButton.styleFrom(
            foregroundColor: Theme.of(context).colorScheme.error,
          ),
          child: const Text('Delete'),
        ),
      ],
    ),
  );
  return result ?? false;
}

/// Shows a refusal explanation when the repository reports the row can't be
/// deleted safely (still has children, or has order history). Not a
/// confirmation — just an OK-dismiss notice.
Future<void> showAdminDeleteBlockedDialog(
  BuildContext context, {
  required String reason,
}) {
  return showDialog<void>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Can\'t delete'),
      content: Text(reason),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('OK'),
        ),
      ],
    ),
  );
}
