import { db } from "./lib/db.ts";
import { categories } from "./lib/schema.ts";

const initialCategories = [
  { name: "Tops", slug: "tops" },
  { name: "Bottoms", slug: "bottoms" },
  { name: "Outerwear", slug: "outerwear" },
  { name: "Accessories", slug: "accessories" },
  { name: "Poleras", slug: "poleras" },
  { name: "Polerones", slug: "polerones" },
  { name: "Buzos", slug: "buzos" },
  { name: "Conjuntos", slug: "conjuntos" },
  { name: "Faldas", slug: "faldas" },
  { name: "Accesorios", slug: "accesorios" }
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of initialCategories) {
    try {
      await db.insert(categories).values(cat);
      console.log(`Inserted ${cat.name}`);
    } catch (e: any) {
      if (e.code === '23505') {
        console.log(`Category ${cat.name} already exists. Skipping.`);
      } else {
        console.error(`Error inserting ${cat.name}:`, e);
      }
    }
  }
  console.log("Done.");
  process.exit(0);
}

seed();
