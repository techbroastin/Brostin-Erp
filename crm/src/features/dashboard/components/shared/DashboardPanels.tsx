import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** White rounded panel used across the desktop dashboard (reference style). */
export function Panel({
  title,
  action,
  children,
  className,
  titleClassName,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
  titleClassName?: string
}) {
  return (
    <section className={cn('flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-[0_1px_3px_rgba(16,24,40,0.06)]', className)}>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
        <h2 className={cn('text-card-title font-bold whitespace-nowrap', titleClassName)}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
