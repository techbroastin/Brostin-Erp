/**
 * Orders feature types — provisional frontend view models, not the
 * Broastin standard data model (NOT YET FINALIZED per
 * docs/FRONTEND_ARCHITECTURE.md §16).
 *
 * orderNumber/customerId/customerName/customerPhone/orderType/source/
 * status/paymentMethod/paymentStatus/subtotal/deliveryCharge/discount/
 * grandTotal/createdAt/items all map to existing public.orders /
 * public.order_items / public.customers Supabase columns (confirmed live,
 * Phase 5 discovery). Delivery address fields map to orders' existing
 * delivery_address_snapshot/lat/lng/instructions columns, populated only
 * for delivery orders.
 */

export type OrderType = 'takeaway' | 'delivery' | 'dining'
export type OrderSource = 'qr' | 'web'
export type PaymentMethod = 'cash' | 'upi'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'outForDelivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type OrderItemLine = {
  id: string
  productName: string
  variantName: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type DeliveryAddress = {
  line: string
  area: string
  landmark: string | null
}

export type Order = {
  id: string
  orderNumber: string
  customerId: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  source: OrderSource
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReference: string | null
  subtotal: number
  deliveryCharge: number
  discount: number
  grandTotal: number
  createdAt: string
  items: OrderItemLine[]
  /** Populated only when orderType === 'delivery'. */
  deliveryAddress: DeliveryAddress | null
}

export type OrderSortBy = 'createdAt' | 'grandTotal'

export type OrderListParams = {
  search: string
  status: OrderStatus | 'all'
  source: OrderSource | 'all'
  page: number
  pageSize: number
  sortBy: OrderSortBy
}

export type OrderListResult = {
  items: Order[]
  total: number
}
