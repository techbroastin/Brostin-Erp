import type { OrderType } from '@/features/orders/types/order'

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dining: 'Dine In',
  takeaway: 'Take Away',
  delivery: 'Delivery',
}

export function rupees(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`
}

export function minutesAgo(iso: string, now: number): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}
