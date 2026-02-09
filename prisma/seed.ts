import { PrismaClient, StockLedgerType } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  template: "supermarket" | "clothes" | "medicines";
  category: string;
  brand?: string;
  unitPriceCents: number;
  onHand: number;
  reorderLevel: number;
};

const demoCatalog: SeedProduct[] = [
  {
    name: "Organic Bananas",
    slug: "organic-bananas",
    sku: "SUP-BAN-001",
    description: "Fresh organic bananas sold per bunch.",
    template: "supermarket",
    category: "fruits",
    brand: "Farm Fresh",
    unitPriceCents: 299,
    onHand: 120,
    reorderLevel: 25
  },
  {
    name: "Whole Wheat Bread",
    slug: "whole-wheat-bread",
    sku: "SUP-BRD-010",
    description: "Baked daily with 100% whole wheat flour.",
    template: "supermarket",
    category: "bakery",
    brand: "Daily Loaf",
    unitPriceCents: 349,
    onHand: 80,
    reorderLevel: 20
  },
  {
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    sku: "CLT-JKT-101",
    description: "Unisex mid-wash denim jacket.",
    template: "clothes",
    category: "outerwear",
    brand: "Northline",
    unitPriceCents: 6999,
    onHand: 35,
    reorderLevel: 10
  },
  {
    name: "Cotton Crew T-Shirt",
    slug: "cotton-crew-tshirt",
    sku: "CLT-TSH-205",
    description: "Soft cotton t-shirt for everyday wear.",
    template: "clothes",
    category: "tops",
    brand: "Threadline",
    unitPriceCents: 1999,
    onHand: 140,
    reorderLevel: 30
  },
  {
    name: "Paracetamol 500mg",
    slug: "paracetamol-500mg",
    sku: "MED-PAR-500",
    description: "Pain relief tablets, 15 count.",
    template: "medicines",
    category: "pain-relief",
    brand: "MediSure",
    unitPriceCents: 599,
    onHand: 260,
    reorderLevel: 60
  },
  {
    name: "Vitamin C Effervescent",
    slug: "vitamin-c-effervescent",
    sku: "MED-VIT-100",
    description: "Immunity support tablets, orange flavor.",
    template: "medicines",
    category: "supplements",
    brand: "NutriCare",
    unitPriceCents: 1299,
    onHand: 95,
    reorderLevel: 25
  }
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@shop.local" },
    update: { name: "Demo Shopper", phone: "+1-555-0100" },
    create: {
      email: "demo@shop.local",
      name: "Demo Shopper",
      phone: "+1-555-0100"
    }
  });

  await prisma.address.upsert({
    where: { id: "demo-address-home" },
    update: {},
    create: {
      id: "demo-address-home",
      userId: user.id,
      line1: "500 Market St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "US"
    }
  });

  for (const product of demoCatalog) {
    const savedProduct = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        template: product.template,
        category: product.category,
        brand: product.brand,
        unitPriceCents: product.unitPriceCents,
        isActive: true
      },
      create: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        template: product.template,
        category: product.category,
        brand: product.brand,
        unitPriceCents: product.unitPriceCents,
        isActive: true
      }
    });

    const inventory = await prisma.inventoryItem.upsert({
      where: { productId: savedProduct.id },
      update: {
        onHand: product.onHand,
        reorderLevel: product.reorderLevel
      },
      create: {
        productId: savedProduct.id,
        onHand: product.onHand,
        reorderLevel: product.reorderLevel
      }
    });

    await prisma.stockLedger.create({
      data: {
        inventoryItemId: inventory.id,
        type: StockLedgerType.RESTOCK,
        quantityDelta: product.onHand,
        reason: "Initial seed stock"
      }
    });
  }

  console.log(`Seeded ${demoCatalog.length} products across templates.`);
}

main()
  .catch((error) => {
    console.error("Seeding failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
