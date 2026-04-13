/**
 * Shared types for Recipes and Exercises
 * Used across frontend, API routes, and admin components
 */

/* ── Recipe Types ─────────────────────────────────── */

export interface RecipeKbru {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface RecipeIngredient {
  name: string;
  amount?: string;
  weight?: string;
  isGroup?: boolean;
}

export interface Recipe {
  slug: string;
  title: string;
  description?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  kbru?: RecipeKbru;
  kbruTotal?: RecipeKbru;
  kbruBasal?: RecipeKbru;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  categories?: string[];
  videoFile?: string;
  videoPoster?: string;
  videoUrl?: string;
  tags?: string[];
  draft?: boolean;
  image?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  difficulty?: string;
  servings?: string;
}

/* ── Exercise Types ─────────────────────────────────── */

export interface Exercise {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  draft?: boolean;
  body: string;
  difficulty?: "Низкая" | "Средняя" | "Высокая";
  equipment?: string;
  muscles?: string[];
  videoFile?: string;
  videoPoster?: string;
  videoUrl?: string;
  commonMistakes?: string[];
  proTip?: string;
  image?: string;
  imagePositionX?: number;
  imagePositionY?: number;
}

/* ── Theory & Calculator Types ───────────────────────── */

export interface TheoryArticle {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  references?: { title: string; url: string }[];
  readingTime?: string;
  draft?: boolean;
  cardImage?: string;
  cardImagePositionX?: number;
  cardImagePositionY?: number;
  articleImages?: string[];
  body: string;
}

export interface Calculator {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  draft?: boolean;
  body: string;
}
