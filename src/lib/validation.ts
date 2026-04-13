import { z } from "zod";

// User schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  telegram: z.string().max(32).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

// Calculation schemas
export const saveCalculationSchema = z.object({
  type: z.enum(["BMI", "BMR", "TDEE", "CALORIES", "BODYFAT", "IDEALWEIGHT", "WATERTEST"]),
  name: z.string().min(1).max(200),
  result: z.record(z.string(), z.unknown()),
});

// Favorite schemas
export const addRecipeFavoriteSchema = z.object({
  recipeId: z.string().min(1),
});

export const addExerciseFavoriteSchema = z.object({
  exerciseId: z.string().min(1),
});

// Admin schemas
export const adminFileSchema = z.object({
  path: z.string().min(1),
  frontmatter: z.record(z.string(), z.unknown()).optional(),
  content: z.string().optional(),
});

export const adminDuplicateSchema = z.object({
  path: z.string().min(1),
});

export const adminSearchSchema = z.object({
  query: z.string().min(1).max(200),
});

export const adminRenameMediaSchema = z.object({
  url: z.string().min(1),
  newName: z.string().min(1).max(200),
});

// Upload schema
export const uploadUrlSchema = z.object({
  url: z.string().min(1),
});

// Types derived from schemas
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type SaveCalculationInput = z.infer<typeof saveCalculationSchema>;
export type AddRecipeFavoriteInput = z.infer<typeof addRecipeFavoriteSchema>;
export type AddExerciseFavoriteInput = z.infer<typeof addExerciseFavoriteSchema>;
export type AdminFileInput = z.infer<typeof adminFileSchema>;
export type AdminDuplicateInput = z.infer<typeof adminDuplicateSchema>;
export type AdminSearchInput = z.infer<typeof adminSearchSchema>;
export type AdminRenameMediaInput = z.infer<typeof adminRenameMediaSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
