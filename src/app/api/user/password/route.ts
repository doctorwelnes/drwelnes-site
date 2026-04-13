import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { updatePasswordSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";

export async function PATCH(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validation = validateRequest(updatePasswordSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { currentPassword, newPassword } = validation.data;

    const prisma = getPrismaClient();

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Пользователь не найден или не имеет пароля" },
        { status: 400 },
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Неверный текущий пароль" }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Пароль успешно изменен",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Ошибка смены пароля: " + errorMessage }, { status: 500 });
  }
}
