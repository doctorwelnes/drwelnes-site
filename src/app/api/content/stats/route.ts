import { NextResponse } from "next/server";
import { getAllRecipes, getAllExercises, getAllTheory } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [recipes, exercises, articles] = await Promise.all([
      Promise.resolve(getAllRecipes()),
      Promise.resolve(getAllExercises()),
      Promise.resolve(getAllTheory()),
    ]);

    return NextResponse.json({
      recipes: recipes.length,
      exercises: exercises.length,
      articles: articles.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch content stats" },
      { status: 500 }
    );
  }
}
