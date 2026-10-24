import { Eye, Minus, Pencil } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DemoDataBadge } from '@/components/shared/DemoDataBadge'
import { ROLE_LABELS, SETTINGS_USER_ROLES } from '@/features/settings/types/settings'
import {
  PERMISSION_AREAS,
  PERMISSION_AREA_LABELS,
  ROLE_PERMISSIONS,
  type AccessLevel,
} from '@/features/settings/utils/permissions'
import { cn } from '@/lib/utils'

const LEVEL_DISPLAY: Record<AccessLevel, { label: string; icon: typeof Eye; className: string }> = {
  manage: { label: 'Manage', icon: Pencil, className: 'text-foreground font-medium' },
  view: { label: 'View', icon: Eye, className: 'text-muted-foreground' },
  none: { label: 'No access', icon: Minus, className: 'text-muted-foreground/60' },
}

/**
 * Desktop Roles & Access — Book 3 §14's four fixed roles and the
 * owner-approved starting matrix (utils/permissions.ts). Read-only;
 * button/field-level permissions are Phase 2. Applied by the app
 * since demo sign-in (menus, page access, and every change in the
 * services); server-side enforcement comes with Supabase.
 */
export function DesktopRolesSettingsContent() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-page-title font-semibold">Roles &amp; Access</h1>
        <DemoDataBadge />
      </div>

      <p className="max-w-3xl rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-body-sm">
        <strong>Applied in the app (demo sign-in).</strong> Each role sees only its menus, can't open pages marked
        None, and can't save changes where it has View only. These checks run in the browser, so they become real
        security once Supabase sign-in checks them on the server too.
      </p>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                {SETTINGS_USER_ROLES.map((role) => (
                  <TableHead key={role}>{ROLE_LABELS[role]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERMISSION_AREAS.map((area) => (
                <TableRow key={area}>
                  <TableCell className="font-medium">{PERMISSION_AREA_LABELS[area]}</TableCell>
                  {SETTINGS_USER_ROLES.map((role) => {
                    const { label, icon: Icon, className } = LEVEL_DISPLAY[ROLE_PERMISSIONS[role][area]]
                    return (
                      <TableCell key={role}>
                        <span className={cn('flex items-center gap-1.5 text-body-sm', className)}>
                          <Icon className="size-3.5" />
                          {label}
                        </span>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="max-w-3xl text-caption text-muted-foreground">
        Manage = can view and change. View = read only. Finer control (individual buttons and fields) comes in a later
        phase.
      </p>
    </div>
  )
}
