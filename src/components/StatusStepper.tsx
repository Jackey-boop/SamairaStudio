import {
  STATUS_PIPELINE,
  STATUS_LABELS,
  type OrderStatus,
} from "@/lib/orderStatus";

export default function StatusStepper({ status }: { status: OrderStatus }) {
  // Cancelled / refunded sit outside the happy-path pipeline.
  if (status === "CANCELLED" || status === "REFUNDED") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
        <p className="font-hand text-3xl text-rose-600">
          Order {STATUS_LABELS[status].toLowerCase()}
        </p>
        <p className="mt-1 text-sm text-rose-500">
          {status === "REFUNDED"
            ? "Your refund has been processed."
            : "This order was cancelled. Reach out if you need help."}
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_PIPELINE.indexOf(status);

  return (
    <div className="flex items-start justify-between">
      {STATUS_PIPELINE.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="relative flex flex-1 flex-col items-center">
            {/* connector line (not under the first dot) */}
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-4 -z-0 h-0.5 w-full ${
                  i <= currentIndex ? "bg-coral" : "bg-ink/15"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                done
                  ? "border-coral bg-coral text-white"
                  : "border-ink/20 bg-white text-ink/30"
              } ${isCurrent ? "ring-4 ring-coral/20" : ""}`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span
              className={`mt-2 text-center text-xs font-semibold sm:text-sm ${
                done ? "text-ink" : "text-ink/40"
              }`}
            >
              {STATUS_LABELS[step]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
