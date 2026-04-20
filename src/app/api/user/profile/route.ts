import { existsSync } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getPrismaClient } from "@/lib/prisma";
import { getPublicDir } from "@/lib/project-root";
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

export async function DELETE(req: NextRequest) {
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const { user } = auth;
    const prisma = getPrismaClient();

    if (user.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Нельзя удалить последнего администратора" },
          { status: 400 },
        );
      }
    }

    if (user.image && user.image.startsWith("/")) {
      const avatarPath = path.join(getPublicDir(), user.image);
      if (existsSync(avatarPath)) {
        await unlink(avatarPath);
      }
    }

    const activeBookings = await prisma.workoutBooking.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
      select: {
        slotId: true,
      },
    });

    const bookingsBySlot = activeBookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.slotId] = (acc[booking.slotId] || 0) + 1;
      return acc;
    }, {});

    await prisma.$transaction(async (tx) => {
      const slotIds = Object.keys(bookingsBySlot);

      if (slotIds.length > 0) {
        const slots = await tx.workoutSlot.findMany({
          where: {
            id: {
              in: slotIds,
            },
          },
          select: {
            id: true,
            currentParticipants: true,
            maxParticipants: true,
          },
        });

        for (const slot of slots) {
          const decrement = bookingsBySlot[slot.id] || 0;
          const newParticipantCount = Math.max(0, (slot.currentParticipants || 0) - decrement);
          const newStatus =
            newParticipantCount >= (slot.maxParticipants || 0) ? "FULL" : "AVAILABLE";

          await tx.workoutSlot.update({
            where: { id: slot.id },
            data: {
              currentParticipants: newParticipantCount,
              status: newStatus,
            },
          });
        }
      }

      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({ success: true, message: "Профиль удален" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Ошибка удаления профиля: " + errorMessage },
      { status: 500 },
    );
  }
}
