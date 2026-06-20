"use client";

import { useState } from "react";
import { useCart } from "@/lib/store";
import { formatPaise } from "@/lib/money";

export interface ClientProduct {
  id: string;
  name: string;
  description: string | null;
  price: number; // paise
  image: string;
  stock: number;
}

export default function ProductCard({
  product,
  index = 0,
}: {
  product: ClientProduct;
  index?: number;
}) {
  const addItem = useCart((s) => s.addItem);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className="card-doodle flex flex-col p-0 overflow-hidden"
      style={{ transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)` }}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-sand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-hand text-2xl text-ink">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">
            {product.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-ink">
            {formatPaise(product.price)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={added ? "btn-coral !bg-sage" : "btn-coral"}
          >
            {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
