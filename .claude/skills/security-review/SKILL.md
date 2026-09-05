---
name: security-review
description: Run a focused security review for code, auth, Supabase, payments, and deployment changes.
---

# Security Review

Treat all client input as hostile.

Check:
- auth identity
- authorization/RLS
- data ownership
- RPC permissions
- SECURITY DEFINER functions
- pricing authority
- secrets
- API keys
- payment references
- logs
- deployment configuration

For any finding provide concrete evidence and the minimum safe fix.
