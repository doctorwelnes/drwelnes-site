import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { withWorkoutOverlapState } from "@/lib/workout-availability";

function isPrismaMissingColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2022"
  );
}

// GET - Получение доступных слотов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const userId = searchParams.get("userId");

    const prisma = getPrismaClient();
    const where: Record<string, unknown> = {};

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const loadSlots = async (includeContactFields: boolean) =>
      prisma.workoutSlot.findMany({
        where,
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: {
          bookings: {
            where: {
              status: {
                in: ["PENDING", "CONFIRMED"],
              },
              ...(userId ? { userId } : {}),
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  ...(includeContactFields ? { phone: true, telegram: true } : {}),
                },
              },
            },
          },
        },
      });

    let slots;
    try {
      slots = await loadSlots(true);
    } catch (error) {
      if (!isPrismaMissingColumnError(error)) {
        throw error;
      }

      slots = await loadSlots(false);
    }

    const now = new Date();
    const activeSlots = slots.filter((slot) => {
      const slotDate = new Date(slot.date);
      const [hours, minutes] = (slot.endTime || "23:59").split(":").map(Number);
      slotDate.setHours(hours, minutes, 0, 0);
      return slotDate > now;
    });

    return NextResponse.json(withWorkoutOverlapState(activeSlots));
  } catch (error) {
    console.error("Error fetching workout slots:", error);
    return NextResponse.json({ error: "Failed to fetch workout slots" }, { status: 500 });
  }
}

// POST - Создание нового слота
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      date,
      startTime,
      endTime,
      maxParticipants = 1,
      workoutType,
      location,
      price,
      notes,
      trainerId,
    } = body;

    const prisma = getPrismaClient();

    const slot = await prisma.workoutSlot.create({
      data: {
        date: new Date(date),
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

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Error creating workout slot:", error);
    return NextResponse.json({ error: "Failed to create workout slot" }, { status: 500 });
  }
}
