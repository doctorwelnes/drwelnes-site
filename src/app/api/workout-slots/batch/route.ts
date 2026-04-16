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

    const uniqueKeySet = new Set<string>();
    const createdSlots = [];
    let skippedSlots = 0;

    for (const slotData of slots) {
      const normalizedDate = new Date(slotData.date + "T00:00:00.000Z");
      const dedupeKey = [
        normalizedDate.toISOString().slice(0, 10),
        slotData.startTime,
        slotData.endTime,
        slotData.workoutType || "",
        slotData.location || "",
      ].join("|");

      if (uniqueKeySet.has(dedupeKey)) {
        skippedSlots += 1;
        continue;
      }
      uniqueKeySet.add(dedupeKey);

      const existingSlot = await prisma.workoutSlot.findFirst({
        where: {
          date: normalizedDate,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          workoutType: slotData.workoutType || null,
          location: slotData.location || null,
        },
      });

      if (existingSlot) {
        skippedSlots += 1;
        continue;
      }

      const createdSlot = await prisma.workoutSlot.create({
        data: {
          date: normalizedDate,
          startTime: slotData.startTime,
          endTime: slotData.endTime,
          maxParticipants: slotData.maxParticipants,
          workoutType: slotData.workoutType || null,
          location: slotData.location,
          price: slotData.price,
          notes: slotData.notes || null,
          trainerId: null,
        },
      });

      createdSlots.push(createdSlot);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdSlots.length} workout slots`,
      slots: createdSlots,
      skipped: skippedSlots,
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
