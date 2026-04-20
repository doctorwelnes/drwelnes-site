import { existsSync } from "fs";
import { unlink } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getPrismaClient } from "@/lib/prisma";
import { getPublicDir } from "@/lib/project-root";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const { id } = await params;
    const { user: currentUser } = auth;

    if (currentUser.id === id) {
      return NextResponse.json(
        { error: "Нельзя удалить свой аккаунт из этого раздела" },
        { status: 400 },
      );
    }

    const prisma = getPrismaClient();
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        image: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    if (targetUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Нельзя удалить последнего администратора" },
          { status: 400 },
        );
      }
    }

    if (targetUser.image && targetUser.image.startsWith("/")) {
      const avatarPath = path.join(getPublicDir(), targetUser.image);
      if (existsSync(avatarPath)) {
        await unlink(avatarPath);
      }
    }

    const activeBookings = await prisma.workoutBooking.findMany({
      where: {
        userId: id,
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

      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "Пользователь удален" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Ошибка удаления пользователя: " + errorMessage },
      { status: 500 },
    );
  }
}
