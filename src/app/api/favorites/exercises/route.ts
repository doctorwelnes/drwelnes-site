import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";
import { addExerciseFavoriteSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";
import { getAllExercises } from "@/lib/content";

// GET - получить избранные упражнения пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const favorites = await prisma.favoriteExercise.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Получаем список существующих упражнений
    const allExercises = getAllExercises();
    const existingSlugs = new Set(allExercises.map((e) => e.slug));

    // Фильтруем избранное - оставляем только существующие упражнения
    const validFavorites = favorites.filter((f) => existingSlugs.has(f.exerciseId));

    const uniqueFavorites = Array.from(
      new Map(validFavorites.map((f) => [f.exerciseId, f])).values(),
    );

    return NextResponse.json({ favorites: uniqueFavorites });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch favorites: " + errorMessage },
      { status: 500 },
    );
  }
}

// POST - добавить упражнение в избранное
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // Validate request body
    const validation = validateRequest(addExerciseFavoriteSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { exerciseId } = validation.data;

    // Проверяем, не добавлено ли уже
    const existing = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Exercise already in favorites" }, { status: 409 });
    }

    const favorite = await prisma.favoriteExercise.create({
      data: {
        userId: user.id,
        exerciseId,
      },
    });

    return NextResponse.json({ favorite });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to add favorite: " + errorMessage }, { status: 500 });
  }
}

// DELETE - удалить из избранного
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const exerciseId = searchParams.get("exerciseId");

    if (!exerciseId) {
      return NextResponse.json({ error: "Missing exerciseId" }, { status: 400 });
    }

    const favorite = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseId: {
          userId: user.id,
          exerciseId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    await prisma.favoriteExercise.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to remove favorite: " + errorMessage },
      { status: 500 },
    );
  }
}
