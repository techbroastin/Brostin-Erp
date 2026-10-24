/**
 * Settings feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * `SettingsUserRole` is Book 3 §14's four fixed MVP roles. What each
 * role may do is the owner-approved starting matrix in
 * utils/permissions.ts. Nothing is enforced yet — there is no sign-in
 * (Authentication phase), and enforcement must ultimately happen in the
 * backend, not only by hiding UI.
 */

export type GeneralSettings = {
  businessName: string
  contactEmail: string
  contactPhone: string
  /**
   * Where a customer is sent after a 4-5 star rating (Book 3 §9's
   * "prompt to post publicly"), e.g. a Google/Zomato listing. Null
   * until an owner configures one — no URL is invented or hardcoded
   * anywhere; see features/feedback's public capture screen for the
   * honest "not configured" state when this is null.
   */
  publicReviewUrl: string | null
}

export type SettingsUserRole = 'owner' | 'manager' | 'staff' | 'marketing_operator'

export const ROLE_LABELS: Record<SettingsUserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
  marketing_operator: 'Marketing Operator',
}

export const SETTINGS_USER_ROLES = Object.keys(ROLE_LABELS) as SettingsUserRole[]

export type SettingsUser = {
  id: string
  name: string
  email: string
  role: SettingsUserRole
}

export type NotificationPreference = {
  id: string
  label: string
  enabled: boolean
}

/** Customer messaging channels the Notification Engine (Book 3 §13) can route through. */
export type MessageChannel = 'whatsapp' | 'sms' | 'email'

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
}

/**
 * Book 3 §13 rules shared by every program and campaign. Channels are
 * tried in `channelOrder`, skipping disabled ones; if none works the
 * message is only logged. The weekly cap counts messages that reached
 * the customer in the last 7 days, across all sources combined.
 */
export type MessagingRules = {
  weeklyCapPerCustomer: number
  channelOrder: { channel: MessageChannel; enabled: boolean }[]
}

export type AddSettingsUserInput = {
  name: string
  email: string
  role: SettingsUserRole
}
