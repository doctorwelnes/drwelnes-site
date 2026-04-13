import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slots } = body;

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "Invalid slots data" }, { status: 400 });
    }

    const prisma = getPrismaClient();

    // Создаем все слоты в одной транзакции
    const createdSlots = await Promise.all(
      slots.map((slotData) =>
        prisma.workoutSlot.create({
          data: {
            date: new Date(slotData.date + "T00:00:00.000Z"),
            startTime: slotData.startTime,
            endTime: slotData.endTime,
            maxParticipants: slotData.maxParticipants,
            workoutType: slotData.workoutType || null,
            location: slotData.location,
            price: slotData.price,
            notes: slotData.notes || null,
            trainerId: null,
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: `Created ${createdSlots.length} workout slots`,
      slots: createdSlots,
    });
  } catch (error) {
    console.error("Error creating batch workout slots:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create batch workout slots",
        message: "Не удалось создать пакет слотов",
      },
      { status: 500 },
    );
  }
}
