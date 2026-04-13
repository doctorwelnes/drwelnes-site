"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Dumbbell } from "lucide-react";
import type { Recipe } from "@/lib/content";
import { Badge } from "./ui/Badge";
import { MacroWidget } from "./ui/MacroWidget";

export interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}

// Memoized component to prevent unnecessary re-renders
export const RecipeCard = React.memo(function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
}: RecipeCardProps) {
  const totalTime = (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);
  const timeDisplay = totalTime > 0 ? `${totalTime} мин` : "—";

  return (
    <div className="group flex flex-col relative bg-[#13151a] border border-white/5 rounded-[32px] overflow-hidden hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full animate-in fade-in zoom-in-95 fill-mode-both">
      {/* Image Section */}
      <Link
        href={`/recipes/${recipe.slug}`}
        className="relative h-70 overflow-hidden shrink-0 bg-[#0a0c0e] block"
      >
        {recipe.image ? (
          <Image
            src={recipe.image}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            style={{
              objectPosition: `${recipe.imagePositionX ?? 50}% ${recipe.imagePositionY ?? 50}%`,
            }}
            alt={recipe.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-12 h-12 text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#13151a] to-transparent" />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {recipe.categories?.[0] && <Badge variant="outline">{recipe.categories[0]}</Badge>}
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            onToggleFavorite(recipe.slug);
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleFavorite(recipe.slug);
            }
          }}
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-md border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
            isFavorite
              ? "bg-orange-500/20 border-orange-500 text-orange-500"
              : "bg-black/50 border-white/10 text-white hover:bg-orange-500/50 hover:border-orange-500"
          }`}
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-orange-500" : ""}`} />
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 relative p-4 pt-3 pb-3.5 md:p-8 md:pt-4 md:pb-2">
        {/* Neon Line */}
        <div className="absolute top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity left-4 right-4 md:left-8 md:right-8" />

        <Link href={`/recipes/${recipe.slug}`} className="flex-1 block">
          <h3 className="font-bold text-white uppercase tracking-tighter mb-2 group-hover:text-orange-400 transition-colors leading-tight text-base md:text-lg md:mb-3 italic">
            {recipe.title}
          </h3>
        </Link>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mt-auto justify-items-center">
          <MacroWidget size="sm" label="ВРЕМЯ" value={timeDisplay} />
          <MacroWidget
            size="sm"
            label="ЭНЕРГИЯ"
            value={recipe.kbru?.calories ? `${recipe.kbru.calories} ккал` : "—"}
            variant="highlight"
          />
          <MacroWidget
            size="sm"
            label="БЕЛОК"
            value={recipe.kbru?.protein ? `${recipe.kbru.protein}г` : "—"}
          />
        </div>
      </div>
    </div>
  );
}, areRecipePropsEqual);

// Custom comparison function for memoization
function areRecipePropsEqual(prev: RecipeCardProps, next: RecipeCardProps): boolean {
  return (
    prev.recipe.slug === next.recipe.slug &&
    prev.isFavorite === next.isFavorite &&
    prev.recipe.title === next.recipe.title &&
    prev.recipe.image === next.recipe.image
  );
}

export default RecipeCard;
