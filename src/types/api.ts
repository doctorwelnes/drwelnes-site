// Shared API types for consistent request/response contracts across the application

// Generic API response wrapper
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  image?: string;
}

// Favorites types
export interface Favorite {
  id: string;
  recipeId?: string;
  exerciseId?: string;
  createdAt: string;
}

export interface FavoritesResponse {
  favorites: Favorite[];
}

export interface ToggleFavoriteRequest {
  recipeId?: string;
  exerciseId?: string;
}

// Calculation types
export interface Calculation {
  id: string;
  type: "bmi" | "bmr" | "tdee" | "bodyfat" | "calories";
  input: Record<string, number | string>;
  result: number | Record<string, number>;
  createdAt: string;
}

export interface SaveCalculationRequest {
  type: string;
  input: Record<string, number | string>;
  result: number | Record<string, number>;
}

// Recipe content types
export interface RecipeMeta {
  title: string;
  description?: string;
  image?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  categories?: string[];
  tags?: string[];
  kbru?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface Recipe extends RecipeMeta {
  slug: string;
  content: string;
}

// Exercise content types
export interface ExerciseMeta {
  title: string;
  description?: string;
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export interface Exercise extends ExerciseMeta {
  slug: string;
  content: string;
}

// Workout types
export interface SetDto {
  id: string;
  position: number | null;
  reps: number | null;
  weightKg: string | number | null;
  timeSec: number | null;
  distanceM: number | null;
}

export interface ExerciseDto {
  id: string;
  exerciseName: string;
  note: string | null;
  position: number | null;
  sets: SetDto[];
}

export interface WorkoutDto {
  id: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  rpe: number | null;
  note: string | null;
  createdAt: string;
  exercises: ExerciseDto[];
}

// Upload types
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

// Admin types
export interface FileTreeItem {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileTreeItem[];
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
}
