import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getPrismaClient } from "@/lib/prisma";

const escapeTelegramHtml = (value: string) =>
  value.replace(/[&<>"]/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });

async function notifyTelegramBooking(payload: {
  userName: string;
  userPhone: string | null;
  slotDate: Date;
  startTime: string;
  endTime: string;
  workoutType?: string | null;
  location?: string | null;
}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = `<b>Новая запись на тренировку!</b>

<b>Имя:</b> ${escapeTelegramHtml(payload.userName)}
<b>Телефон:</b> ${escapeTelegramHtml(payload.userPhone || "не указан")}
<b>Дата:</b> ${escapeTelegramHtml(
    payload.slotDate.toLocaleDateString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  )}
<b>Время:</b> ${escapeTelegramHtml(`${payload.startTime} - ${payload.endTime}`)}
<b>Тренировка:</b> ${escapeTelegramHtml(payload.workoutType || "не указано")}
<b>Локация:</b> ${escapeTelegramHtml(payload.location || "не указана")}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      console.error("Telegram booking notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Error sending workout booking notification:", error);
  }
}

async function notifyTelegramWorkoutCancellation(payload: {
  userName: string;
  userPhone: string | null;
  slotDate: Date;
  startTime: string;
  endTime: string;
  workoutType?: string | null;
  location?: string | null;
}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = `<b>Отмена записи на тренировку</b>

<b>Имя:</b> ${escapeTelegramHtml(payload.userName)}
<b>Телефон:</b> ${escapeTelegramHtml(payload.userPhone || "не указан")}
<b>Дата:</b> ${escapeTelegramHtml(
    payload.slotDate.toLocaleDateString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  )}
<b>Время:</b> ${escapeTelegramHtml(`${payload.startTime} - ${payload.endTime}`)}
<b>Тренировка:</b> ${escapeTelegramHtml(payload.workoutType || "не указано")}
<b>Локация:</b> ${escapeTelegramHtml(payload.location || "не указана")}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      console.error("Telegram workout cancellation notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Error sending workout cancellation notification:", error);
  }
}

type BookingRelations = {
  user?: { name?: string | null; phone?: string | null; telegram?: string | null } | null;
  slot?: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    workoutType?: string | null;
    location?: string | null;
    currentParticipants?: number;
    maxParticipants?: number;
  } | null;
};

// GET - Получение записей пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const prisma = getPrismaClient();
    const where: Record<string, unknown> = {};

    let effectiveUserId = userId;
    if (!effectiveUserId) {
      const auth = await getAuthenticatedUser();
      if ("error" in auth) {
        return auth.error;
      }

      effectiveUserId = auth.user.id;
    }

    if (effectiveUserId) {
      where.userId = effectiveUserId;
    }

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.workoutBooking.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        slotId: true,
        userId: true,
        status: true,
        notes: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        slot: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            workoutType: true,
            location: true,
            price: true,
            currentParticipants: true,
            maxParticipants: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching workout bookings:", error);
    return NextResponse.json({ error: "Failed to fetch workout bookings" }, { status: 500 });
  }
}

// POST - Создание записи на тренировку
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { slotId, userId, notes } = body;

    const prisma = getPrismaClient();

    // Проверяем, что слот существует и доступен
    const slot = await prisma.workoutSlot.findUnique({
      where: { id: slotId },
      include: {
        bookings: true,
      },
    });

    if (!slot) {
      return NextResponse.json({ error: "Workout slot not found" }, { status: 404 });
    }

    if (slot.status !== "AVAILABLE") {
      return NextResponse.json({ error: "This slot is no longer available" }, { status: 409 });
    }

    if (slot.currentParticipants >= slot.maxParticipants) {
      // Слот заполнен, но можно добавить в очередь
      return NextResponse.json(
        {
          error: "This slot is already full",
          canJoinWaitlist: true,
          slotId: slot.id,
          message: "Slot is full, but you can join the waitlist",
        },
        { status: 409 },
      );
    }

    // Проверяем, что пользователь уже записывался на этот слот
    const existingBooking = await prisma.workoutBooking.findFirst({
      where: {
        slotId,
        userId,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existingBooking?.status === "PENDING" || existingBooking?.status === "CONFIRMED") {
      return NextResponse.json({ error: "You are already booked for this slot" }, { status: 409 });
    }

    const booking = await prisma.$transaction(async (tx) => {
      if (existingBooking?.status === "CANCELLED") {
        const revivedBooking = await tx.workoutBooking.update({
          where: { id: existingBooking.id },
          data: {
            status: "PENDING",
            notes: notes ?? existingBooking.notes,
            paymentStatus: "PENDING",
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

        const newParticipantCount = slot.currentParticipants + 1;
        const newStatus = newParticipantCount >= slot.maxParticipants ? "FULL" : "AVAILABLE";

        await tx.workoutSlot.update({
          where: { id: slotId },
          data: {
            currentParticipants: newParticipantCount,
            status: newStatus,
          },
        });

        return revivedBooking;
      }

      const createdBooking = await tx.workoutBooking.create({
        data: {
          slotId,
          userId,
          notes,
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

      const newParticipantCount = slot.currentParticipants + 1;
      const newStatus = newParticipantCount >= slot.maxParticipants ? "FULL" : "AVAILABLE";

      await tx.workoutSlot.update({
        where: { id: slotId },
        data: {
          currentParticipants: newParticipantCount,
          status: newStatus,
        },
      });

      return createdBooking;
    });

    const bookingWithRelations = booking as BookingRelations;

    await notifyTelegramBooking({
      userName: bookingWithRelations.user?.name || "Неизвестно",
      userPhone: bookingWithRelations.user?.phone ?? null,
      slotDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      workoutType: slot.workoutType,
      location: slot.location,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating workout booking:", error);
    return NextResponse.json({ error: "Failed to create workout booking" }, { status: 500 });
  }
}

// DELETE - Отмена записи
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    const booking = await prisma.workoutBooking.findUnique({
      where: { id: bookingId },
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

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(booking);
    }

    // Обновляем статус записи
    const updatedBooking = await prisma.workoutBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    // Обновляем количество участников в слоте
    const bookingWithRelations = booking as typeof booking & BookingRelations;

    if (bookingWithRelations.slot) {
      const newParticipantCount = Math.max(
        0,
        (bookingWithRelations.slot.currentParticipants || 0) - 1,
      );
      const newStatus =
        newParticipantCount >= (bookingWithRelations.slot.maxParticipants || 0)
          ? "FULL"
          : "AVAILABLE";
      await prisma.workoutSlot.update({
        where: { id: bookingWithRelations.slot.id },
        data: {
          currentParticipants: newParticipantCount,
          status: newStatus,
        },
      });

      await notifyTelegramWorkoutCancellation({
        userName: bookingWithRelations.user?.name || "Неизвестно",
        userPhone: bookingWithRelations.user?.phone ?? null,
        slotDate: bookingWithRelations.slot.date,
        startTime: bookingWithRelations.slot.startTime,
        endTime: bookingWithRelations.slot.endTime,
        workoutType: bookingWithRelations.slot.workoutType,
        location: bookingWithRelations.slot.location,
      });

      // Уведомляем первого в очереди, если есть
      try {
        const notifyResponse = await fetch(
          `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/waitlist/notify-first`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              slotId: bookingWithRelations.slot.id,
            }),
          },
        );

        if (notifyResponse.ok) {
          const notifyData = await notifyResponse.json();
          console.log("Notified first in queue:", notifyData);
        }
      } catch (notifyError) {
        console.error("Error notifying waitlist:", notifyError);
        // Не прерываем основную операцию если уведомление не удалось
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error cancelling workout booking:", error);
    return NextResponse.json({ error: "Failed to cancel workout booking" }, { status: 500 });
  }
}
