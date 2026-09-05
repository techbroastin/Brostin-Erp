#!/usr/bin/env bash
set -euo pipefail

# Claude Code passes tool input as JSON on stdin.
INPUT="$(cat)"

# Block known destructive/high-risk commands.
if printf '%s' "$INPUT" | grep -Eiq \
  'git[[:space:]]+reset[[:space:]]+--hard|git[[:space:]]+push[[:space:]]+.*--force|rm[[:space:]]+-rf|supabase[[:space:]]+db[[:space:]]+reset|DROP[[:space:]]+DATABASE|DROP[[:space:]]+SCHEMA'; then
  echo "BLOCKED by Broastin safety hook: destructive command detected." >&2
  exit 2
fi

# Protect unrelated Supabase projects explicitly known to be outside this app.
# afitinteriors/afitcrm is the unrelated AFIT CRM prototype sharing this Supabase
# project, called out in CLAUDE.md section 7 ("SUPABASE PROJECT SAFETY") as never
# to be touched from this repo.
if printf '%s' "$INPUT" | grep -Eiq \
  'afitinteriors|afitcrm'; then
  echo "BLOCKED by Broastin safety hook: unrelated Supabase project detected." >&2
  exit 2
fi

exit 0
