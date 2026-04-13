import { NextResponse } from "next/server";
import { getAllRecipes } from "@/lib/content";

export async function GET() {
  try {
    const recipes = getAllRecipes();
    const data = recipes.map((r) => ({
      slug: r.slug,
      title: r.title,
    }));
    return NextResponse.json(data);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}
