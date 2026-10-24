/**
 * Personalisation tokens a customer message may use (campaigns and
 * workflows). Filled per customer when sent, and with a sample customer
 * in previews.
 */
export const MESSAGE_TOKENS = {
  first_name: 'Customer first name',
  business_name: 'Business name',
} as const

export type MessageToken = keyof typeof MESSAGE_TOKENS

export type TokenValues = Record<MessageToken, string>

const TOKEN_PATTERN = /\{\{\s*([a-z_]+)\s*\}\}/g

/** Tokens in `body` that aren't supported — shown as a validation error. */
export function unknownTokens(body: string): string[] {
  const unknown = new Set<string>()
  for (const [, name] of body.matchAll(TOKEN_PATTERN)) {
    if (!(name in MESSAGE_TOKENS)) unknown.add(name)
  }
  return [...unknown]
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? ''
}

/** Replaces known tokens; unknown ones are left as typed so they're visible. */
export function personalize(body: string, values: TokenValues): string {
  return body.replace(TOKEN_PATTERN, (match, name: string) =>
    name in values ? values[name as MessageToken] : match,
  )
}
