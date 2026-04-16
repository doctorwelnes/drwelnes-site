import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getPrismaClient } from "@/lib/prisma";

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrismaClient();

    const bookings = await prisma.workoutBooking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        notes: true,
        createdAt: true,
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
            phone: true,
            telegram: true,
          },
        },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Failed to fetch active workouts:", error);
    return NextResponse.json({ error: "Failed to fetch active workouts" }, { status: 500 });
  }
}
