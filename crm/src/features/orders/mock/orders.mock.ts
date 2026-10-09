import type {
  Order,
  OrderItemLine,
  OrderType,
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@/features/orders/types/order'

/**
 * Orders mock data — the single feature-local mock source, per
 * docs/FRONTEND_ARCHITECTURE.md §6/§16. Three scenarios: normal, empty,
 * error. Only src/features/orders/services/orderService.ts may import
 * this file.
 *
 * Illustrative placeholders only — not real orders, not final business
 * definitions. See DemoDataBadge wherever this data renders.
 *
 * Customer names/ids/phones are reproduced exactly from
 * src/features/customers/mock/customers.mock.ts (same formula) so an
 * order's customer and the Customers list stay internally consistent —
 * docs/FRONTEND_ARCHITECTURE.md §16: "a customer's orders... must agree."
 */

const CUSTOMER_NAMES = [
  'Arjun Menon',
  'Divya Pillai',
  'Mohammed Rafiq',
  'Fathima Noor',
  'Sreekutty S',
  'Rahul Varma',
  'Anjali Nair',
  'Vishnu Prasad',
  'Meera Krishnan',
  'Suhail Ahmed',
  'Lakshmi Priya',
  'Nikhil Thomas',
  'Ayesha Beevi',
  'Kiran Kumar',
  'Devika Suresh',
  'Jithin Joseph',
  'Sana Hassan',
  'Ravi Shankar',
  'Parvathy Mohan',
  'Abdul Kareem',
  'Nandini Raj',
  'Sachin Babu',
  'Reshma Latheef',
  'Vineeth Chandran',
  'Haritha Vijayan',
]

function customerIdFor(index: number) {
  return `cust-${String(index + 1).padStart(3, '0')}`
}

function customerPhoneFor(index: number) {
  return `+91 9${String(700000000 + index * 137).slice(0, 9)}`
}

// Menu categories reproduced from CLAUDE.md §11 (approved provisional menu
// reference) — not invented product names.
const PRODUCTS: { name: string; price: number }[] = [
  { name: 'Broasted Chicken (2pc)', price: 199 },
  { name: 'Classic Broaster Burger', price: 149 },
  { name: 'Peri Peri Wrap', price: 169 },
  { name: 'Chicken Strips (5pc)', price: 179 },
  { name: 'Alfaham Half', price: 249 },
  { name: 'Family Sharing Feast', price: 599 },
  { name: 'Cheese Add-on', price: 29 },
  { name: 'Masala Cola', price: 49 },
]

const ORDER_TYPES: OrderType[] = ['takeaway', 'delivery', 'dining']
const SOURCES: OrderSource[] = ['qr', 'web']
const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'upi']
const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'cancelled']
const STATUSES: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'outForDelivery',
  'delivered',
  'completed',
  'cancelled',
]

function buildItems(seed: number): OrderItemLine[] {
  const count = (seed % 3) + 1
  const items: OrderItemLine[] = []
  for (let i = 0; i < count; i++) {
    const product = PRODUCTS[(seed + i) % PRODUCTS.length]
    const quantity = ((seed + i) % 2) + 1
    items.push({
      id: `item-${seed}-${i}`,
      productName: product.name,
      variantName: null,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    })
  }
  return items
}

function buildOrder(orderIndex: number, customerIndex: number): Order {
  const items = buildItems(orderIndex)
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
  const orderType = ORDER_TYPES[orderIndex % ORDER_TYPES.length]
  const deliveryCharge = orderType === 'delivery' ? 40 : 0
  const discount = 0 // orders.discount is forced to 0 by an existing DB constraint
  const grandTotal = subtotal + deliveryCharge - discount
  const daysAgo = (orderIndex % 12) * 1 + 0
  const hoursAgo = (orderIndex % 24) * 1

  return {
    id: `ord-${String(orderIndex + 1).padStart(3, '0')}`,
    orderNumber: `BR-${1040 + orderIndex}`,
    customerId: customerIdFor(customerIndex),
    customerName: CUSTOMER_NAMES[customerIndex],
    customerPhone: customerPhoneFor(customerIndex),
    orderType,
    source: SOURCES[orderIndex % SOURCES.length],
    status: STATUSES[orderIndex % STATUSES.length],
    paymentMethod: PAYMENT_METHODS[orderIndex % PAYMENT_METHODS.length],
    paymentStatus: PAYMENT_STATUSES[orderIndex % PAYMENT_STATUSES.length],
    paymentReference: orderIndex % 2 === 0 ? `PAY-${9000 + orderIndex}` : null,
    subtotal,
    deliveryCharge,
    discount,
    grandTotal,
    createdAt: new Date(Date.now() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000).toISOString(),
    items,
    deliveryAddress:
      orderType === 'delivery'
        ? {
            line: `${12 + orderIndex}, Palm Residency`,
            area: 'Edappally',
            landmark: orderIndex % 3 === 0 ? 'Near Lulu Mall' : null,
          }
        : null,
  }
}

function buildOrders(): Order[] {
  // Only customers with orders in customers.mock.ts (every 5th has none —
  // index % 5 !== 4) are used here, for internal consistency.
  const customerIndicesWithOrders = CUSTOMER_NAMES.map((_, i) => i).filter((i) => i % 5 !== 4)
  const orders: Order[] = customerIndicesWithOrders.map((customerIndex, orderIndex) =>
    buildOrder(orderIndex, customerIndex),
  )
  // Add a few repeat orders for the first customers to land in the
  // approved 20–25 range (20 unique customers + 4 repeats = 24 orders).
  for (let i = 0; i < 4; i++) {
    orders.push(buildOrder(orders.length, customerIndicesWithOrders[i]))
  }
  return orders
}

export const normalOrders: Order[] = buildOrders()

export const emptyOrders: Order[] = []

/**
 * Not a data scenario — a sentinel orderService checks for to throw a
 * simulated failure, exercising OrderErrorState.
 */
export const ERROR_SCENARIO_FLAG = 'error'

export type OrderMockScenario = 'normal' | 'empty' | typeof ERROR_SCENARIO_FLAG
