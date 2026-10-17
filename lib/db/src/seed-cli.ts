import { db } from "./index";
import { seedDatabase } from "./seed";

async function main() {
  console.log("Seeding database with sample records...");
  await seedDatabase(db);
  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
