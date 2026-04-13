import { getAllRecipes } from "@/lib/content";
import RecipesClient from "./recipes-client";

export const dynamic = "force-static";

export default function RecipesPage() {
  const recipes = getAllRecipes();
  return (
    <main>
      <RecipesClient recipes={recipes} />
    </main>
  );
}
