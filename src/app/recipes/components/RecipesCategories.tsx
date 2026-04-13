"use client";

import React from "react";

interface RecipesCategoriesProps {
  categories: string[];
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
}

export function RecipesCategories({
  categories,
  activeCategory,
  setActiveCategory,
}: RecipesCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <div className="relative">
      {/* Left fade mask */}
      <div className="absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r from-[#0c0d10] to-transparent z-10 pointer-events-none" />
      {/* Right fade mask */}
      <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-[#0c0d10] to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar snap-x px-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setActiveCategory(null)}
          className={`flex-shrink-0 px-4 py-2 md:px-6 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all border snap-start
            ${
              activeCategory === null
                ? "bg-orange-500 border-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                : "bg-[#13151a] border-white/5 text-zinc-400 hover:border-orange-500/50 hover:text-white"
            }`}
        >
          Все рецепты
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`flex-shrink-0 px-4 py-2 md:px-6 md:py-2.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all border snap-start
              ${
                activeCategory === cat
                  ? "bg-orange-500 border-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                  : "bg-[#13151a] border-white/5 text-zinc-400 hover:border-orange-500/50 hover:text-white"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
