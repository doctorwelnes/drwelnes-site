import fs from "fs";
import path from "path";
import matter from "gray-matter";

/* ── Types ─────────────────────────────────────────── */

export interface RecipeKbru {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface RecipeIngredient {
  name: string;
  amount?: string;
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
  category?: string;
  videoFile?: string;
  videoPoster?: string;
  videoUrl?: string;
  tags?: string[];
}

export interface TheoryArticle {
  slug: string;
  title: string;
  description?: string;
  tags?: string[];
  body: string;
}

/* ── Helpers ───────────────────────────────────────── */

const CONTENT_DIR = path.join(process.cwd(), "content");

function readMarkdownDir(subdir: string) {
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

/* ── Recipes ───────────────────────────────────────── */

export function getAllRecipes(): Recipe[] {
  return readMarkdownDir("recipes")
    .map(({ slug, data }) => ({ slug, ...data }) as Recipe)
    .sort((a, b) => a.title.localeCompare(b.title, "ru", { sensitivity: "base" }));
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  const all = getAllRecipes();
  return all.find((r) => r.slug === slug);
}

/* ── Theory ────────────────────────────────────────── */

export function getAllTheory(): TheoryArticle[] {
  return readMarkdownDir("theory").map(({ slug, data, body }) => ({
    slug,
    title: data.title ?? slug,
    description: data.description,
    tags: data.tags,
    body,
  }));
}

export function getTheoryBySlug(slug: string): TheoryArticle | undefined {
  return getAllTheory().find((a) => a.slug === slug);
}
