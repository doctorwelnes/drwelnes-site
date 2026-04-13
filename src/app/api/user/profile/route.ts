import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validation";
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
    const validation = validateRequest(updateProfileSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { name, email, phone, telegram } = validation.data;

    const prisma = getPrismaClient();

    // Get current user by email to get their ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Email уже используется" }, { status: 400 });
      }
    }

    // Update user profile by ID (not email, because email might change)
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(telegram !== undefined && { telegram }),
      },
    });

    const updatedUserWithTelegram = updatedUser as typeof updatedUser & {
      telegram?: string | null;
    };

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUserWithTelegram.id,
        name: updatedUserWithTelegram.name,
        email: updatedUserWithTelegram.email,
        phone: updatedUserWithTelegram.phone,
        telegram: updatedUserWithTelegram.telegram,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Ошибка обновления профиля: " + errorMessage },
      { status: 500 },
    );
  }
}
