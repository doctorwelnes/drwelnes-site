import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as fs from "fs";

const databaseUrl = process.env.DATABASE_URL;

async function main() {
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    return;
  }
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany();
  console.log("USERS_START");
  console.log(JSON.stringify(users, null, 2));
  console.log("USERS_END");

  await prisma.$disconnect();
}

main().catch(console.error);
