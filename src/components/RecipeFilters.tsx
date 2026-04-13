"use client";

import React from "react";
import { Flame, Beef, Droplets, Wheat } from "lucide-react";

interface RecipeFiltersProps {
  filterMode: "100g" | "dish";
  setFilterMode: (mode: "100g" | "dish") => void;

  caloriesMax: number;
  setCaloriesMax: (val: number) => void;
  useCalories: boolean;
  setUseCalories: (val: boolean) => void;

  proteinMin: number;
  setProteinMin: (val: number) => void;
  useProtein: boolean;
  setUseProtein: (val: boolean) => void;

  fatMax: number;
  setFatMax: (val: number) => void;
  useFat: boolean;
  setUseFat: (val: boolean) => void;

  carbsMax: number;
  setCarbsMax: (val: number) => void;
  useCarbs: boolean;
  setUseCarbs: (val: boolean) => void;
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-orange-500" : "bg-zinc-800"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function RecipeFilters({
  filterMode,
  setFilterMode,
  caloriesMax,
  setCaloriesMax,
  useCalories,
  setUseCalories,
  proteinMin,
  setProteinMin,
  useProtein,
  setUseProtein,
  fatMax,
  setFatMax,
  useFat,
  setUseFat,
  carbsMax,
  setCarbsMax,
  useCarbs,
  setUseCarbs,
}: RecipeFiltersProps) {
  return (
    <div className="bg-[#13151a] border border-white/5 p-4 sm:p-6 xl:p-10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 border-t-orange-500/10">
      <div className="flex flex-col gap-6 sm:gap-10">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl self-start">
          <button
            onClick={() => setFilterMode("100g")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filterMode === "100g"
                ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            На 100 г
          </button>
          <button
            onClick={() => setFilterMode("dish")}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filterMode === "dish"
                ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            На всё блюдо
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Calories */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              !useCalories ? "opacity-40 grayscale-[0.5]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Flame className={`w-4 h-4 ${useCalories ? "text-orange-500" : "text-zinc-600"}`} />
                МАКС. КАЛОРИИ
              </label>
              <Switch checked={useCalories} onChange={setUseCalories} />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={1000}
                step="10"
                disabled={!useCalories}
                value={caloriesMax}
                onChange={(e) => setCaloriesMax(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span
                className={`text-orange-500 font-mono text-lg min-w-[3rem] text-right font-black ${
                  !useCalories ? "text-zinc-700" : ""
                }`}
              >
                {caloriesMax}
              </span>
            </div>
          </div>

          {/* Protein */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              !useProtein ? "opacity-40 grayscale-[0.5]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Beef className={`w-4 h-4 ${useProtein ? "text-orange-500" : "text-zinc-600"}`} />
                МИН. БЕЛОК
              </label>
              <Switch checked={useProtein} onChange={setUseProtein} />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={100}
                step="1"
                disabled={!useProtein}
                value={proteinMin}
                onChange={(e) => setProteinMin(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span
                className={`text-white font-mono text-lg min-w-[3rem] text-right font-black ${
                  !useProtein ? "text-zinc-700" : ""
                }`}
              >
                {proteinMin}г
              </span>
            </div>
          </div>

          {/* Fats */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              !useFat ? "opacity-40 grayscale-[0.5]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Droplets className={`w-4 h-4 ${useFat ? "text-orange-500" : "text-zinc-600"}`} />
                МАКС. ЖИРЫ
              </label>
              <Switch checked={useFat} onChange={setUseFat} />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={100}
                step="1"
                disabled={!useFat}
                value={fatMax}
                onChange={(e) => setFatMax(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span
                className={`text-white font-mono text-lg min-w-[3rem] text-right font-black ${
                  !useFat ? "text-zinc-700" : ""
                }`}
              >
                {fatMax}г
              </span>
            </div>
          </div>

          {/* Carbs */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              !useCarbs ? "opacity-40 grayscale-[0.5]" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Wheat className={`w-4 h-4 ${useCarbs ? "text-orange-500" : "text-zinc-600"}`} />
                МАКС. УГЛЕВОДЫ
              </label>
              <Switch checked={useCarbs} onChange={setUseCarbs} />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max={100}
                step="1"
                disabled={!useCarbs}
                value={carbsMax}
                onChange={(e) => setCarbsMax(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span
                className={`text-white font-mono text-lg min-w-[3rem] text-right font-black ${
                  !useCarbs ? "text-zinc-700" : ""
                }`}
              >
                {carbsMax}г
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
