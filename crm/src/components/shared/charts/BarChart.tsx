import { useId } from 'react'

export type BarPoint = { label: string; value: number }

/** Simple vertical bar chart in SVG; each bar's value shows on hover (title) and to screen readers. */
export function BarChart({ points, color = 'var(--info)', height = 150 }: { points: BarPoint[]; color?: string; height?: number }) {
  const id = useId()
  const width = 230
  const pad = { top: 8, bottom: 22 }
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(1, ...points.map((p) => p.value))
  const slot = width / Math.max(points.length, 1)
  const barW = Math.min(26, slot * 0.55)

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-labelledby={`${id}-desc`}>
        <line x1="0" x2={width} y1={pad.top + innerH} y2={pad.top + innerH} stroke="var(--border)" />
        {points.map((p, i) => {
          const h = (p.value / max) * innerH
          const x = i * slot + (slot - barW) / 2
          return (
            <g key={p.label}>
              <rect x={x} y={pad.top + innerH - h} width={barW} height={Math.max(h, p.value > 0 ? 2 : 0)} rx="4" fill={color} opacity="0.85">
                <title>{`${p.label}: ${p.value}`}</title>
              </rect>
              <text x={x + barW / 2} y={height - 6} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
                {p.label}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption id={`${id}-desc`} className="sr-only">
        {points.map((p) => `${p.label}: ${p.value}`).join(', ')}
      </figcaption>
    </figure>
  )
}
