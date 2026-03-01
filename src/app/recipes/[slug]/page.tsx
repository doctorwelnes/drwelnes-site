import { getAllRecipes, getRecipeBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./recipe-detail-client";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllRecipes().map((r) => ({ slug: r.slug }));
}

export default async function RecipeSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(decodeURIComponent(slug));
  if (!recipe) notFound();

  return <RecipeDetailClient recipe={recipe} />;
}
