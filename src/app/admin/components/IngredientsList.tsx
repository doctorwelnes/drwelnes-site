"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface IngredientsListProps {
  ingredients: { name: string; amount: string; weight: string; isGroup?: boolean }[];
  onChange: (
    newIngredients: { name: string; amount: string; weight: string; isGroup?: boolean }[],
  ) => void;
  moveItem: (index: number, direction: "up" | "down") => void;
}

export function IngredientsList({ ingredients, onChange, moveItem }: IngredientsListProps) {
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  const getWeightValue = (weight: string) => weight.replace(/[^\d.,]/g, "");

  const getWeightUnit = (weight: string) => {
    if (/мл/i.test(weight)) return "мл";
    if (/мг/i.test(weight) || /г/i.test(weight)) return "г";
    return "";
  };

  const serializeWeight = (value: string, unit: "г" | "мл" | "") => {
    const normalizedValue = value.replace(/[^0-9.,]/g, "");
    if (!normalizedValue) return "";
    return unit ? `${normalizedValue}${unit}` : normalizedValue;
  };

  React.useEffect(() => {
    fetch("/api/ingredients")
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch(() => setSuggestions([]));
  }, []);

  const addIngredient = (isGroup = false) => {
    onChange([...ingredients, { name: "", amount: "", weight: "", isGroup }]);
  };

  const updateIngredient = (index: number, field: string, value: string | boolean) => {
    const newList = [...ingredients];
    newList[index] = { ...newList[index], [field]: value };
    onChange(newList);
  };

  const applyPreset = (preset: string) => {
    if (activeIdx !== null && !ingredients[activeIdx].isGroup) {
      updateIngredient(activeIdx, "amount", preset);
    } else {
      // If no active index, add a new ingredient with this amount
      onChange([...ingredients, { name: "", amount: preset, weight: "", isGroup: false }]);
      setActiveIdx(ingredients.length);
    }
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
    if (activeIdx === index) setActiveIdx(null);
  };

  const getFilteredSuggestions = (value: string) => {
    if (!value.trim()) return [];
    return suggestions.filter((ing) => ing.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
  };

  const handleNameChange = (index: number, value: string) => {
    updateIngredient(index, "name", value);
    setShowSuggestions(value.length > 0);
  };

  const selectSuggestion = (index: number, suggestion: string) => {
    updateIngredient(index, "name", suggestion);
    setShowSuggestions(false);
  };

  const calculateTotalWeight = () => {
    let total = 0;
    ingredients.forEach((ing) => {
      if (ing.isGroup) return;

      const weightStr = (ing.weight || "").toLowerCase();
      const match = weightStr.match(/(\d+(?:[.,]\d+)?)/);

      if (match) {
        const val = parseFloat(match[1].replace(",", "."));
        total += val;
      }
    });
    return total;
  };

  const totalWeight = calculateTotalWeight();

  const presets = ["1 ч.л.", "1 ст.л.", "1 шт.", "1 скуп", "по вкусу", "щепотка"];

  return (
    <div className="space-y-6 bg-[#0d0d0d] p-8 rounded-3xl border border-white/5 shadow-2xl mt-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">
          Ингредиенты
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => addIngredient(true)}
            className="text-[9px] font-black uppercase text-amber-500/50 hover:text-amber-500 transition-colors"
          >
            + Добавить Группу
          </button>
          <button
            onClick={() => addIngredient(false)}
            className="text-[9px] font-black uppercase text-amber-500/50 hover:text-amber-500 transition-colors"
          >
            + Ингредиент
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 bg-neutral-900 border border-white/5 rounded-lg text-[9px] font-black uppercase text-neutral-400 hover:text-amber-500 hover:border-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {ingredients.length > 0 && (
          <div className="flex gap-3 px-10 mb-2 invisible lg:visible">
            <span className="flex-[2] text-[8px] font-black uppercase text-neutral-700 tracking-wider">
              Название ингредиента
            </span>
            <span className="flex-1 text-[8px] font-black uppercase text-neutral-700 tracking-wider">
              Мера / Кол-во
            </span>
            <span className="flex-1 text-[8px] font-black uppercase text-neutral-700 tracking-wider">
              Вес / Объем
            </span>
          </div>
        )}

        {ingredients.map((ing, i) => (
          <div
            key={i}
            className={`flex gap-3 items-center group animate-in fade-in slide-in-from-left-2 duration-200 ${ing.isGroup ? "mt-6 first:mt-0" : ""}`}
          >
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => moveItem(i, "up")}
                className="text-[8px] text-neutral-600 hover:text-amber-500 p-0.5"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(i, "down")}
                className="text-[8px] text-neutral-600 hover:text-amber-500 p-0.5"
              >
                ▼
              </button>
            </div>

            {ing.isGroup ? (
              <div className="flex-1 flex items-center gap-3 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-2 border-amber-500 p-4 rounded-r-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-amber-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <input
                  placeholder="Название группы (напр. Тесто)"
                  value={ing.name || ""}
                  onChange={(e) => updateIngredient(i, "name", e.target.value)}
                  onFocus={() => setActiveIdx(i)}
                  className="flex-1 bg-transparent border-none p-0 text-amber-500 font-black uppercase text-sm tracking-widest outline-none placeholder:text-amber-500/30"
                />
              </div>
            ) : (
              <>
                <div className="flex-[2] relative">
                  <input
                    placeholder="Ингредиент"
                    value={ing.name || ""}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    onFocus={() => {
                      setActiveIdx(i);
                      setFocusedIndex(i);
                      setShowSuggestions(ing.name.length > 0);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        setShowSuggestions(false);
                        setFocusedIndex(null);
                      }, 200);
                    }}
                    className="w-full bg-[#0c0c0c] border border-neutral-800 p-3 rounded-xl text-neutral-200 text-sm outline-none focus:border-amber-500/30 relative z-10"
                  />
                  {showSuggestions &&
                    focusedIndex === i &&
                    getFilteredSuggestions(ing.name).length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl max-h-32 overflow-y-auto z-50">
                        {getFilteredSuggestions(ing.name).map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => selectSuggestion(i, suggestion)}
                            className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-amber-500/10 hover:text-amber-500 transition-colors first:rounded-t-xl last:rounded-b-xl"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
                <input
                  placeholder="Кол-во (1 шт, 1 скуп)"
                  value={ing.amount || ""}
                  onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                  onFocus={() => setActiveIdx(i)}
                  className={`flex-1 bg-[#0c0c0c] border p-3 rounded-xl text-neutral-400 text-[11px] outline-none font-bold uppercase transition-all ${activeIdx === i ? "border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "border-neutral-800"}`}
                />
                <div className="flex-1 flex items-center bg-[#0d0d0d] border border-neutral-800 rounded-xl focus-within:border-amber-500/30 transition-all shadow-inner overflow-hidden min-w-[120px]">
                  <input
                    placeholder="30, 50..."
                    value={getWeightValue(ing.weight || "")}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.,]/g, "");
                      updateIngredient(
                        i,
                        "weight",
                        serializeWeight(val, getWeightUnit(ing.weight || "") as "г" | "мл" | ""),
                      );
                    }}
                    onFocus={() => setActiveIdx(i)}
                    className="flex-1 bg-transparent p-3 text-amber-500/80 text-[11px] outline-none font-mono font-black w-full"
                  />
                  <div className="flex bg-neutral-900/50 p-1 m-1 rounded-lg border border-white/5 shrink-0">
                    {["г", "мл"].map((u) => {
                      const currentUnit = getWeightUnit(ing.weight || "");
                      const isSelected = currentUnit === u;
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => {
                            const val = getWeightValue(ing.weight || "");
                            updateIngredient(
                              i,
                              "weight",
                              isSelected ? val : serializeWeight(val, u as "г" | "мл"),
                            );
                          }}
                          className={`px-2 py-1 rounded-md text-[8px] font-black uppercase transition-all ${
                            isSelected
                              ? "bg-amber-500 text-black shadow-lg"
                              : "text-neutral-600 hover:text-neutral-400"
                          }`}
                        >
                          {u}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => removeIngredient(i)}
              className="p-2 text-neutral-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {ingredients.length > 0 && totalWeight > 0 && (
        <div className="pt-6 border-t border-white/5 flex justify-end">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Итого вес:
            </span>
            <span className="text-sm font-black text-amber-500">{totalWeight} г</span>
          </div>
        </div>
      )}
    </div>
  );
}
