# Broastin Claude Code System

This directory contains the project's Claude Code operating system.

## Structure

- `agents/` — specialist subagents
- `commands/` — reusable slash commands
- `hooks/` — runtime safety/automation hooks
- `rules/` — scoped engineering rules
- `skills/` — reusable specialist workflows
- `settings.json` — project-level Claude Code configuration

## Operating model

1. Read `CLAUDE.md` first.
2. Use the smallest relevant agent/skill.
3. Work in one phase at a time.
4. Test before reporting completion.
5. Do not silently expand scope.
6. Treat Supabase changes as controlled operations.
7. Use Playwright for UI acceptance testing.
8. Never bypass project security rules to make a test pass.

## Slash commands

- `/fix-issue`
- `/deploy`
- `/pr-review`

## Agents

- `code-reviewer`
- `debugger`
- `test-writer`
- `refactorer`
- `doc-writer`
- `security-auditor`
