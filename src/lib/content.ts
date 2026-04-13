import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Recipe,
  RecipeKbru,
  RecipeIngredient,
  Exercise,
  TheoryArticle,
  Calculator,
} from "@/types/content";

// Re-export shared types for backward compatibility
export type {
  Recipe,
  RecipeKbru,
  RecipeIngredient,
  Exercise,
  TheoryArticle,
  Calculator,
} from "@/types/content";

/* ── Helpers ───────────────────────────────────────── */

const CONTENT_DIR = path.join(process.cwd(), "content");

// Calculate kbruTotal from ingredients and kbru per 100g
function calculateKbruTotal(
  ingredients: RecipeIngredient[] | undefined,
  kbru: RecipeKbru | undefined,
): RecipeKbru | undefined {
  if (!kbru || !ingredients || ingredients.length === 0) return undefined;

  let totalWeight = 0;
  ingredients.forEach((ing) => {
    if (ing && ing.weight && !ing.isGroup) {
      const match = String(ing.weight).match(/(\d+(?:[.,]\d+)?)/);
      if (match) totalWeight += parseFloat(match[1].replace(",", ".")) || 0;
    }
  });

  if (totalWeight === 0) return undefined;

  const factor = totalWeight / 100;
  return {
    calories: Math.round((kbru.calories || 0) * factor),
    protein: Math.round((kbru.protein || 0) * factor),
    fat: Math.round((kbru.fat || 0) * factor),
    carbs: Math.round((kbru.carbs || 0) * factor),
  };
}

// Module-level cache: avoids re-reading all files on every slug lookup
const dirCache = new Map<string, ReturnType<typeof readMarkdownDirUncached>>();

function readMarkdownDirUncached(subdir: string) {
  const dir = path.join(CONTENT_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data, content } = matter(raw);
      const slug = filename.replace(/\.md$/, "");
      return { slug, data, body: content };
    });
}

function readMarkdownDir(subdir: string) {
  // In development, we skip the cache to see changes immediately
  if (process.env.NODE_ENV === "development") {
    return readMarkdownDirUncached(subdir);
  }

  const cached = dirCache.get(subdir);
  if (cached) return cached;
  const result = readMarkdownDirUncached(subdir);
  dirCache.set(subdir, result);
  return result;
}

/* ── Recipes ───────────────────────────────────────── */

export function getAllRecipes(): Recipe[] {
  return readMarkdownDir("recipes")
    .map(({ slug, data }) => {
      // Обратная совместимость: превращаем одиночную категорию в массив
      const categories = data.categories ?? (data.category ? [data.category] : []);

      // Auto-calculate kbruTotal from ingredients if not saved
      const kbruTotal = data.kbruTotal || calculateKbruTotal(data.ingredients, data.kbru);

      return {
        slug,
        title: data.title ?? slug,
        description: data.description,
        prepTimeMinutes: data.prepTimeMinutes,
        cookTimeMinutes: data.cookTimeMinutes,
        kbru: data.kbru,
        kbruTotal,
        kbruBasal: data.kbruBasal,
        ingredients: data.ingredients,
        steps: data.steps,
        categories,
        videoFile: data.videoFile,
        videoPoster: data.videoPoster,
        videoUrl: data.videoUrl,
        tags: data.tags,
        draft: data.draft,
        image: data.image,
        imagePositionX: data.imagePositionX,
        imagePositionY: data.imagePositionY,
        difficulty: data.difficulty,
        servings: data.servings,
      } as Recipe;
    })
    .filter((r) => !r.draft)
    .sort((a, b) => a.title.localeCompare(b.title, "ru", { sensitivity: "base" }));
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  const all = getAllRecipes();
  return all.find((r) => r.slug === slug);
}

/* ── Theory ────────────────────────────────────────── */

export function getAllTheory(): TheoryArticle[] {
  return readMarkdownDir("theory")
    .map(({ slug, data, body }) => ({
      slug,
      title: data.title ?? slug,
      description: data.description,
      tags: data.tags,
      categories: data.categories || [],
      author: data.author,
      references: data.references || [],
      readingTime: data.readingTime,
      draft: data.draft,
      cardImage: data.cardImage,
      cardImagePositionX: data.cardImagePositionX,
      cardImagePositionY: data.cardImagePositionY,
      articleImages: data.articleImages || [],
      body,
    }))
    .filter((a) => !a.draft);
}

export function getAllCalculators(): Calculator[] {
  return readMarkdownDir("calculators")
    .map(({ slug, data, body }) => ({
      slug,
      title: data.title ?? slug,
      description: data.description,
      tags: data.tags,
      categories: data.categories || [],
      draft: data.draft,
      body,
    }))
    .filter((c) => !c.draft);
}

export function getAllExercises(): Exercise[] {
  return readMarkdownDir("exercises")
    .map(({ slug, data, body }) => ({
      slug,
      title: data.title ?? slug,
      description: data.description,
      tags: data.tags,
      categories: data.categories || [],
      draft: data.draft,
      body,
      difficulty: data.difficulty,
      equipment: data.equipment,
      muscles: data.muscles || [],
      videoFile: data.videoFile,
      videoPoster: data.videoPoster,
      videoUrl: data.videoUrl,
      commonMistakes: data.commonMistakes || [],
      proTip: data.proTip,
      image: data.image,
      imagePositionX: data.imagePositionX,
      imagePositionY: data.imagePositionY,
    }))
    .filter((e) => !e.draft);
}

export function getExerciseBySlug(slug: string): Exercise | undefined {
  return getAllExercises().find((e) => e.slug === slug);
}

export function getTheoryBySlug(slug: string): TheoryArticle | undefined {
  return getAllTheory().find((a) => a.slug === slug);
}
