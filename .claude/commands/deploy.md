---
description: Prepare and execute a controlled deployment with verification.
---

# Deploy

Deployment is a controlled operation.

1. Read `CLAUDE.md` and applicable rules.
2. Inspect `git status` and `git diff`.
3. Confirm the intended branch/commit and deployment target.
4. Run required tests, analyzer, build, and Playwright checks.
5. Check for secrets, debug configuration, and accidental test/demo data.
6. Confirm database changes are already migrated and verified.
7. Deploy only when the user has explicitly requested deployment.
8. Verify the deployed application.
9. Report exact commit/target, verification results, and rollback considerations.

Never force-push.
Never reset the database as a deployment shortcut.
Never deploy unrelated Supabase projects.
