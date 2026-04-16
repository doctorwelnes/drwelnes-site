import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getPrismaClient } from "@/lib/prisma";
import { addRecipeFavoriteSchema } from "@/lib/validation";
import { validateRequest } from "@/lib/validate-request";
import { writeLimiter, applyRateLimit } from "@/lib/rate-limiter";
import { getAllRecipes } from "@/lib/content";

// GET - получить избранные рецепты пользователя
export async function GET() {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const prisma = getPrismaClient();
    const { user } = auth;

    const favorites = await prisma.favoriteRecipe.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Получаем список существующих рецептов
    const allRecipes = getAllRecipes();
    const existingSlugs = new Set(allRecipes.map((r) => r.slug));

    // Фильтруем избранное - оставляем только существующие рецепты
    const validFavorites = favorites.filter((f) => existingSlugs.has(f.recipeId));

    const uniqueFavorites = Array.from(
      new Map(validFavorites.map((f) => [f.recipeId, f])).values(),
    );

    return NextResponse.json({ favorites: uniqueFavorites });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Favorites GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites: " + errorMessage },
      { status: 500 },
    );
  }
}

// POST - добавить рецепт в избранное
export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await applyRateLimit(req, writeLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const prisma = getPrismaClient();
    const { user } = auth;

    const body = await req.json();

    // Validate request body
    const validation = validateRequest(addRecipeFavoriteSchema, body);
    if (!validation.success) {
      return validation.error;
    }

    const { recipeId } = validation.data;

    // Проверяем, не добавлен ли уже
    const existing = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Recipe already in favorites" }, { status: 409 });
    }

    const favorite = await prisma.favoriteRecipe.create({
      data: {
        userId: user.id,
        recipeId,
      },
    });

    return NextResponse.json({ favorite });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to add favorite: " + errorMessage }, { status: 500 });
  }
}

// DELETE - удалить из избранного
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthenticatedUser();
    if ("error" in auth) {
      return auth.error;
    }

    const prisma = getPrismaClient();
    const { user } = auth;

    const { searchParams } = new URL(req.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json({ error: "Missing recipeId" }, { status: 400 });
    }

    const favorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json({ error: "Favorite not found" }, { status: 404 });
    }

    await prisma.favoriteRecipe.delete({
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
