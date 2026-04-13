import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  DIRECT_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const envBuffer = envSchema.safeParse(process.env);

if (!envBuffer.success) {
  throw new Error("Invalid environment variables");
}

export const env = envBuffer.data;
