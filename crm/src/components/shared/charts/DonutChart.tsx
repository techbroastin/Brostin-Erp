import { useId } from 'react'

export type DonutSlice = { label: string; value: number; color: string }

/**
 * Donut chart with a centre label and a legend (count and share), drawn
 * in SVG. The legend carries the numbers, so colour is never the only cue.
 */
export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  formatValue = (v) => String(v),
}: {
  slices: DonutSlice[]
  centerValue: string
  centerLabel: string
  formatValue?: (value: number) => string
}) {
  const id = useId()
  const total = slices.reduce((sum, s) => sum + s.value, 0)
  const r = 42
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
      <svg viewBox="0 0 120 120" className="size-32 shrink-0 -rotate-90" role="img" aria-labelledby={`${id}-desc`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="18" />
        {total > 0 &&
          slices.map((s) => {
            const length = (s.value / total) * circumference
            const dash = `${Math.max(length - 1.5, 0)} ${circumference}`
            const el = (
              <circle
                key={s.label}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="18"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            )
            offset += length
            return el
          })}
        <g className="rotate-90" style={{ transformOrigin: '60px 60px' }}>
          <text x="60" y="58" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--foreground)">
            {centerValue}
          </text>
          <text x="60" y="74" textAnchor="middle" fontSize="10" fill="var(--muted-foreground)">
            {centerLabel}
          </text>
        </g>
      </svg>
      <ul id={`${id}-desc`} className="flex min-w-[11rem] flex-1 flex-col gap-2 text-body-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="font-semibold">{formatValue(s.value)}</span>
            <span className="w-10 text-right text-muted-foreground">
              {total > 0 ? `${Math.round((s.value / total) * 100)}%` : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
