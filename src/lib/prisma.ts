import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // During build phase (next build), DATABASE_URL may not be available.
    // Return a proxy that throws only when actually used at runtime.
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === "then" || prop === Symbol.toPrimitive) return undefined;
        throw new Error(`DATABASE_URL must be set. Attempted to access prisma.${String(prop)}`);
      },
    });
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Cache in all environments to prevent connection pool leaks
  globalForPrisma.prisma = prisma;

  return prisma;
}
