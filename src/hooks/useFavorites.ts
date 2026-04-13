"use client";

import { useCallback, useMemo } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "sonner";
import { fetcher, swrKeys } from "@/lib/swr";
import type { FavoritesResponse } from "@/types/favorites";

type FavoriteType = "recipes" | "exercises";

const idKey: Record<FavoriteType, "recipeId" | "exerciseId"> = {
  recipes: "recipeId",
  exercises: "exerciseId",
};

const labels: Record<FavoriteType, { entity: string; added: string; removed: string }> = {
  recipes: {
    entity: "Рецепт",
    added: "Рецепт сохранен в вашем профиле",
    removed: "Рецепт больше не в вашем списке",
  },
  exercises: {
    entity: "Упражнение",
    added: "Упражнение сохранено в вашем профиле",
    removed: "Упражнение больше не в вашем списке",
  },
};

export function useFavorites(type: FavoriteType) {
  const apiUrl = swrKeys.favorites[type];
  const key = idKey[type];
  const label = labels[type];

  const { data, error, isLoading, mutate } = useSWR<FavoritesResponse>(apiUrl, fetcher, {
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
    fallbackData: { favorites: [] },
  });

  const favorites = useMemo(
    () => data?.favorites?.map((f) => f[key] as string).filter(Boolean) ?? [],
    [data, key],
  );

  const toggleFavorite = useCallback(
    async (itemId: string) => {
      const isCurrentlyFavorite = favorites.includes(itemId);

      // Optimistic update
      const newFavorites = isCurrentlyFavorite
        ? favorites.filter((id) => id !== itemId)
        : [...favorites, itemId];

      const optimisticData: FavoritesResponse = {
        favorites: newFavorites.map((id) => ({
          id: `temp-${id}`,
          [key]: id,
          createdAt: new Date().toISOString(),
        })),
      };

      await mutate(optimisticData, false);

      // Show toast
      if (isCurrentlyFavorite) {
        toast("Удалено из избранного", { description: label.removed });
      } else {
        toast.success("Добавлено в избранное!", { description: label.added });
      }

      // Sync with server
      try {
        if (isCurrentlyFavorite) {
          await fetch(`${apiUrl}?${key}=${itemId}`, { method: "DELETE" });
        } else {
          await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [key]: itemId }),
          });
        }
        // Invalidate cache globally
        await globalMutate(apiUrl);
        await mutate();
      } catch {
        await mutate(data, true);
        toast.error("Ошибка синхронизации", {
          description: "Не удалось обновить избранное на сервере",
        });
      }
    },
    [favorites, data, mutate, apiUrl, key, label],
  );

  const isFavorite = useCallback((itemId: string) => favorites.includes(itemId), [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.length,
    isLoading,
    error,
  };
}

// Convenience wrappers for backwards compatibility
export function useFavoriteRecipes() {
  return useFavorites("recipes");
}

export function useFavoriteExercises() {
  return useFavorites("exercises");
}
