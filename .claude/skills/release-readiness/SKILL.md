---
name: release-readiness
description: Determine whether a Broastin build is ready for controlled deployment.
---

# Release Readiness

Verify:
- clean/intended Git diff
- no secrets
- no accidental demo/test data
- analyzer passes
- tests pass
- web build passes when required
- Playwright passes for UI changes
- migrations are applied and verified
- Supabase target is correct
- deployment configuration is production-safe

Do not deploy unless explicitly requested.
