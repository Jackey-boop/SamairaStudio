import type { Order } from "@prisma/client";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export function serializeAddress(address: ShippingAddress): string {
  return JSON.stringify(address);
}

export function parseAddress(raw: string): ShippingAddress {
  try {
    const parsed = JSON.parse(raw) as Partial<ShippingAddress>;
    return {
      line1: parsed.line1 ?? "",
      line2: parsed.line2 ?? "",
      city: parsed.city ?? "",
      state: parsed.state ?? "",
      pincode: parsed.pincode ?? "",
    };
  } catch {
    return { line1: "", line2: "", city: "", state: "", pincode: "" };
  }
}

export function formatAddress(address: ShippingAddress): string {
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");
}

// Strip sensitive payment fields before returning an order to the public
// (customer tracking page / public API).
export function toPublicOrder(
  order: Order & { items?: unknown[] }
) {
  const { razorpayPaymentId, razorpayOrderId, ...rest } = order;
  return {
    ...rest,
    address: parseAddress(order.address),
  };
}
