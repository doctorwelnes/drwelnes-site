import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

const escapeTelegramHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

async function notifyTelegramSlotDeleted(payload: {
  slotDate: Date;
  startTime: string;
  endTime: string;
  workoutType?: string | null;
  location?: string | null;
}) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const text = `<b>Удален слот тренировки</b>

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
      console.error("Telegram slot deletion notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Error sending workout slot deletion notification:", error);
  }
}

// PUT - Обновление существующего слота
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      date,
      startTime,
      endTime,
      maxParticipants,
      workoutType,
      location,
      price,
      notes,
      trainerId,
    } = body;

    const prisma = getPrismaClient();

    // Проверяем, что слот существует
    const existingSlot = await prisma.workoutSlot.findUnique({
      where: { id },
    });

    if (!existingSlot) {
      return NextResponse.json({ error: "Workout slot not found" }, { status: 404 });
    }

    const slot = await prisma.workoutSlot.update({
      where: { id },
      data: {
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        maxParticipants,
        workoutType,
        location,
        price,
        notes,
        trainerId,
      },
    });

    return NextResponse.json(slot);
  } catch (error) {
    console.error("Error updating workout slot:", error);
    return NextResponse.json({ error: "Failed to update workout slot" }, { status: 500 });
  }
}

// DELETE - Удаление слота
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const prisma = getPrismaClient();

    // Проверяем, что слот существует
    const existingSlot = await prisma.workoutSlot.findUnique({
      where: { id },
    });

    if (!existingSlot) {
      return NextResponse.json({ error: "Workout slot not found" }, { status: 404 });
    }

    // Проверяем, что нет активных записей
    const activeBookingsCount = await prisma.workoutBooking.count({
      where: {
        slotId: id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (activeBookingsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete slot with active bookings" },
        { status: 409 },
      );
    }

    await prisma.workoutSlot.delete({
      where: { id },
    });

    await notifyTelegramSlotDeleted({
      slotDate: existingSlot.date,
      startTime: existingSlot.startTime,
      endTime: existingSlot.endTime,
      workoutType: existingSlot.workoutType,
      location: existingSlot.location,
    });

    return NextResponse.json({ message: "Workout slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout slot:", error);
    return NextResponse.json({ error: "Failed to delete workout slot" }, { status: 500 });
  }
}
