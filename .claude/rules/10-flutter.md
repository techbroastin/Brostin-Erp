# Flutter Rules

- Mobile-first; desktop must remain functional.
- Preserve the existing architecture unless change is necessary.
- Do not hardcode backend prices or production business rules in UI.
- Keep UI responsive at narrow widths.
- Prefer existing repositories/services/domain models over duplicate data access.
- Run `flutter analyze` and relevant tests after implementation.
- For major phases also run `flutter build web`.
- UI acceptance requires Playwright.
- Avoid arbitrary sleeps in UI tests.
