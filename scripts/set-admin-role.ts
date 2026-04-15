/**
 * Script to set ADMIN role for a user in the local database
 * Run with: npx tsx scripts/set-admin-role.ts <email>
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setAdminRole(email: string) {
  try {
    console.log(`Setting ADMIN role for user: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email}), current role: ${user.role}`);

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ User role updated to ADMIN: ${updated.name} (${updated.email})`);
  } catch (error) {
    console.error("Error updating user role:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Please provide an email address");
  console.log("Usage: npx tsx scripts/set-admin-role.ts <email>");
  process.exit(1);
}

setAdminRole(email);
