---
description: Perform a focused pull-request review and report actionable findings.
---

# PR Review

Review the current PR/diff only.

1. Read `CLAUDE.md` and applicable rules.
2. Inspect the complete diff.
3. Trace changed code into affected dependencies.
4. Review correctness, regressions, security, tests, UI behavior, and architecture.
5. Use the security auditor perspective for auth/RLS/payment/database changes.
6. Use Playwright when UI behavior is materially changed.
7. Do not modify files during review unless explicitly requested.

Output findings by severity with file/line evidence.
If there are no blocking findings, say so clearly.
