"use client";

import React from "react";
import { Search, Heart, Filter, ChevronDown, Check } from "lucide-react";

interface RecipesControlsProps {
  search: string;
  setSearch: (val: string) => void;
  showOnlyFavorites: boolean;
  setShowOnlyFavorites: (val: boolean) => void;
  showFilters: boolean;
  setShowFilters: (val: boolean) => void;
  hasActiveFilters?: boolean;
  sortBy: string;
  setSortBy: (val: string) => void;
}

const SORT_OPTIONS = [
  { id: "new", label: "НОВИНКИ" },
  { id: "kcal-asc", label: "ККАЛ ↓" },
  { id: "kcal-desc", label: "ККАЛ ↑" },
  { id: "prot-desc", label: "БЕЛОК ↑" },
  { id: "time-asc", label: "БЫСТРО" },
];

export function RecipesControls({
  search,
  setSearch,
  showOnlyFavorites,
  setShowOnlyFavorites,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  sortBy,
  setSortBy,
}: RecipesControlsProps) {
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const activeSortLabel = SORT_OPTIONS.find((o) => o.id === sortBy)?.label || "НОВИНКИ";

  return (
    <div className="flex flex-col gap-3 w-full xl:w-auto">
      {/* Search Input */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#16181d]/40 backdrop-blur-xl border border-white/5 rounded-[22px] shadow-2xl transition-all focus-within:bg-[#1a1c21] w-full">
        <Search className="w-4 h-4 text-orange-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ПОИСК..."
          className="bg-transparent border-none outline-none text-white font-mono text-xs uppercase w-full placeholder:text-zinc-600 tracking-widest min-w-0"
        />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 w-full">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          {/* Custom Sort Dropdown */}
          <div className="relative shrink-0 flex-1">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full h-10 px-5 flex justify-between items-center gap-2 bg-[#16181d]/40 backdrop-blur-xl border border-white/5 rounded-[18px] text-zinc-400 hover:text-white transition-all group"
            >
              <span className="font-black uppercase tracking-widest text-[9px] whitespace-nowrap">
                {activeSortLabel}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-600 group-hover:text-orange-500 transition-transform duration-300 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                <div className="absolute top-full left-0 mt-2 w-full min-w-[160px] bg-[#1a1c21] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1.5 backdrop-blur-2xl">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setSortBy(option.id);
                        setIsSortOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        sortBy === option.id
                          ? "bg-orange-500 text-black shadow-lg"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {option.label}
                      {sortBy === option.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Favorite Toggle */}
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`h-10 px-4 md:px-5 rounded-[18px] font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 bg-[#16181d]/40 backdrop-blur-xl border border-white/5 hover:border-white/20 whitespace-nowrap flex-1 md:flex-none md:w-[130px] ${
              showOnlyFavorites
                ? "text-orange-500 border-orange-500/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 shrink-0 ${showOnlyFavorites ? "fill-orange-500" : ""}`}
            />
            <span>Любимые</span>
          </button>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative h-10 w-full md:w-[110px] px-5 rounded-[18px] font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 bg-[#16181d]/40 backdrop-blur-xl border border-white/5 hover:border-white/20 whitespace-nowrap ${
            showFilters
              ? "bg-orange-500 !border-orange-500 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Фильтр</span>
          {hasActiveFilters && !showFilters && (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
