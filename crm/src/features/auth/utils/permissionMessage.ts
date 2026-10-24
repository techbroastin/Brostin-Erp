/**
 * The "Your role (…) can't …" text when a change was refused by
 * authService.requirePermission, so screens can show the real reason
 * instead of a generic "please try again". Null for any other error.
 */
export function permissionMessage(error: unknown): string | null {
  return error instanceof Error && error.name === 'PermissionError' ? error.message : null
}
