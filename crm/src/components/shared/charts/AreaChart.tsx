import { useId, useState } from 'react'

export type AreaPoint = { label: string; value: number }

/**
 * Smooth area chart drawn in SVG — no chart library is selected yet
 * (docs/FRONTEND_ARCHITECTURE.md §2), so this keeps the dependency list
 * unchanged. Hovering a point shows its value. The full series is also
 * given as text to screen readers.
 */
export function AreaChart({
  points,
  formatValue = (v) => String(v),
  width = 640,
  height = 220,
  color = 'var(--brand-accent)',
}: {
  points: AreaPoint[]
  formatValue?: (value: number) => string
  /** Drawing width in SVG units; smaller values make the text larger relative to the chart. */
  width?: number
  height?: number
  color?: string
}) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const pad = { top: 24, right: 26, bottom: 28, left: 44 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(1, ...points.map((p) => p.value))
  const niceMax = niceCeil(max)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * niceMax)

  const x = (i: number) => pad.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => pad.top + innerH - (v / niceMax) * innerH
  const coords = points.map((p, i) => [x(i), y(p.value)] as const)
  const line = smoothPath(coords, pad.top + innerH)
  const area = coords.length > 0 ? `${line} L ${coords.at(-1)![0]} ${pad.top + innerH} L ${coords[0][0]} ${pad.top + innerH} Z` : ''
  const labelEvery = Math.max(1, Math.ceil(points.length / 8))

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-labelledby={`${id}-desc`}>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={t === 0 ? undefined : '3 4'} />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--muted-foreground)">
              {shortNumber(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text key={p.label} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
              {p.label}
            </text>
          ) : null,
        )}
        <path d={area} fill={`url(#${id}-fill)`} />
        <path d={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {coords.map(([cx, cy], i) => (
          <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <rect x={cx - innerW / Math.max(points.length, 1) / 2} y={pad.top} width={innerW / Math.max(points.length, 1)} height={innerH} fill="transparent" />
            <circle cx={cx} cy={cy} r={hover === i ? 6 : 4} fill="white" stroke={color} strokeWidth="2.5" />
          </g>
        ))}
        {hover !== null && coords[hover] && (
          <g pointerEvents="none" transform={`translate(${coords[hover][0]}, ${Math.max(coords[hover][1] - 14, 16)})`}>
            <rect x={-42} y={-30} width={84} height={30} rx={6} fill="var(--foreground)" />
            <text x={0} y={-17} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--background)">
              {formatValue(points[hover].value)}
            </text>
            <text x={0} y={-5} textAnchor="middle" fontSize="10" fill="var(--background)" opacity="0.8">
              {points[hover].label}
            </text>
          </g>
        )}
      </svg>
      <figcaption id={`${id}-desc`} className="sr-only">
        {points.map((p) => `${p.label}: ${formatValue(p.value)}`).join(', ')}
      </figcaption>
    </figure>
  )
}

/** Rounds up to a maximum whose quarters are round numbers (e.g. 2.4K → 600 steps, 2K → 500). */
function niceCeil(value: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= value) ?? 10
  return step * magnitude
}

function shortNumber(value: number): string {
  if (value >= 1000) return `${Math.round((value / 1000) * 10) / 10}K`
  return String(Math.round(value))
}

/**
 * Catmull-Rom style smoothing through every point. Control points are
 * clamped to the baseline so the curve never dips below zero between
 * points.
 */
function smoothPath(points: readonly (readonly [number, number])[], baseline: number): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`
  let d = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = Math.min(baseline, p1[1] + (p2[1] - p0[1]) / 6)
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = Math.min(baseline, p2[1] - (p3[1] - p1[1]) / 6)
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
  }
  return d
}
