# Supabase Rules

Authorized project only:
`detqohhtihlygwxjasti`

Do not touch other Supabase projects.

Protected and unrelated:
- `core.*`
- `public.t_tokens`
- `public.t_results`
- `public.t_snapshot`

Rules:
- No database reset.
- No disabling/bypassing RLS.
- No service-role key in Flutter.
- Treat client values as untrusted.
- Server-side pricing remains authoritative.
- Customer ownership must remain auth-bound.
- Database changes require controlled verification before application.
- Do not create unnecessary storage/extensions/tables/policies.
