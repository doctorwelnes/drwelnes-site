import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load from .env.local specifically
config({ path: ".env.local" });

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in environment!");
  console.error("   Make sure .env.local exists with DATABASE_URL=postgresql://...");
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
