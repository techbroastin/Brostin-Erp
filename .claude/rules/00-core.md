# Core Engineering Rules

- One phase at a time: implement → test → report → `/clear` → next phase.
- Never combine unrelated phases.
- Do not expand scope without explicit approval.
- Investigate actual files before making claims.
- Prefer minimal, reversible changes.
- Never use destructive commands as shortcuts.
- Tests verify requirements; do not hardcode behavior merely to satisfy tests.
- Clean up temporary files created during development.
- Keep persistent project rules in `CLAUDE.md`; keep this folder for reusable Claude Code behavior.
