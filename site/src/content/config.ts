import { defineCollection, z } from "astro:content";

const recipes = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoUrl: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    publishedAt: z.coerce.date().optional(),
  }),
});

const exercises = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoUrl: z.string().url().optional(),
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
