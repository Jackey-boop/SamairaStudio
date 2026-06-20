import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Prices are in paise (₹1 = 100 paise).
const PRODUCTS = [
  {
    name: "Studio Signature Hoodie",
    description: "Heavyweight cotton hoodie with a tiny embroidered star.",
    price: 249900,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80",
    stock: 30,
  },
  {
    name: "Everyday Tote Bag",
    description: "Roomy canvas tote for cameras, snacks and big ideas.",
    price: 69900,
    image:
      "https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&q=80",
    stock: 50,
  },
  {
    name: "Doodle Sticker Pack",
    description: "A set of 12 hand-drawn vinyl stickers.",
    price: 19900,
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80",
    stock: 200,
  },
  {
    name: "Enamel Pin Set",
    description: "Three little coral enamel pins for your favourite jacket.",
    price: 39900,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80",
    stock: 80,
  },
  {
    name: "Ideas Notebook",
    description: "Dotted-grid notebook with a warm off-white paper feel.",
    price: 44900,
    image:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80",
    stock: 60,
  },
  {
    name: "Studio Coffee Mug",
    description: "Chunky ceramic mug for long editing sessions.",
    price: 59900,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
    stock: 0,
  },
];

async function main() {
  console.log("Seeding products...");
  await prisma.product.deleteMany();
  for (const p of PRODUCTS) {
    await prisma.product.create({ data: p });
  }
  console.log(`Seeded ${PRODUCTS.length} products ✦`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
