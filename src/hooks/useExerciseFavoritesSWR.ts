"use client";

// Re-export from the generic useFavorites hook for backwards compatibility
import { useFavoriteExercises } from "./useFavorites";
export const useExerciseFavoritesSWR = useFavoriteExercises;
