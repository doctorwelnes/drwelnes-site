"use client";

import { useState, useMemo } from "react";
import { useFavoritesSWR } from "@/hooks/useFavoritesSWR";
import type { Recipe } from "@/lib/content";
import { RecipeFilters } from "@/components/RecipeFilters";
import PageHeader from "@/components/PageHeader";
import { RecipesControls } from "./components/RecipesControls";
import { RecipesCategories } from "./components/RecipesCategories";
import { RecipesGrid } from "./components/RecipesGrid";
import { Utensils } from "lucide-react";

export default function RecipesClient({ recipes }: { recipes: Recipe[] }) {
  const { toggleFavorite, isFavorite } = useFavoritesSWR();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterMode, setFilterMode] = useState<"100g" | "dish">("100g");
  const [sortBy, setSortBy] = useState("new");

  // Фильтры КБЖУ
  const [caloriesMax, setCaloriesMax] = useState<number>(1000);
  const [useCalories, setUseCalories] = useState(false);

  const [proteinMin, setProteinMin] = useState<number>(0);
  const [useProtein, setUseProtein] = useState(false);

  const [fatMax, setFatMax] = useState<number>(100);
  const [useFat, setUseFat] = useState(false);

  const [carbsMax, setCarbsMax] = useState<number>(100);
  const [useCarbs, setUseCarbs] = useState(false);

  // Список активных фильтров для "чипсов"
  const activeFilters = useMemo(() => {
    const list = [];
    const suffix = filterMode === "100g" ? "/100г" : "";

    if (useCalories)
      list.push({
        id: "cal",
        label: `Ккалл  ≤  ${caloriesMax}${suffix}`,
        reset: () => setUseCalories(false),
      });
    if (useProtein)
      list.push({
        id: "prot",
        label: `Белок  ≥  ${proteinMin}г${suffix}`,
        reset: () => setUseProtein(false),
      });
    if (useFat)
      list.push({
        id: "fat",
        label: `Жиры  ≤  ${fatMax}г${suffix}`,
        reset: () => setUseFat(false),
      });
    if (useCarbs)
      list.push({
        id: "carb",
        label: `Углеводы  ≤  ${carbsMax}г${suffix}`,
        reset: () => setUseCarbs(false),
      });

    return list;
  }, [
    useCalories,
    caloriesMax,
    useProtein,
    proteinMin,
    useFat,
    fatMax,
    useCarbs,
    carbsMax,
    filterMode,
  ]);

  // Уникальные категории
  const categories = useMemo(() => {
    const cats = recipes.flatMap((r) => r.categories ?? []);
    return Array.from(new Set(cats));
  }, [recipes]);

  const filtered = useMemo(() => {
    const result = recipes.filter((r) => {
      const matchCat = !activeCategory || (r.categories ?? []).includes(activeCategory);

      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        r.title.toLowerCase().includes(s) ||
        r.description?.toLowerCase().includes(s) ||
        r.ingredients?.some((i) => i.name.toLowerCase().includes(s));

      const kbru = filterMode === "100g" ? r.kbru : r.kbruTotal;
      const effectiveKbru = kbru || {};

      const matchKbru =
        (!useCalories || (effectiveKbru.calories ?? 0) <= caloriesMax) &&
        (!useProtein || (effectiveKbru.protein ?? 0) >= proteinMin) &&
        (!useFat || (effectiveKbru.fat ?? 0) <= fatMax) &&
        (!useCarbs || (effectiveKbru.carbs ?? 0) <= carbsMax);

      const matchFav = !showOnlyFavorites || isFavorite(r.slug);

      return matchCat && matchSearch && matchKbru && matchFav;
    });

    // Sorting Logic
    return [...result].sort((a, b) => {
      const kbruA = filterMode === "100g" ? a.kbru : a.kbruTotal;
      const kbruB = filterMode === "100g" ? b.kbru : b.kbruTotal;

      switch (sortBy) {
        case "kcal-asc":
          return (kbruA?.calories ?? 0) - (kbruB?.calories ?? 0);
        case "kcal-desc":
          return (kbruB?.calories ?? 0) - (kbruA?.calories ?? 0);
        case "prot-desc":
          return (kbruB?.protein ?? 0) - (kbruA?.protein ?? 0);
        case "time-asc":
          return (a.cookTimeMinutes ?? 999) - (b.cookTimeMinutes ?? 999);
        default:
          return 0; // "new" - keep original order
      }
    });
  }, [
    recipes,
    activeCategory,
    search,
    filterMode,
    caloriesMax,
    useCalories,
    proteinMin,
    useProtein,
    fatMax,
    useFat,
    carbsMax,
    useCarbs,
    showOnlyFavorites,
    isFavorite,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearch("");
    setActiveCategory(null);
    setShowOnlyFavorites(false);
    setFilterMode("100g");

    setCaloriesMax(1000);
    setUseCalories(false);

    setProteinMin(0);
    setUseProtein(false);

    setFatMax(100);
    setUseFat(false);

    setCarbsMax(100);
    setUseCarbs(false);
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] font-sans text-zinc-300 p-4 sm:p-8 pb-32 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[160px] rounded-full animate-float-slow" />
        <div
          className="absolute -bottom-[20%] left-[5%] w-[60%] h-[60%] bg-orange-500/15 blur-[160px] rounded-full animate-float"
          style={{ animationDelay: "-10s" }}
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-4 md:space-y-6 lg:space-y-8 relative z-10">
        <div className="space-y-3 md:space-y-4 lg:space-y-6 transition-all duration-500">
          <div className="flex flex-col gap-3 md:gap-6 lg:gap-8 pb-3 md:pb-8 lg:pb-12">
            <PageHeader
              title="Рецепты"
              pluralLabels={["РЕЦЕПТ", "РЕЦЕПТА", "РЕЦЕПТОВ"]}
              countValue={recipes.length}
              icon={Utensils}
              accentColor="orange"
              subtitle="вкусно и полезно"
            />
            <RecipesControls
              search={search}
              setSearch={setSearch}
              showOnlyFavorites={showOnlyFavorites}
              setShowOnlyFavorites={setShowOnlyFavorites}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              hasActiveFilters={activeFilters.length > 0}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mr-2">
                Активно:
              </span>
              {activeFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={f.reset}
                  className="group flex items-center gap-3 px-4 py-2 bg-orange-500/5 border border-orange-500/20 rounded-full hover:border-orange-500/50 transition-all active:scale-95"
                >
                  <span className="text-[11px] font-mono font-bold text-orange-500 group-hover:text-orange-400 tracking-tight whitespace-nowrap">
                    {f.label}
                  </span>
                  <span className="text-orange-500/40 group-hover:text-orange-500 text-lg leading-none">
                    ×
                  </span>
                </button>
              ))}
              <button
                onClick={resetFilters}
                className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors ml-2 underline underline-offset-4"
              >
                Сбросить всё
              </button>
            </div>
          )}

          {showFilters && (
            <RecipeFilters
              filterMode={filterMode}
              setFilterMode={setFilterMode}
              caloriesMax={caloriesMax}
              setCaloriesMax={setCaloriesMax}
              useCalories={useCalories}
              setUseCalories={setUseCalories}
              proteinMin={proteinMin}
              setProteinMin={setProteinMin}
              useProtein={useProtein}
              setUseProtein={setUseProtein}
              fatMax={fatMax}
              setFatMax={setFatMax}
              useFat={useFat}
              setUseFat={setUseFat}
              carbsMax={carbsMax}
              setCarbsMax={setCarbsMax}
              useCarbs={useCarbs}
              setUseCarbs={setUseCarbs}
            />
          )}

          <div className="pt-6 md:pt-8 lg:pt-10">
            <RecipesCategories
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>

          <RecipesGrid
            recipes={filtered}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            resetFilters={resetFilters}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
