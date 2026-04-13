"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Dumbbell } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { Exercise } from "@/lib/content";
import { useExerciseFavoritesSWR } from "@/hooks/useExerciseFavoritesSWR";
import ExerciseCard from "@/components/ExerciseCard";

export default function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const { toggleFavorite, isFavorite } = useExerciseFavoritesSWR();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleToggleFavorite = useCallback(
    (slug: string) => toggleFavorite(slug),
    [toggleFavorite],
  );
  const checkIsFavorite = useCallback((slug: string) => isFavorite(slug), [isFavorite]);

  const categories = useMemo(() => {
    const cats = exercises.flatMap((e) => e.categories ?? []);
    return Array.from(new Set(cats));
  }, [exercises]);

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchCat = !activeCategory || (e.categories ?? []).includes(activeCategory);
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(s) ||
        (e.description ?? "").toLowerCase().includes(s) ||
        (e.tags ?? []).some((t) => t.toLowerCase().includes(s)) ||
        (e.muscles ?? []).some((m) => m.toLowerCase().includes(s));
      return matchCat && matchSearch;
    });
  }, [exercises, activeCategory, search]);

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-300 p-4 sm:p-8 font-sans relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[160px] rounded-full animate-float-slow" />
        <div
          className="absolute -bottom-[20%] left-[5%] w-[60%] h-[60%] bg-orange-500/15 blur-[160px] rounded-full animate-float"
          style={{ animationDelay: "-10s" }}
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-8 lg:space-y-12 relative z-10">
        <PageHeader
          title="Упражнения"
          pluralLabels={["УПРАЖНЕНИЕ", "УПРАЖНЕНИЯ", "УПРАЖНЕНИЙ"]}
          countValue={exercises.length}
          icon={Dumbbell}
          accentColor="orange"
          subtitle="Красота и здоровье"
        />

        {/* Search Bar - как в рецептах */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#16181d]/40 backdrop-blur-xl border border-white/5 rounded-[22px] shadow-2xl transition-all focus-within:bg-[#1a1c21] w-full">
          <Search className="w-4 h-4 text-orange-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ПОИСК ПО УПРАЖНЕНИЯМ..."
            className="bg-transparent border-none outline-none text-white font-mono text-xs uppercase w-full placeholder:text-zinc-600 tracking-widest min-w-0"
          />
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 md:px-0">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                ${
                  activeCategory === null
                    ? "bg-red-500 border-red-500 text-[#0c0d10] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                }`}
            >
              Все типы
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border capitalize
                  ${
                    activeCategory === cat
                      ? "bg-orange-500 border-orange-500 text-[#0c0d10] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-white/5 border-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-[#13151a] mt-8 animate-in fade-in zoom-in-95 duration-300">
            <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
              УПРАЖНЕНИЯ НЕ НАЙДЕНЫ
            </h3>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">
              ПОПРОБУЙТЕ ИЗМЕНИТЬ ПАРАМЕТРЫ ПОИСКА ИЛИ ФИЛЬТРОВ
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory(null);
              }}
              className="mt-8 px-8 py-3 bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-700 transition-colors"
            >
              СБРОСИТЬ ФИЛЬТРЫ
            </button>
          </div>
        ) : (
          <div className="grid gap-8 pb-12 mt-8 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((ex) => (
              <ExerciseCard
                key={ex.slug}
                exercise={ex}
                isFavorite={checkIsFavorite(ex.slug)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
