// All money is stored and handled in paise (₹1 = 100 paise) to match
// Razorpay and to avoid floating-point rounding issues.

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Shipping: free over ₹999, otherwise a flat ₹49. Shared by the
// checkout UI and the server so the displayed total always matches the
// amount charged.
export const FREE_SHIPPING_THRESHOLD = 99900; // paise (₹999)
export const FLAT_SHIPPING = 4900; // paise (₹49)

export function computeShipping(subtotalPaise: number): number {
  if (subtotalPaise <= 0) return 0;
  return subtotalPaise >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

// Format paise as a clean Indian-rupee string, e.g. 149900 -> "₹1,499".
export function formatPaise(paise: number): string {
  const rupees = paiseToRupees(paise);
  const hasFraction = !Number.isInteger(rupees);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
