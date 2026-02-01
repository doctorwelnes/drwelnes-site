import { defineCollection, z } from "astro:content";

function normalizeVideoUrl(input: unknown): unknown {
  if (typeof input !== "string") return input;
  const raw = input.trim();
  if (!raw) return undefined;

  if (raw.includes("<iframe") || raw.includes("src=\"")) {
    const m = raw.match(/\bsrc\s*=\s*"([^"]+)"/i);
    if (m?.[1]) return m[1].trim();
  }

  return raw;
}

function normalizeVideoFile(input: unknown): unknown {
  if (typeof input !== "string") return input;
  const raw = input.trim();
  if (!raw) return undefined;
  return raw;
}

const recipes = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoFile: z.preprocess(normalizeVideoFile, z.string().optional()),
    videoUrl: z.preprocess(normalizeVideoUrl, z.string().url().optional()),
    tags: z.array(z.string()).optional(),
    publishedAt: z.coerce.date().optional(),
  }),
});

const exercises = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoFile: z.preprocess(normalizeVideoFile, z.string().optional()),
    videoUrl: z.preprocess(normalizeVideoUrl, z.string().url().optional()),
    tags: z.array(z.string()).optional(),
    publishedAt: z.coerce.date().optional(),
  }),
});

const theory = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    publishedAt: z.coerce.date().optional(),
  }),
});

export const collections = { recipes, exercises, theory };
