import SectionHeading from "@/components/SectionHeading";
import type { Brand } from "@/lib/content";

export default function BrandsSection({ brands }: { brands: Brand[] }) {
  return (
    <section id="brands" className="bg-sand/50 py-4">
      <div className="section">
        <SectionHeading eyebrow="Trusted by" title="Brands we've worked with" />

        <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {brands.map((brand, i) => (
            <div
              key={brand.id}
              className="card-doodle flex flex-col items-center text-center"
              style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
            >
              <div className="flex h-16 w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-14 max-w-full object-contain"
                />
              </div>
              <h3 className="mt-3 font-hand text-2xl text-ink">{brand.name}</h3>
              {brand.description && (
                <p className="mt-0.5 text-xs text-ink/50">{brand.description}</p>
              )}
              <span className="mt-2 inline-block rounded-full bg-sage/15 px-3 py-1 text-xs font-semibold text-sage">
                {brand.engagement}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
