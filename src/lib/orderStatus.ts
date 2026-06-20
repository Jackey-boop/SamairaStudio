// Order status values. Stored as a String in SQLite (see prisma/schema.prisma).
// On Postgres this can be promoted to a native enum.

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PACKED: "PACKED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

// The happy-path pipeline shown in the customer-facing status stepper.
export const STATUS_PIPELINE: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

// Tailwind utility classes for the colour-coded pills.
export const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-stone-100 text-stone-600 border-stone-300",
  CONFIRMED: "bg-amber-100 text-amber-700 border-amber-300",
  PACKED: "bg-violet-100 text-violet-700 border-violet-300",
  SHIPPED: "bg-sky-100 text-sky-700 border-sky-300",
  DELIVERED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-300",
  REFUNDED: "bg-rose-50 text-rose-500 border-rose-200",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

// A friendly past-tense phrase used in status-update email subjects.
export const STATUS_EMAIL_PHRASE: Record<OrderStatus, string> = {
  PENDING: "received",
  CONFIRMED: "confirmed",
  PACKED: "packed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};
