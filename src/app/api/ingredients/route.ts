import { NextResponse } from "next/server";
import { getAllRecipes } from "@/lib/content";

export async function GET() {
  try {
    const recipes = getAllRecipes();
    const ingredientNames = new Set<string>();

    recipes.forEach((recipe) => {
      recipe.ingredients?.forEach((ing) => {
        if (ing.name && !ing.isGroup && ing.name.trim()) {
          ingredientNames.add(ing.name.trim());
        }
      });
    });

    const sortedIngredients = Array.from(ingredientNames).sort();
    return NextResponse.json(sortedIngredients);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
