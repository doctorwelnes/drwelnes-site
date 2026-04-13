"use client";

// Re-export from the generic useFavorites hook for backwards compatibility
import { useFavoriteRecipes } from "./useFavorites";
export const useFavoritesSWR = useFavoriteRecipes;
