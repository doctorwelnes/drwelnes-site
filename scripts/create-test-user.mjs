// Simple Node.js script to create test user
// Run: node scripts/create-test-user.mjs (after installing bcryptjs)

import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "test123";
const TEST_NAME = "Тестовый Пользователь";

async function main() {
  console.log("🔧 Creating test user...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Check if test user already exists
    const checkResult = await pool.query(
      "SELECT id FROM \"User\" WHERE email = $1",
      [TEST_EMAIL]
    );

    if (checkResult.rows.length > 0) {
      console.log("✅ Test user already exists!");
      console.log(`📧 Email: ${TEST_EMAIL}`);
      console.log(`🔑 Password: ${TEST_PASSWORD}`);
      return;
    }

    // Create test user with hashed password
    const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

    const insertResult = await pool.query(
      `INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, 'CLIENT', NOW(), NOW())
       RETURNING id, email`,
      [TEST_EMAIL, TEST_NAME, passwordHash]
    );

    console.log("✅ Test user created successfully!");
    console.log(`📧 Email: ${TEST_EMAIL}`);
    console.log(`🔑 Password: ${TEST_PASSWORD}`);
    console.log(`👤 User ID: ${insertResult.rows[0].id}`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
