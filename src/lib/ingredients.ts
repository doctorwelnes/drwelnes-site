import { getAllRecipes } from "./content";

let cachedIngredients: string[] | null = null;

export function getRecipeIngredients(): string[] {
  if (cachedIngredients !== null) {
    return cachedIngredients;
  }

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

    cachedIngredients = Array.from(ingredientNames).sort();
    return cachedIngredients;
  } catch {
    return [];
  }
}

export function clearIngredientsCache() {
  cachedIngredients = null;
}
