import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { sendTelegramHtmlMessage } from "@/lib/telegram";

async function notifyTelegramSlotDeleted(payload: {
  slotDate: Date;
  startTime: string;
  endTime: string;
  workoutType?: string | null;
  location?: string | null;
}) {
  const telegramMessage = await sendTelegramHtmlMessage({
    context: "workout-slot-deletion",
    title: "Удален слот тренировки",
    fields: [
      {
        label: "Дата",
        value: payload.slotDate.toLocaleDateString("ru-RU", {
          timeZone: "Europe/Moscow",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      },
      { label: "Время", value: `${payload.startTime} - ${payload.endTime}` },
      { label: "Тренировка", value: payload.workoutType || "не указано" },
      { label: "Локация", value: payload.location || "не указана" },
    ],
  });

  if (!telegramMessage.ok && !telegramMessage.skipped) {
    console.warn("Telegram slot deletion notification failed", telegramMessage.reason);
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
