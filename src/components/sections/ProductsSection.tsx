import SectionHeading from "@/components/SectionHeading";
import ProductCard, { type ClientProduct } from "@/components/ProductCard";

export default function ProductsSection({
  products,
}: {
  products: ClientProduct[];
}) {
  return (
    <section id="shop" className="bg-sand/50 py-4">
      <div className="section">
        <SectionHeading eyebrow="Shop" title="Products you can buy" />
        <p className="mx-auto mt-4 max-w-md text-center font-hand text-2xl text-ink/60">
          a little handwritten note: everything here is studio approved ✦
        </p>

        {products.length === 0 ? (
          <p className="mt-12 text-center text-ink/50">
            No products yet. Check back soon!
          </p>
        ) : (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
