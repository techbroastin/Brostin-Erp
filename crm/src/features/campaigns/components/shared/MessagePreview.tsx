import { MESSAGE_TOKENS } from '@/features/campaigns/utils/personalize'

/** How the message reads on a customer's phone — a chat bubble, not a real channel render. */
export function MessagePreview({ text, caption }: { text: string; caption?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-xl bg-muted/60 p-3">
        <p className="max-w-[85%] rounded-lg rounded-tl-none bg-background px-3 py-2 text-body-sm whitespace-pre-wrap shadow-sm">
          {text || <span className="text-muted-foreground">Your message will appear here.</span>}
        </p>
      </div>
      {caption && <p className="text-caption text-muted-foreground">{caption}</p>}
    </div>
  )
}

/** The supported placeholders, for the hint under a message box. */
export function TokenHint() {
  return (
    <p className="text-caption text-muted-foreground">
      Personalise with{' '}
      {Object.entries(MESSAGE_TOKENS).map(([token, label], i) => (
        <span key={token}>
          {i > 0 && ' and '}
          <code className="rounded bg-muted px-1 font-mono">{`{{${token}}}`}</code> ({label.toLowerCase()})
        </span>
      ))}
      .
    </p>
  )
}
