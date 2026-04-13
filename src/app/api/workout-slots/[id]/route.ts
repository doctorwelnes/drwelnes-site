import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

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
      include: {
        bookings: true,
      },
    });

    if (!existingSlot) {
      return NextResponse.json({ error: "Workout slot not found" }, { status: 404 });
    }

    // Проверяем, что нет активных записей
    if (existingSlot.bookings.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete slot with active bookings" },
        { status: 409 },
      );
    }

    await prisma.workoutSlot.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Workout slot deleted successfully" });
  } catch (error) {
    console.error("Error deleting workout slot:", error);
    return NextResponse.json({ error: "Failed to delete workout slot" }, { status: 500 });
  }
}
