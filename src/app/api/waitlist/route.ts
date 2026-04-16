import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const WAITLIST_NOTIFICATION_TTL_MS = 15 * 60 * 1000;

async function expireStaleNotifiedEntries(slotId?: string) {
  const prisma = getPrismaClient();
  const expiredBefore = new Date(Date.now() - WAITLIST_NOTIFICATION_TTL_MS);

  const staleEntries = await prisma.waitlist.findMany({
    where: {
      status: "NOTIFIED",
      notifiedAt: { lt: expiredBefore },
      ...(slotId ? { slotId } : {}),
    },
    select: {
      id: true,
      slotId: true,
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

  await Promise.all(
    [...new Set(staleEntries.map((entry) => entry.slotId))].map((staleSlotId) =>
      recalculatePositions(staleSlotId),
    ),
  );
}

// GET - Получение очереди пользователя или очереди для слота
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const slotId = searchParams.get("slotId");

    const prisma = getPrismaClient();

    await expireStaleNotifiedEntries(slotId || undefined);

    if (userId) {
      // Получаем все записи пользователя в очередях
      const waitlistEntries = await prisma.waitlist.findMany({
        where: {
          userId,
          status: "WAITING",
        },
        include: {
          slot: {
            include: {
              bookings: {
                where: { status: { in: ["PENDING", "CONFIRMED"] } },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Добавляем информацию о позиции и вероятности
      const enrichedEntries = await Promise.all(
        waitlistEntries.map(async (entry) => {
          const position = await prisma.waitlist.count({
            where: {
              slotId: entry.slotId,
              status: "WAITING",
              createdAt: { lte: entry.createdAt },
            },
          });

          const totalWaiting = await prisma.waitlist.count({
            where: {
              slotId: entry.slotId,
              status: "WAITING",
            },
          });

          const probability =
            totalWaiting > 0 ? Math.round((1 - (position - 1) / totalWaiting) * 100) : 0;

          return {
            ...entry,
            position,
            totalWaiting,
            probability,
          };
        }),
      );

      return NextResponse.json(enrichedEntries);
    }

    if (slotId) {
      // Получаем очередь для конкретного слота
      const waitlistEntries = await prisma.waitlist.findMany({
        where: {
          slotId,
          status: "WAITING",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { position: "asc" },
      });

      return NextResponse.json(waitlistEntries);
    }

    return NextResponse.json({ error: "userId or slotId is required" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching waitlist:", error);
    return NextResponse.json({ error: "Failed to fetch waitlist" }, { status: 500 });
  }
}

// POST - Добавление в очередь
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slotId, userId } = body;

    if (!slotId || !userId) {
      return NextResponse.json({ error: "slotId and userId are required" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    await expireStaleNotifiedEntries(slotId);

    // Проверяем что слот существует и заполнен
    const slot = await prisma.workoutSlot.findUnique({
      where: { id: slotId },
      include: {
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
        },
        waitlistEntries: {
          where: { status: "WAITING" },
        },
      },
    });

    if (!slot) {
      return NextResponse.json({ error: "Workout slot not found" }, { status: 404 });
    }

    // Проверяем что слот действительно заполнен
    if (slot.currentParticipants < slot.maxParticipants) {
      return NextResponse.json({ error: "Slot is not full yet" }, { status: 400 });
    }

    // Проверяем что пользователь еще не в очереди
    const existingEntry = await prisma.waitlist.findFirst({
      where: {
        slotId,
        userId,
        status: { in: ["WAITING", "NOTIFIED"] },
      },
    });

    if (existingEntry) {
      return NextResponse.json({ error: "Already in waitlist for this slot" }, { status: 409 });
    }

    // Проверяем что у пользователя нет активной записи на этот слот
    const existingBooking = await prisma.workoutBooking.findFirst({
      where: {
        slotId,
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "Already booked for this slot" }, { status: 409 });
    }

    // Определяем позицию в очереди
    const position = (slot.waitlistEntries?.length || 0) + 1;

    // Создаем запись в очереди
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        slotId,
        userId,
        position,
        status: "WAITING",
      },
      include: {
        slot: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(waitlistEntry, { status: 201 });
  } catch (error) {
    console.error("Error joining waitlist:", error);
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

// DELETE - Выход из очереди
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get("slotId");
    const userId = searchParams.get("userId");
    const entryId = searchParams.get("entryId");

    const prisma = getPrismaClient();

    await expireStaleNotifiedEntries(slotId || undefined);

    if (entryId) {
      // Удаляем конкретную запись по ID
      const entry = await prisma.waitlist.findUnique({
        where: { id: entryId },
      });

      if (!entry) {
        return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
      }

      await prisma.waitlist.update({
        where: { id: entryId },
        data: { status: "DECLINED" },
      });

      // Пересчитываем позиции для остальных в очереди
      await recalculatePositions(entry.slotId);

      return NextResponse.json({ message: "Left waitlist successfully" });
    }

    if (slotId && userId) {
      // Выходим из очереди по слоту и пользователю
      const entry = await prisma.waitlist.findFirst({
        where: {
          slotId,
          userId,
          status: "WAITING",
        },
      });

      if (!entry) {
        return NextResponse.json({ error: "Waitlist entry not found" }, { status: 404 });
      }

      await prisma.waitlist.update({
        where: { id: entry.id },
        data: { status: "DECLINED" },
      });

      // Пересчитываем позиции для остальных в очереди
      await recalculatePositions(slotId);

      return NextResponse.json({ message: "Left waitlist successfully" });
    }

    return NextResponse.json(
      { error: "entryId or (slotId and userId) is required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error leaving waitlist:", error);
    return NextResponse.json({ error: "Failed to leave waitlist" }, { status: 500 });
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
