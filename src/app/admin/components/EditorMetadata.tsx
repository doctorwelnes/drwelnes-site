"use client";

import React from "react";
import {
  Clock,
  Hash,
  Tag,
  RefreshCw,
  Sparkles,
  Dumbbell,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Activity,
  Trash2,
  BookOpen,
  Flame,
  Dna,
  Droplets,
  Wheat,
} from "lucide-react";

interface EditorMetadataProps {
  frontmatter: any;
  setFrontmatter: (fm: any) => void;
  activeFile: string | null;
  moveItem: (type: "ingredients" | "steps", index: number, direction: "up" | "down") => void;
  handleAICommand: (cmd: any) => void;
  openGallery: (field: string | null) => void;
}

const ChipInput = ({
  label,
  icon: Icon,
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  label: string;
  icon: any;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) => {
  const [input, setInput] = React.useState("");

  const addChip = () => {
    // Support splitting by comma
    const vals = input
      .split(/[,，]/)
      .map((v) => v.trim())
      .filter((v) => v && !values.includes(v));
    if (vals.length > 0) {
      onChange([...values, ...vals]);
      setInput("");
    }
  };

  const handleEdit = (index: number) => {
    const val = values[index];
    onChange(values.filter((_, i) => i !== index));
    setInput(val);
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
        <Icon className="w-3 h-3 text-amber-500/50" />
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 p-2 bg-[#0c0c0c] border border-neutral-800 rounded-xl min-h-[42px] focus-within:border-amber-500/30 transition-all shadow-inner">
        {values.map((v, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase rounded-lg cursor-pointer hover:bg-amber-500/20 transition-all"
            onClick={() => handleEdit(i)}
            title="Кликните для редактирования"
          >
            {v}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(values.filter((_, idx) => idx !== i));
              }}
              className="hover:text-white transition-colors"
            >
              <Hash size={10} className="rotate-45" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addChip();
            }
          }}
          onBlur={addChip}
          className="bg-transparent outline-none text-neutral-200 text-sm flex-1 min-w-[120px] placeholder-neutral-800"
          placeholder={placeholder}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {suggestions
            .filter((s) => !values.includes(s))
            .map((s) => (
              <button
                key={s}
                onClick={() => onChange([...values, s])}
                className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-neutral-500 hover:border-amber-500/30 hover:text-amber-500 transition-all"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

const CATEGORIES = [
  "Завтрак",
  "Обед",
  "Ужин",
  "Десерт",
  "Перекус",
  "Напитки",
  "ПП",
  "Постное",
  "Веган",
  "Другое",
];
const RECIPE_TAGS = [
  "ПП",
  "Полезно",
  "Быстро",
  "Low-carb",
  "Кето",
  "Веган",
  "На завтрак",
  "Белковое",
  "Десерт",
];
const EXERCISE_TAGS = [
  "Жиросжигание",
  "Набор массы",
  "Выносливость",
  "Сила",
  "Растяжка",
  "Кардио",
  "Дома",
  "В зале",
];
const THEORY_TAGS = [
  "Здоровье",
  "Биохимия",
  "Питание",
  "Тренировки",
  "Наука",
  "Советы",
  "Сон",
  "Гормоны",
];
const EQUIPMENT = [
  "Свое тело",
  "Гантели",
  "Штанга",
  "Турник",
  "Брусья",
  "Резинка",
  "Коврик",
  "Скамейка",
  "Тренажер",
  "Гиря",
];

function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("rutube.ru") && u.pathname.includes("/video/")) {
      const id = u.pathname.split("/video/")[1]?.replace(/\/$/, "");
      if (id) return `https://rutube.ru/play/embed/${id}`;
    }
  } catch {}
  return url;
}

const translit = (text: string) => {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ы: "y",
    э: "e",
    ю: "yu",
    я: "ya",
  };
  return text
    .toLowerCase()
    .split("")
    .map((char) => map[char] || char)
    .join("")
    .replace(/[^a-z0-9\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

const MUSCLE_SUGGESTIONS = [
  "Грудные",
  "Спина",
  "Плечи",
  "Бицепс",
  "Трицепс",
  "Квадрицепс",
  "Бицепс бедра",
  "Икры",
  "Ягодицы",
  "Пресс",
  "Поясница",
  "Предплечья",
];

export function EditorMetadata({
  frontmatter,
  setFrontmatter,
  activeFile,
  moveItem,
  handleAICommand,
  openGallery,
}: EditorMetadataProps) {
  const isRecipe = activeFile?.includes("recipes/");
  const isExercise = activeFile?.includes("exercises/");
  const isTheory = activeFile?.includes("theory/");
  const canPositionImage = isRecipe || isExercise;

  const handleTitleChange = (title: string) => {
    const updates: any = { title };
    const currentSlug = frontmatter.slug || "";
    const isNew = currentSlug === "" || currentSlug === "new-item" || currentSlug === "new-entry";

    if (isNew) {
      updates.slug = translit(title);
    }

    setFrontmatter({ ...frontmatter, ...updates });
  };

  const generateSlug = () => {
    if (frontmatter.title) {
      setFrontmatter({ ...frontmatter, slug: translit(frontmatter.title) });
    }
  };

  return (
    <div className="space-y-8 bg-[#0d0d0d] p-8 rounded-3xl border border-white/5 shadow-2xl">
      {/* Section: Основные данные */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
            Основные данные
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Title */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Hash className="w-3 h-3 text-amber-500/50" />
              {isExercise ? "Название упражнения" : isRecipe ? "Название рецепта" : "Заголовок"}
            </label>
            <input
              type="text"
              value={frontmatter.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 font-bold outline-none focus:border-amber-500/30 transition-all shadow-inner placeholder-neutral-800 text-xs"
              placeholder="Название..."
            />
          </div>

          {/* Slug */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-amber-500/50" />
                Slug (URL)
              </div>
              <button
                onClick={generateSlug}
                className="text-amber-500/50 hover:text-amber-500 transition-colors flex items-center gap-1 normal-case font-bold tracking-normal"
                title="Сгенерировать из заголовка"
              >
                <RefreshCw size={10} />
                <span className="text-[8px]">Auto-slug</span>
              </button>
            </label>
            <input
              type="text"
              value={frontmatter.slug || ""}
              onChange={(e) => setFrontmatter({ ...frontmatter, slug: e.target.value })}
              className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200/50 font-mono text-[10px] outline-none focus:border-amber-500/30 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {isRecipe && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Время приготовления
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500/50" />
                Подг.
              </label>
              <input
                type="number"
                value={frontmatter.prepTimeMinutes || ""}
                onChange={(e) =>
                  setFrontmatter({
                    ...frontmatter,
                    prepTimeMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-amber-500/30 transition-all shadow-inner"
                placeholder="Мин"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500/50" />
                Гот.
              </label>
              <input
                type="number"
                value={frontmatter.cookTimeMinutes || ""}
                onChange={(e) =>
                  setFrontmatter({
                    ...frontmatter,
                    cookTimeMinutes: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-amber-500/30 transition-all shadow-inner"
                placeholder="Мин"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock className="w-3 h-3 text-amber-500/50" />
                Итого
              </label>
              <div className="w-full bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg text-amber-500 font-black flex items-center justify-center h-[34px] text-xs">
                {(frontmatter.prepTimeMinutes || 0) + (frontmatter.cookTimeMinutes || 0)}{" "}
                <span className="text-[10px] ml-1 uppercase">мин</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KBJU Section for Recipes */}
      {isRecipe && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">КБЖУ</h3>
          </div>

          {/* KBJU per 100g */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-emerald-500/50" />
                Ккал / 100г
              </label>
              <input
                type="number"
                value={frontmatter.kbru?.calories || ""}
                onChange={(e) =>
                  setFrontmatter({
                    ...frontmatter,
                    kbru: { ...frontmatter.kbru, calories: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Dna className="w-3 h-3 text-emerald-500/50" />
                Белки / 100г
              </label>
              <input
                type="number"
                value={frontmatter.kbru?.protein || ""}
                onChange={(e) =>
                  setFrontmatter({
                    ...frontmatter,
                    kbru: { ...frontmatter.kbru, protein: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Droplets className="w-3 h-3 text-emerald-500/50" />
                Жиры / 100г
              </label>
              <input
                type="number"
                value={frontmatter.kbru?.fat || ""}
                onChange={(e) =>
                  setFrontmatter({
                    ...frontmatter,
                    kbru: { ...frontmatter.kbru, fat: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Wheat className="w-3 h-3 text-emerald-500/50" />
                Углеводы / 100г
              </label>
              <input
                type="number"
                value={frontmatter.kbru?.carbs || ""}
                onChange={(e) =>
                  setFrontmatter({
                    ...frontmatter,
                    kbru: { ...frontmatter.kbru, carbs: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-emerald-500/30 transition-all shadow-inner"
                placeholder="0"
              />
            </div>
          </div>

          {/* KBJU per 100g Display Chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                Ккал / 100г
              </label>
              <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                {frontmatter.kbru?.calories || 0}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                Белки / 100г
              </label>
              <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                {frontmatter.kbru?.protein || 0}г
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                Жиры / 100г
              </label>
              <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                {frontmatter.kbru?.fat || 0}г
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                Углеводы / 100г
              </label>
              <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                {frontmatter.kbru?.carbs || 0}г
              </div>
            </div>
          </div>

          {/* Calculated KBJU for whole dish */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            {(() => {
              // Calculate total weight from ingredients (weight field value as-is)
              const ingredients = frontmatter.ingredients || [];
              let totalWeight = 0;
              ingredients.forEach((ing: any) => {
                if (ing && ing.weight && !ing.isGroup) {
                  const match = String(ing.weight).match(/(\d+(?:[.,]\d+)?)/);
                  if (match) totalWeight += parseFloat(match[1].replace(",", ".")) || 0;
                }
              });
              // Factor: total weight / 100g
              const factor = totalWeight / 100;
              const kbru = frontmatter.kbru || {};
              const totalCalories = Math.round((kbru.calories || 0) * factor);
              const totalProtein = Math.round((kbru.protein || 0) * factor);
              const totalFat = Math.round((kbru.fat || 0) * factor);
              const totalCarbs = Math.round((kbru.carbs || 0) * factor);

              return (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                      Ккал (всего)
                    </label>
                    <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                      {totalCalories}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                      Белки (всего)
                    </label>
                    <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                      {totalProtein}г
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                      Жиры (всего)
                    </label>
                    <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                      {totalFat}г
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">
                      Углеводы (всего)
                    </label>
                    <div className="w-full bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg text-emerald-400 font-black text-center text-xs">
                      {totalCarbs}г
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Total weight indicator */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-wider">
              Вес блюда из ингредиентов:{" "}
              {(() => {
                const ingredients = frontmatter.ingredients || [];
                let totalWeight = 0;
                ingredients.forEach((ing: any) => {
                  if (ing && ing.weight && !ing.isGroup) {
                    const match = String(ing.weight).match(/(\d+(?:[.,]\d+)?)/);
                    if (match) totalWeight += parseFloat(match[1].replace(",", ".")) || 0;
                  }
                });
                return <span className="text-emerald-500">{totalWeight} мг</span>;
              })()}
            </span>
            <span className="text-[9px] text-neutral-700">Общий вес</span>
          </div>
        </div>
      )}

      {/* Exercise Metadata Section */}
      {isExercise && (
        <div className="space-y-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Параметры упражнения
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity className="w-3 h-3 text-orange-500/50" />
                Сложность
              </label>
              <select
                value={frontmatter.difficulty || ""}
                onChange={(e) => setFrontmatter({ ...frontmatter, difficulty: e.target.value })}
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-orange-500/30 shadow-inner appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Выберите сложность...
                </option>
                <option value="Низкая">Низкая</option>
                <option value="Средняя">Средняя</option>
                <option value="Высокая">Высокая</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Dumbbell className="w-3 h-3 text-orange-500/50" />
                Инвентарь
              </label>
              <select
                value={frontmatter.equipment || ""}
                onChange={(e) => setFrontmatter({ ...frontmatter, equipment: e.target.value })}
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-orange-500/30 shadow-inner appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Выберите инвентарь...
                </option>
                {EQUIPMENT.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
                <option value="custom">+ Свой вариант (текстом)</option>
              </select>
              {frontmatter.equipment === "custom" && (
                <input
                  type="text"
                  placeholder="Введите свой инвентарь..."
                  className="w-full bg-[#0c0c0c] border border-amber-500/20 p-2 rounded-lg text-neutral-200 text-xs outline-none focus:border-amber-500/40 animate-in slide-in-from-top-1"
                  onBlur={(e) => setFrontmatter({ ...frontmatter, equipment: e.target.value })}
                />
              )}
            </div>
          </div>

          <ChipInput
            label="Целевые группы мышц"
            icon={Shield}
            values={frontmatter.muscles || []}
            onChange={(vals) => setFrontmatter({ ...frontmatter, muscles: vals })}
            placeholder="Грудные, Трицепс..."
            suggestions={MUSCLE_SUGGESTIONS}
          />

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-rose-500/50" />
                Частые ошибки
              </label>
              <button
                onClick={() => handleAICommand("exercise-mistakes")}
                className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-3 py-1.5 rounded-lg border border-rose-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Sparkles size={10} /> ✨ Шаблон
              </button>
            </div>
            <div className="space-y-3">
              {(frontmatter.commonMistakes || [""]).map((err: string, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={err || ""}
                    onChange={(e) => {
                      const newMistakes = [...(frontmatter.commonMistakes || [])];
                      newMistakes[idx] = e.target.value;
                      setFrontmatter({ ...frontmatter, commonMistakes: newMistakes });
                    }}
                    className="flex-1 bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-xs outline-none focus:border-rose-500/20 transition-all"
                    placeholder="Опишите ошибку..."
                  />
                  <button
                    onClick={() => {
                      const newMistakes = (frontmatter.commonMistakes || []).filter(
                        (_: any, i: number) => i !== idx,
                      );
                      setFrontmatter({ ...frontmatter, commonMistakes: newMistakes });
                    }}
                    className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setFrontmatter({
                    ...frontmatter,
                    commonMistakes: [...(frontmatter.commonMistakes || []), ""],
                  })
                }
                className="w-full py-2 border border-dashed border-neutral-800 hover:border-neutral-700 rounded-lg text-[9px] font-black uppercase text-neutral-600 hover:text-neutral-400 transition-all"
              >
                + Добавить ошибку
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                Совет эксперта
              </label>
              <button
                onClick={() => handleAICommand("exercise-advice")}
                className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Sparkles size={10} /> ✨ Шаблон
              </button>
            </div>
            <textarea
              value={frontmatter.proTip || ""}
              onChange={(e) => setFrontmatter({ ...frontmatter, proTip: e.target.value })}
              className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-emerald-500/30 shadow-inner min-h-[60px] resize-y"
              placeholder="Введите полезный совет для выполнения упражнения..."
            />
          </div>
        </div>
      )}

      {/* Categories & Tags */}
      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {!isExercise && !isTheory && (
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Tag className="w-3 h-3 text-amber-500/50" />
                Категория
              </label>
              <select
                value={frontmatter.category || ""}
                onChange={(e) => setFrontmatter({ ...frontmatter, category: e.target.value })}
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-3 rounded-xl text-neutral-200 text-xs outline-none focus:border-amber-500/30 shadow-inner appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Выберите категорию...
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={isExercise || isTheory ? "col-span-2" : ""}>
            <ChipInput
              label="Теги"
              icon={Tag}
              values={frontmatter.tags || []}
              onChange={(vals) => setFrontmatter({ ...frontmatter, tags: vals })}
              placeholder="добавьте тег..."
              suggestions={
                isRecipe ? RECIPE_TAGS : isExercise ? EXERCISE_TAGS : isTheory ? THEORY_TAGS : []
              }
            />
          </div>
        </div>
      </div>

      {/* Theory Specific: E-E-A-T & UX */}
      {isTheory && (
        <div className="space-y-10 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
              Экспертные данные (E-E-A-T)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-500/50" />
                Эксперт / Рецензент
              </label>
              <input
                type="text"
                value={frontmatter.author || ""}
                onChange={(e) => setFrontmatter({ ...frontmatter, author: e.target.value })}
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-blue-500/30 shadow-inner"
                placeholder="Имя эксперта или врача..."
              />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-500/50" />
                Время чтения
              </label>
              <input
                type="text"
                value={frontmatter.readingTime || ""}
                onChange={(e) => setFrontmatter({ ...frontmatter, readingTime: e.target.value })}
                className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-blue-500/30 shadow-inner"
                placeholder="Например: 5 мин"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-blue-500/50" />
              Краткое описание / Аннотация
            </label>
            <textarea
              value={frontmatter.description || ""}
              onChange={(e) => setFrontmatter({ ...frontmatter, description: e.target.value })}
              className="w-full bg-[#0c0c0c] border border-neutral-800 p-2 rounded-lg text-neutral-200 text-[10px] outline-none focus:border-blue-500/30 shadow-inner min-h-[50px] resize-y"
              placeholder="Кратко о чем статья..."
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
                Научные источники (Ссылки)
              </label>
            </div>
            <div className="space-y-3">
              {(frontmatter.references || []).map(
                (ref: { title: string; url: string }, idx: number) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-[#0c0c0c] border border-neutral-800 rounded-2xl relative group"
                  >
                    <input
                      type="text"
                      value={ref.title || ""}
                      onChange={(e) => {
                        const newRefs = [...(frontmatter.references || [])];
                        newRefs[idx].title = e.target.value;
                        setFrontmatter({ ...frontmatter, references: newRefs });
                      }}
                      className="bg-transparent border-b border-neutral-800 py-2 text-neutral-200 text-xs outline-none focus:border-emerald-500/20 transition-all"
                      placeholder="Название источника..."
                    />
                    <input
                      type="text"
                      value={ref.url || ""}
                      onChange={(e) => {
                        const newRefs = [...(frontmatter.references || [])];
                        newRefs[idx].url = e.target.value;
                        setFrontmatter({ ...frontmatter, references: newRefs });
                      }}
                      className="bg-transparent border-b border-neutral-800 py-2 text-neutral-400 text-[10px] font-mono outline-none focus:border-emerald-500/20 transition-all"
                      placeholder="https://..."
                    />
                    <button
                      onClick={() => {
                        const newRefs = (frontmatter.references || []).filter(
                          (_: any, i: number) => i !== idx,
                        );
                        setFrontmatter({ ...frontmatter, references: newRefs });
                      }}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center hover:bg-rose-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all shadow-lg"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ),
              )}
              <button
                onClick={() =>
                  setFrontmatter({
                    ...frontmatter,
                    references: [...(frontmatter.references || []), { title: "", url: "" }],
                  })
                }
                className="w-full py-4 border border-dashed border-neutral-800 hover:border-neutral-700 rounded-2xl text-[10px] font-black uppercase text-neutral-600 hover:text-neutral-400 transition-all bg-neutral-900/10"
              >
                + Добавить ссылку на источник
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
