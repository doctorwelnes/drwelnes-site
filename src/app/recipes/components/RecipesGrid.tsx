"use client";

import React from "react";
import { Activity } from "lucide-react";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeCardSkeleton } from "@/components/RecipeCardSkeleton";
import type { Recipe } from "@/lib/content";

interface RecipesGridProps {
  recipes: Recipe[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  resetFilters: () => void;
  isLoading?: boolean;
}

export function RecipesGrid({
  recipes,
  isFavorite,
  toggleFavorite,
  resetFilters,
  isLoading = false,
}: RecipesGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-8 pb-12 mt-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <RecipeCardSkeleton count={6} />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-[#13151a] mt-8 animate-in fade-in zoom-in-95 duration-300">
        <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4 opacity-50" />
        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
          РЕЦЕПТЫ НЕ НАЙДЕНЫ
        </h3>
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">
          ПОПРОБУЙТЕ ИЗМЕНИТЬ ПАРАМЕТРЫ ПОИСКА ИЛИ ФИЛЬТРОВ
        </p>
        <button
          onClick={resetFilters}
          className="mt-8 px-8 py-3 bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors"
        >
          СБРОСИТЬ ФИЛЬТРЫ
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 pb-12 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      {recipes.map((r) => (
        <RecipeCard
          key={r.slug}
          recipe={r}
          isFavorite={isFavorite(r.slug)}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
}
