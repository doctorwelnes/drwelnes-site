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
  const raw = input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, " ")
    .trim();
  if (!raw) return undefined;

  // allow full URL, normalize to site-relative /uploads/... path
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      const u = new URL(raw);
      if (u.hostname === "drwelnes.ru" || u.hostname === "www.drwelnes.ru") {
        if (u.pathname.startsWith("/uploads/")) return u.pathname;
      }
    }
  } catch {
    // ignore
  }

  // allow "uploads/..." without leading slash
  if (raw.startsWith("uploads/")) return `/${raw}`;

  return raw;
}

function isValidVideoFilePath(value: string): boolean {
  return /^\/uploads\/videos\/.+\.mp4$/i.test(value);
}

function normalizeOptionalDate(input: unknown): unknown {
  if (typeof input !== "string") return input;
  const raw = input.trim();
  if (!raw) return undefined;
  return raw;
}

function normalizeRecipeSteps(input: unknown): unknown {
  if (!Array.isArray(input)) return input;

  // Decap CMS может сохранить list как массив строк, либо как массив объектов
  // (зависит от конфигурации field/fields и истории контента).
  const out: string[] = [];
  for (const item of input) {
    if (typeof item === "string") {
      const t = item.trim();
      if (t) out.push(t);
      continue;
    }
    if (item && typeof item === "object" && "text" in item) {
      const v = (item as any).text;
      if (typeof v === "string") {
        const t = v.trim();
        if (t) out.push(t);
      }
    }
  }
  return out.length ? out : undefined;
}

const recipes = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    kbru: z
      .object({
        calories: z.number().optional(),
        protein: z.number().optional(),
        fat: z.number().optional(),
        carbs: z.number().optional(),
      })
      .optional(),
    ingredients: z
      .array(
        z.object({
          name: z.string(),
          amount: z.string().optional(),
        })
      )
      .optional(),
    steps: z.preprocess(normalizeRecipeSteps, z.array(z.string()).optional()),
    category: z.enum(["перекусы", "десерты"]).optional(),
    videoFile: z.preprocess(
      normalizeVideoFile,
      z
        .string()
        .optional()
        .refine((v) => v === undefined || isValidVideoFilePath(v), {
          message: "videoFile must be like /uploads/videos/<name>.mp4",
        })
    ),
    videoUrl: z.preprocess(normalizeVideoUrl, z.string().url().optional()),
    tags: z.array(z.string()).optional(),
    publishedAt: z.preprocess(normalizeOptionalDate, z.coerce.date().optional()),
  }),
});

const exercises = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    videoFile: z.preprocess(
      normalizeVideoFile,
      z
        .string()
        .optional()
        .refine((v) => v === undefined || isValidVideoFilePath(v), {
          message: "videoFile must be like /uploads/videos/<name>.mp4",
        })
    ),
    videoUrl: z.preprocess(normalizeVideoUrl, z.string().url().optional()),
    tags: z.array(z.string()).optional(),
    publishedAt: z.preprocess(normalizeOptionalDate, z.coerce.date().optional()),
  }),
});

const theory = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    publishedAt: z.preprocess(normalizeOptionalDate, z.coerce.date().optional()),
  }),
});

export const collections = { recipes, exercises, theory };
