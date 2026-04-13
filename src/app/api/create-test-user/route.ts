import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getPrismaClient } from "@/lib/prisma";

// Test account credentials - simple and easy to remember
const TEST_EMAIL = "test@test.com";
const TEST_PASSWORD = "test123";
const TEST_NAME = "Тестовый Пользователь";

export async function POST() {
  try {
    const prisma = getPrismaClient();

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_EMAIL },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Тестовый аккаунт уже существует",
        credentials: {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
      });
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

    return NextResponse.json({
      success: true,
      message: "Тестовый аккаунт успешно создан",
      credentials: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Ошибка при создании тестового аккаунта",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
