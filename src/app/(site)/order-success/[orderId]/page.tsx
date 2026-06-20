import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPaise } from "@/lib/money";
import { parseAddress, formatAddress } from "@/lib/orders";
import DoodleEnvelope from "@/components/DoodleEnvelope";
import DoodleStar from "@/components/DoodleStar";
import Squiggle from "@/components/Squiggle";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: { items: true },
  });

  if (!order) notFound();

  const address = parseAddress(order.address);

  return (
    <div className="section max-w-3xl">
      <div className="flex flex-col items-center text-center">
        <DoodleEnvelope className="flex justify-center" />
        <DoodleStar size="md" className="mt-2" />
        <h1 className="mt-4 font-hand text-5xl text-ink sm:text-6xl">
          Thank you!
        </h1>
        <div className="mt-1">
          <Squiggle width={220} />
        </div>
        <p className="mt-4 max-w-md text-ink/70">
          Your order is confirmed and we’re already getting it ready. A receipt
          is on its way to your inbox.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-ink/10 bg-white p-6 shadow-doodle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/40">
              Order ID
            </p>
            <p className="font-mono text-sm font-semibold">{order.id}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Confirmed
          </span>
        </div>

        <ul className="mt-5 space-y-3 border-t border-ink/10 pt-5">
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

        <div className="mt-5 flex justify-between border-t border-ink/10 pt-4 text-lg font-bold">
          <span>Total paid</span>
          <span className="text-coral">{formatPaise(order.total)}</span>
        </div>

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

        <Link href={`/orders/${order.id}`} className="btn-coral mt-6 w-full">
          Track your order →
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-ink/50">
        <Link href="/#shop" className="font-semibold hover:text-coral">
          Continue shopping
        </Link>
      </p>
    </div>
  );
}
