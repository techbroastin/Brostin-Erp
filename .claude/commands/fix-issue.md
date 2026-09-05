---
description: Diagnose and fix one reported issue with minimal scope and regression testing.
---

# Fix Issue

Work on one issue only.

1. Read `CLAUDE.md` and applicable `.claude/rules/`.
2. Reproduce or inspect the exact failure.
3. Determine the root cause before editing.
4. Implement the smallest correct fix.
5. Add/update a regression test.
6. Run targeted tests.
7. Run required project validation for the affected layer.
8. Review the final diff.
9. Report root cause, files changed, tests, and remaining risk.

Do not refactor unrelated code.
Do not modify database/schema/infrastructure unless the issue requires it.
If a Supabase change is required, stop and follow the controlled database-change rules.
