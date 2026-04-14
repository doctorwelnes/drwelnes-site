import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GITHUB_CMS_CLIENT_ID: z.string().min(1).optional(),
  GITHUB_CMS_CLIENT_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const envBuffer = envSchema.safeParse(process.env);

if (!envBuffer.success) {
  throw new Error("Invalid environment variables");
}

const env = envBuffer.data;

if (env.NODE_ENV === "production" && !env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in production");
}

export { env };
