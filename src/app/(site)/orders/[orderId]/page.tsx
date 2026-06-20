import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPaise } from "@/lib/money";
import { parseAddress, formatAddress } from "@/lib/orders";
import {
  isOrderStatus,
  STATUS_LABELS,
  STATUS_COLORS,
  type OrderStatus,
} from "@/lib/orderStatus";
import StatusStepper from "@/components/StatusStepper";
import SectionHeading from "@/components/SectionHeading";

export const dynamic = "force-dynamic";

export default async function OrderTrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });

  if (!order) notFound();

  const status: OrderStatus = isOrderStatus(order.status)
    ? order.status
    : "PENDING";
  const address = parseAddress(order.address);

  const estDelivery = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="section max-w-3xl">
      <SectionHeading eyebrow="Order tracking" title="Where's my order?" />

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Order ID
            </p>
            <p className="font-mono text-sm font-semibold">{order.id}</p>
          </div>
          <span className={`status-pill ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="mt-8">
          <StatusStepper status={status} />
        </div>

        {/* Shipping / tracking details */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <InfoBox label="Courier" value={order.courierName || "Not assigned yet"} />
          <InfoBox
            label="Tracking number"
            value={order.trackingNumber || "Available once shipped"}
          />
          <InfoBox
            label="Estimated delivery"
            value={estDelivery || "Being calculated"}
          />
          <InfoBox label="Order total" value={formatPaise(order.total)} />
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle">
        <h2 className="font-hand text-3xl text-ink">Your items</h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-ink/50">Qty {item.quantity}</p>
              </div>
              <span className="font-semibold">
                {formatPaise(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl bg-cream p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
            Delivering to
          </p>
          <p className="mt-1 text-sm">
            {order.customerName}
            <br />
            {formatAddress(address)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink/50">
        Looking for a different order?{" "}
        <Link href="/track" className="font-semibold hover:text-coral">
          Look it up here
        </Link>
      </p>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
