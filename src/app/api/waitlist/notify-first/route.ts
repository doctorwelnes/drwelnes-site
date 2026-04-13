import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const WAITLIST_NOTIFICATION_TTL_MS = 15 * 60 * 1000;

async function expireStaleNotifiedEntries(slotId: string) {
  const prisma = getPrismaClient();
  const expiredBefore = new Date(Date.now() - WAITLIST_NOTIFICATION_TTL_MS);

  const staleEntries = await prisma.waitlist.findMany({
    where: {
      slotId,
      status: "NOTIFIED",
      notifiedAt: { lt: expiredBefore },
    },
    select: {
      id: true,
    },
  });

  if (staleEntries.length === 0) return;

  await Promise.all(
    staleEntries.map((entry) =>
      prisma.waitlist.update({
        where: { id: entry.id },
        data: { status: "EXPIRED" },
      }),
    ),
  );

  await recalculatePositions(slotId);
}

// POST - Уведомить первого в очереди и предложить место
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId } = body;

    if (!slotId) {
      return NextResponse.json({ error: "slotId is required" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    await expireStaleNotifiedEntries(slotId);

    // Находим первого в очереди
    const firstInQueue = await prisma.waitlist.findFirst({
      where: {
        slotId,
        status: "WAITING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        slot: true,
      },
      orderBy: { position: "asc" },
    });

    if (!firstInQueue) {
      return NextResponse.json({ message: "No one in waitlist" }, { status: 200 });
    }

    // Обновляем статус на NOTIFIED
    const updatedEntry = await prisma.waitlist.update({
      where: { id: firstInQueue.id },
      data: {
        status: "NOTIFIED",
        notifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        slot: true,
      },
    });

    // TODO: Здесь можно добавить отправку email/SMS уведомления
    // await sendNotificationEmail(updatedEntry.user.email, updatedEntry.slot);

    return NextResponse.json({
      message: "First in queue notified",
      notifiedUser: updatedEntry,
    });
  } catch (error) {
    console.error("Error notifying first in queue:", error);
    return NextResponse.json({ error: "Failed to notify first in queue" }, { status: 500 });
  }
}

// PUT - Принять предложение места из очереди
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, userId } = body;

    if (!entryId || !userId) {
      return NextResponse.json({ error: "entryId and userId are required" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    // Находим запись в очереди
    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: entryId },
      include: {
        slot: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!waitlistEntry) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }

    if (waitlistEntry.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (waitlistEntry.status !== "NOTIFIED") {
      return NextResponse.json({ error: "Entry is not in notified status" }, { status: 400 });
    }

    await expireStaleNotifiedEntries(waitlistEntry.slotId);

    // Проверяем что место все еще доступно
    const slot = await prisma.workoutSlot.findUnique({
      where: { id: waitlistEntry.slotId },
      include: {
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
        },
      },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.currentParticipants >= slot.maxParticipants) {
      // Место уже занято, возвращаем в очередь
      await prisma.waitlist.update({
        where: { id: entryId },
        data: { status: "WAITING" },
      });

      // Пересчитываем позиции
      await recalculatePositions(slot.id);

      return NextResponse.json({ error: "Slot is already full again" }, { status: 409 });
    }

    try {
      // Создаем запись на тренировку
      const booking = await prisma.workoutBooking.create({
        data: {
          slotId: waitlistEntry.slotId,
          userId: waitlistEntry.userId,
          status: "CONFIRMED",
        },
        include: {
          slot: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Обновляем количество участников в слоте
      const newParticipantCount = slot.currentParticipants + 1;
      const newStatus = newParticipantCount >= slot.maxParticipants ? "FULL" : "AVAILABLE";

      await prisma.workoutSlot.update({
        where: { id: slot.id },
        data: {
          currentParticipants: newParticipantCount,
          status: newStatus,
        },
      });

      // Обновляем статус в очереди
      await prisma.waitlist.update({
        where: { id: entryId },
        data: { status: "ACCEPTED" },
      });

      // Пересчитываем позиции для остальных
      await recalculatePositions(slot.id);

      return NextResponse.json({
        message: "Successfully accepted waitlist offer",
        booking,
      });
    } catch (bookingError) {
      // Если не удалось создать запись, возвращаем в очередь
      await prisma.waitlist.update({
        where: { id: entryId },
        data: { status: "WAITING" },
      });

      throw bookingError;
    }
  } catch (error) {
    console.error("Error accepting waitlist offer:", error);
    return NextResponse.json({ error: "Failed to accept waitlist offer" }, { status: 500 });
  }
}

// DELETE - Отклонить предложение места (истекает по времени)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, userId } = body;

    if (!entryId || !userId) {
      return NextResponse.json({ error: "entryId and userId are required" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    const waitlistEntry = await prisma.waitlist.findUnique({
      where: { id: entryId },
    });

    if (!waitlistEntry) {
      return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
    }

    if (waitlistEntry.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Помечаем как истекшее
    await prisma.waitlist.update({
      where: { id: entryId },
      data: { status: "EXPIRED" },
    });

    // Уведомляем следующего в очереди
    const nextInQueue = await prisma.waitlist.findFirst({
      where: {
        slotId: waitlistEntry.slotId,
        status: "WAITING",
      },
      orderBy: { position: "asc" },
    });

    if (nextInQueue) {
      // Уведомляем следующего
      await prisma.waitlist.update({
        where: { id: nextInQueue.id },
        data: {
          status: "NOTIFIED",
          notifiedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ message: "Waitlist offer declined" });
  } catch (error) {
    console.error("Error declining waitlist offer:", error);
    return NextResponse.json({ error: "Failed to decline waitlist offer" }, { status: 500 });
  }
}

// Вспомогательная функция для пересчета позиций
async function recalculatePositions(slotId: string) {
  const prisma = getPrismaClient();

  const waitingEntries = await prisma.waitlist.findMany({
    where: {
      slotId,
      status: "WAITING",
    },
    orderBy: { createdAt: "asc" },
  });

  // Обновляем позиции
  await Promise.all(
    waitingEntries.map((entry, index) =>
      prisma.waitlist.update({
        where: { id: entry.id },
        data: { position: index + 1 },
      }),
    ),
  );
}
