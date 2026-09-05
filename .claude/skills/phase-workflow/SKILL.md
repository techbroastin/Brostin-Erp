---
name: phase-workflow
description: Execute Broastin work as isolated phases with mandatory verification and reporting.
---

# Phase Workflow

Use for any non-trivial implementation.

## Pattern

Plan scope → inspect → implement → targeted test → full required validation → report → stop.

Do not begin the next phase automatically.

If a phase is blocked, fix the blocker if it is inside scope; otherwise report the blocker and stop.
