import { config } from "dotenv";
import pg from "pg";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });

const { Pool } = pg;

async function createTestUser() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', ["test@test.com"]);

    const hashedPassword = await bcrypt.hash("test123", 10);

    if (existing.rowCount > 0) {
      // Reset existing user
      await pool.query(
        `
        UPDATE "User" 
        SET name = 'Тестовый Пользователь',
            "passwordHash" = $1,
            image = NULL,
            phone = NULL,
            role = 'CLIENT'
        WHERE email = 'test@test.com'
      `,
        [hashedPassword],
      );
      console.log("✅ Тестовый пользователь сброшен");
    } else {
      // Create new user
      await pool.query(
        `
        INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Тестовый Пользователь', 'test@test.com', $1, 'CLIENT', NOW(), NOW())
      `,
        [hashedPassword],
      );
      console.log("✅ Тестовый пользователь создан");
    }

    console.log("");
    console.log("📧 Email: test@test.com");
    console.log("🔑 Пароль: test123");
    console.log("👤 Имя: Тестовый Пользователь");
    console.log("");
    console.log("📝 Данные для входа на странице /login");
  } catch (error) {
    console.error("❌ Ошибка:", error);
  } finally {
    await pool.end();
  }
}

createTestUser();
