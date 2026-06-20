import Hero from "@/components/sections/Hero";
import ReelsSection from "@/components/sections/ReelsSection";
import BrandsSection from "@/components/sections/BrandsSection";
import ContactSection from "@/components/sections/ContactSection";
import ProductsSection from "@/components/sections/ProductsSection";
import { getContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";

// Always render fresh so admin edits (products / content) show up immediately.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [content, products] = await Promise.all([
    getContent(),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const clientProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    stock: p.stock,
  }));

  return (
    <>
      <Hero studio={content.studio} />
      <ReelsSection reels={content.reels} />
      <BrandsSection brands={content.brands} />
      <ContactSection />
      <ProductsSection products={clientProducts} />
    </>
  );
}
