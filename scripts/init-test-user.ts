// Script to create test user
// Run this with: npx ts-node scripts/init-test-user.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "test123";
const TEST_NAME = "Тестовый Пользователь";

async function main() {
  console.log("🔧 Initializing test user...");

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: TEST_EMAIL },
  });

  if (existingUser) {
    console.log("✅ Test user already exists!");
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);
    return;
  }

  // Create test user
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      email: TEST_EMAIL,
      name: TEST_NAME,
      passwordHash,
      role: "CLIENT",
    },
  });

  console.log("✅ Test user created successfully!");
  console.log(`📧 Email: ${TEST_EMAIL}`);
  console.log(`🔑 Password: ${TEST_PASSWORD}`);
  console.log(`👤 User ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error creating test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
