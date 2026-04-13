import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

// POST - Создание тестовых слотов для демонстрации
export async function POST() {
  try {
    const prisma = getPrismaClient();

    // Удаляем существующие слоты для чистоты
    await prisma.workoutSlot.deleteMany({});

    // Создаем тестовые слоты на ближайшие 7 дней
    const slots = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Устанавливаем время на начало дня (00:00:00)
      date.setHours(0, 0, 0, 0);

      // Утренние слоты
      slots.push(
        {
          date,
          startTime: "09:00",
          endTime: "10:00",
          maxParticipants: 5,
          workoutType: "Силовая тренировка",
          location: "Зал",
          price: 1500,
          notes: "Фокус на ногах и спине",
        },
        {
          date,
          startTime: "10:30",
          endTime: "11:30",
          maxParticipants: 3,
          workoutType: "HIIT",
          location: "Зал",
          price: 2000,
          notes: "Интенсивная кардио-тренировка",
        },
      );

      // Дневные слоты (только будни)
      if (date.getDay() >= 1 && date.getDay() <= 5) {
        slots.push(
          {
            date,
            startTime: "14:00",
            endTime: "15:00",
            maxParticipants: 4,
            workoutType: "Йога",
            location: "Студия",
            price: 1200,
            notes: "Расслабляющая йога для начинающих",
          },
          {
            date,
            startTime: "16:00",
            endTime: "17:00",
            maxParticipants: 6,
            workoutType: "Кардио",
            location: "Зал",
            price: 1000,
            notes: "Легкое кардио для поддержания формы",
          },
        );
      }

      // Вечерние слоты
      slots.push(
        {
          date,
          startTime: "18:00",
          endTime: "19:00",
          maxParticipants: 8,
          workoutType: "Силовая тренировка",
          location: "Зал",
          price: 1500,
          notes: "Полная тренировка на все группы мышц",
        },
        {
          date,
          startTime: "19:30",
          endTime: "20:30",
          maxParticipants: 5,
          workoutType: "Функциональная тренировка",
          location: "Зал",
          price: 1800,
          notes: "Работа с собственным весом",
        },
      );
    }

    // Создаем слоты в базе данных
    const createdSlots = await prisma.workoutSlot.createMany({
      data: slots,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Создано ${createdSlots.count} тестовых слотов`,
      count: createdSlots.count,
    });
  } catch (error) {
    console.error("Error creating test slots:", error);
    return NextResponse.json({ error: "Failed to create test slots" }, { status: 500 });
  }
}

// GET - Получение информации о слотах
export async function GET() {
  try {
    const prisma = getPrismaClient();

    const stats = await prisma.workoutSlot.groupBy({
      by: ["status"],
      _count: true,
    });

    const totalSlots = await prisma.workoutSlot.count();
    const totalBookings = await prisma.workoutBooking.count();

    return NextResponse.json({
      totalSlots,
      totalBookings,
      statusStats: stats,
    });
  } catch (error) {
    console.error("Error fetching slot stats:", error);
    return NextResponse.json({ error: "Failed to fetch slot stats" }, { status: 500 });
  }
}
