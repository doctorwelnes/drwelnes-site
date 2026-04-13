import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function POST() {
  try {
    const prisma = getPrismaClient();

    // Сначала удаляем все записи на тренировки
    await prisma.workoutBooking.deleteMany({});

    // Затем удаляем все тренировочные слоты
    await prisma.workoutSlot.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "Все тренировочные слоты и записи удалены",
      deletedBookings: true,
      deletedSlots: true
    });
  } catch (error) {
    console.error('Error clearing workouts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to clear workouts',
        message: 'Не удалось очистить тренировки'
      },
      { status: 500 }
    );
  }
}
