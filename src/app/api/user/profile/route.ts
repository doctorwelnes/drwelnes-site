import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getPrismaClient } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";

export async function PATCH(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const { user } = auth;

    const body = await req.json();

    // Validate request body
    const validation = validateRequest(updateProfileSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { name, phone, telegram } = validation.data;

    const prisma = getPrismaClient();

    // Update user profile by id
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
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
