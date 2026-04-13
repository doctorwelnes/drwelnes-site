import { getAllRecipes, getRecipeBySlug } from "@/lib/content";
import { notFound } from "next/navigation";
import RecipeDetailClient from "./recipe-detail-client";

export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const recipe = getRecipeBySlug(decodedSlug);

  if (!recipe) return {};

  const description =
    recipe.description ||
    `Вкусный рецепт: ${recipe.title}. Узнайте, как приготовить это блюдо на сайте Dr.Welnes.`;
  const keywords =
    recipe.tags?.join(", ") ||
    recipe.categories?.join(", ") ||
    "рецепты, здоровое питание, Dr.Welnes";

  return {
    title: recipe.title,
    description,
    keywords,
    authors: [{ name: "Dr.Welnes" }],
    openGraph: {
      title: recipe.title,
      description,
      type: "article",
      authors: ["Dr.Welnes"],
      images: [
        {
          url: recipe.image || "/logo.png",
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: recipe.title,
      description,
      images: [recipe.image || "/logo.png"],
    },
  };
}
export async function generateStaticParams() {
  return getAllRecipes().map((r) => ({ slug: r.slug }));
}

export default async function RecipeSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(decodeURIComponent(slug));
  if (!recipe) notFound();

  return <RecipeDetailClient recipe={recipe} />;
}
