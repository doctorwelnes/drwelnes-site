"use client";

import React, { useState, useId } from "react";
import {
  Heart,
  ShoppingCart,
  ChefHat,
  ChevronRight,
  Zap,
  Beef,
  Droplets,
  Wheat,
  Tag,
} from "lucide-react";
import Link from "next/link";
import type { Recipe, RecipeKbru } from "@/lib/content";
import { useFavoritesSWR } from "@/hooks/useFavoritesSWR";
import { toast } from "sonner";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

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

function normalizeMediaUrl(value?: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;

  try {
    const url = new URL(trimmed);
    if (url.pathname.startsWith("/uploads/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Leave non-absolute URLs untouched.
  }

  return trimmed;
}
function NutrientRadarChart({ kbru }: { kbru: RecipeKbru }) {
  const p = kbru.protein || 0;
  const f = kbru.fat || 0;
  const c = kbru.carbs || 0;
  const maxVal = Math.max(p, f, c, 1);

  const data = [
    { subject: "Белки", value: p, fullMark: maxVal, label: `${p}г` },
    { subject: "Жиры", value: f, fullMark: maxVal, label: `${f}г` },
    { subject: "Углеводы", value: c, fullMark: maxVal, label: `${c}г` },
  ];

  return (
    <div className="bg-[#13151a]/60 backdrop-blur-xl p-5 rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-orange-500 mb-4">
        <span className="w-4 h-px bg-orange-500/50" /> Распределение нутриентов
      </h2>
      <div className="h-48 w-full pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#f95700", fontSize: 10, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, maxVal]} tick={false} axisLine={false} />
            <Radar
              name="Нутриенты"
              dataKey="value"
              stroke="#f95700"
              strokeWidth={2}
              fill="#f95700"
              fillOpacity={0.3}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-3">
        {data.map((item) => (
          <div key={item.subject} className="text-center">
            <div className="text-[8px] font-black uppercase tracking-tighter text-zinc-500">
              {item.subject}
            </div>
            <div className="text-[12px] font-black text-white">{item.label}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-zinc-600 font-bold leading-tight mt-3 text-center">
        Визуальное распределение энергии и макронутриентов в порции.
      </p>
    </div>
  );
}
function CalorieShareWidget({ recipe, isMobile }: { recipe: Recipe; isMobile: boolean }) {
  const [view, setView] = useState<"100g" | "dish">("100g");
  const uniqueId = useId().replace(/:/g, "");

  const ETALON = {
    kcal: 2500,
    protein: 180,
    fat: 80,
    carbs: 250,
  };

  const currentKbru = view === "100g" ? recipe.kbru : recipe.kbruTotal;
  const hasTotalData = !!recipe.kbruTotal?.calories;

  // Calculate percentages for visualization
  const stats = {
    kcal: Math.min(Math.round(((currentKbru?.calories || 0) / ETALON.kcal) * 100), 100),
    protein: Math.min(Math.round(((currentKbru?.protein || 0) / ETALON.protein) * 100), 100),
    fat: Math.min(Math.round(((currentKbru?.fat || 0) / ETALON.fat) * 100), 100),
    carbs: Math.min(Math.round(((currentKbru?.carbs || 0) / ETALON.carbs) * 100), 100),
  };

  // Real values for display
  const realValues = {
    kcal: Math.round(currentKbru?.calories || 0),
    protein: Math.round(currentKbru?.protein || 0),
    fat: Math.round(currentKbru?.fat || 0),
    carbs: Math.round(currentKbru?.carbs || 0),
  };

  // Find max value among BJU for highlighting
  const bjuValues = [
    { key: "protein", val: stats.protein },
    { key: "fat", val: stats.fat },
    { key: "carbs", val: stats.carbs },
  ];
  const maxVal = Math.max(...bjuValues.map((v) => v.val));

  return (
    <div
      className={`bg-[#13151a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden ${isMobile ? "p-4" : "p-5"}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-orange-500">
          <span className="w-4 h-px bg-orange-500/50" /> КБЖУ
        </h2>
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
          {(["100g", "dish"] as const).map((v) => (
            <button
              key={v}
              onClick={() => hasTotalData && setView(v)}
              disabled={v === "dish" && !hasTotalData}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${
                view === v ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"
              } ${v === "dish" && !hasTotalData ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              {v === "100g" ? "100г" : "Блюдо"}
            </button>
          ))}
        </div>
      </div>

      {!hasTotalData && view === "dish" ? (
        <div className="text-center py-4">
          <p className="text-[10px] text-zinc-500">Нет данных для всего блюда</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-6 px-4">
          {/* Silhouette Column */}
          <div className="relative w-32 h-48 flex items-center justify-center -ml-2">
            <svg
              viewBox="0 0 100 200"
              className="w-full h-full drop-shadow-[0_0_20px_rgba(249,87,0,0.15)]"
            >
              <defs>
                <linearGradient id={`fillGradient-${uniqueId}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#f95700" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
                <clipPath id={`silhouetteClip-${uniqueId}`}>
                  <path d="M50,10 C42,10 35,16 35,25 C35,34 42,40 50,40 C58,40 65,34 65,25 C65,16 58,10 50,10 Z M35,45 C25,45 15,50 15,65 L15,110 C15,115 20,120 25,120 L30,120 L30,180 C30,190 35,195 45,195 L55,195 C65,195 70,190 70,180 L70,120 L75,120 C80,120 85,115 85,110 L85,65 C85,50 75,45 65,45 L35,45 Z" />
                </clipPath>
              </defs>

              <path
                d="M50,10 C42,10 35,16 35,25 C35,34 42,40 50,40 C58,40 65,34 65,25 C65,16 58,10 50,10 Z M35,45 C25,45 15,50 15,65 L15,110 C15,115 20,120 25,120 L30,120 L30,180 C30,190 35,195 45,195 L55,195 C65,195 70,190 70,180 L70,120 L75,120 C80,120 85,115 85,110 L85,65 C85,50 75,45 65,45 L35,45 Z"
                fill="white"
                fillOpacity="0.04"
                stroke="white"
                strokeWidth="1"
                strokeOpacity="0.15"
              />

              <g clipPath={`url(#silhouetteClip-${uniqueId})`}>
                <rect
                  x="0"
                  y={200 - stats.kcal * 2}
                  width="100"
                  height={stats.kcal * 2}
                  fill={`url(#fillGradient-${uniqueId})`}
                  className="transition-all duration-500"
                />
                <rect
                  x="0"
                  y={198 - stats.kcal * 2}
                  width="100"
                  height="3"
                  fill="#f95700"
                  fillOpacity="0.9"
                  className="transition-all duration-500 shadow-[0_0_10px_#f95700]"
                />
              </g>
            </svg>

            <div className="absolute -top-6 -right-8 flex flex-col items-center justify-center bg-[#0c0d10]/90 backdrop-blur-md rounded-full w-14 h-14 border border-orange-500/30 shadow-[0_0_20px_rgba(249,87,0,0.3)] z-10">
              <span className="text-[16px] font-black italic text-orange-500 tabular-nums leading-none">
                {stats.kcal}%
              </span>
              <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5 leading-none">
                {realValues.kcal} ккал
              </span>
            </div>
          </div>

          {/* BJU Bars Column */}
          <div className="flex-1 flex flex-col gap-4">
            {[
              {
                label: "Б",
                val: stats.protein,
                real: realValues.protein,
                full: "Белки",
                unit: "г",
              },
              { label: "Ж", val: stats.fat, real: realValues.fat, full: "Жиры", unit: "г" },
              { label: "У", val: stats.carbs, real: realValues.carbs, full: "Углеводы", unit: "г" },
            ].map((item) => {
              const isMax = item.val === maxVal && item.val > 0;
              return (
                <div
                  key={item.label}
                  className={`space-y-1.5 p-2 rounded-xl transition-all ${isMax ? "bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,87,0,0.15)]" : ""}`}
                >
                  <div className="flex justify-between items-center px-0.5">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider ${isMax ? "text-orange-400" : "text-zinc-500"}`}
                    >
                      {item.full}
                    </span>
                    <span
                      className={`text-[11px] font-black italic ${isMax ? "text-orange-500" : "text-white"}`}
                    >
                      {item.real}
                      {item.unit}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full bg-orange-500 transition-all duration-500 ${isMax ? "shadow-[0_0_10px_#f95700]" : ""}`}
                      style={{ width: `${item.val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[8px] text-zinc-600 font-bold leading-tight mt-6 px-2 opacity-60">
        {view === "100g" ? "Значения на 100г продукта." : "Значения для всего блюда."} Эталон: 2500
        ккал / 180г Б / 80г Ж / 250г У.
      </p>
    </div>
  );
}
import { useSession } from "next-auth/react";

function KbruCard({
  kbru,
  kbruTotal,
  view,
  setView,
}: {
  kbru: Recipe["kbru"];
  kbruTotal: Recipe["kbruTotal"];
  view: "100g" | "dish" | "daily";
  setView: (v: "100g" | "dish" | "daily") => void;
}) {
  const { status } = useSession();
  const isAuthed = status === "authenticated";

  // Data to render based on view
  let dataToRender;
  if (view === "100g") dataToRender = kbru;
  else if (view === "dish") dataToRender = kbruTotal;
  else if (view === "daily") {
    // Etalon Targets: Male, 70kg, 175cm, 25yr (Maintenance ~2500 kcal)
    const TARGETS = { calories: 2500, protein: 180, fat: 80, carbs: 250 };
    if (kbruTotal) {
      dataToRender = {
        calories: Math.round(((kbruTotal.calories || 0) / TARGETS.calories) * 100) + "%",
        protein: Math.round(((kbruTotal.protein || 0) / TARGETS.protein) * 100) + "%",
        fat: Math.round(((kbruTotal.fat || 0) / TARGETS.fat) * 100) + "%",
        carbs: Math.round(((kbruTotal.carbs || 0) / TARGETS.carbs) * 100) + "%",
      };
    }
  }

  if (!kbru || !kbruTotal) return null;

  return (
    <section className="bg-[#13151a] border border-white/5 rounded-[32px] shadow-2xl overflow-hidden p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-orange-500">
          <span className="w-4 h-px bg-orange-500/50" /> КБЖУ
        </h2>
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
          <button
            onClick={() => setView("100g")}
            className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${
              view === "100g"
                ? "bg-orange-500 text-black shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            100г
          </button>
          <button
            onClick={() => setView("dish")}
            className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${
              view === "dish"
                ? "bg-orange-500 text-black shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Блюдо
          </button>
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-tight transition-all ${
              view === "daily"
                ? "bg-orange-500 text-black shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            % Нормы
          </button>
        </div>
      </div>

      {view === "daily" && !isAuthed ? (
        <div className="flex flex-col items-center justify-center text-center bg-white/5 rounded-2xl border border-white/5 border-dashed p-4 md:p-5">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
            <span className="text-orange-500 font-bold">!</span>
          </div>
          <p className="text-[10px] font-medium text-zinc-400 mb-3 max-w-[200px]">
            Войдите в аккаунт, чтобы рассчитать процент от вашей индивидуальной суточной нормы.
          </p>
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-xl bg-orange-500 text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Авторизация
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Ккал", val: dataToRender?.calories, unit: "ккал", icon: Zap },
            { label: "Белки", val: dataToRender?.protein, unit: "г", icon: Beef },
            { label: "Жиры", val: dataToRender?.fat, unit: "г", icon: Droplets },
            { label: "Углеводы", val: dataToRender?.carbs, unit: "г", icon: Wheat },
          ].map((item) => (
            <div
              key={item.label}
              className="relative rounded-xl bg-white/5 border border-white/5 overflow-hidden p-2.5 md:p-3"
            >
              <item.icon className="absolute -right-1 -bottom-1 w-8 h-8 opacity-[0.03] text-white -rotate-12" />
              <div className="flex items-center gap-1.5 mb-1 text-zinc-600 font-bold uppercase tracking-wider text-[9px]">
                <item.icon className="w-2.5 h-2.5 opacity-50 text-orange-500" />
                {item.label}
              </div>
              <div
                className={`font-black text-white text-lg md:text-xl ${view === "daily" && item.val ? "text-orange-500" : ""}`}
              >
                {item.val ?? "—"}{" "}
                <span className="text-[10px] opacity-40 font-black">
                  {item.val ? item.unit : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function RecipeDetailClient({ recipe }: { recipe: Recipe }) {
  const { toggleFavorite, isFavorite } = useFavoritesSWR();
  const fav = isFavorite(recipe.slug);

  const [kbruView, setKbruView] = useState<"100g" | "dish" | "daily">("100g");
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isVideoVertical, setIsVideoVertical] = useState(false);

  // Toggle step completion for cooking mode
  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  // Toggle cooking mode - clear steps when turning off
  const toggleCookingMode = () => {
    if (isCookingMode) {
      // Turning off - clear all completed steps
      setCompletedSteps(new Set());
    }
    setIsCookingMode(!isCookingMode);
  };

  // Toggle shopping mode - clear checked items when turning off
  const toggleShoppingMode = () => {
    if (isShoppingMode) {
      // Turning off - clear all checked ingredients
      setCheckedIngredients({});
    }
    setIsShoppingMode(!isShoppingMode);
  };

  // Smart Tags Logic
  const smartTags = React.useMemo(() => {
    const tags = [];
    const kb = recipe.kbru || {};
    if ((kb.carbs || 0) < 10) tags.push({ label: "Low Carb", color: "text-blue-400" });
    if ((kb.protein || 0) > 20) tags.push({ label: "High Protein", color: "text-orange-400" });
    if ((recipe.cookTimeMinutes || 0) + (recipe.prepTimeMinutes || 0) <= 20)
      tags.push({ label: "Quick", color: "text-amber-400" });
    return tags;
  }, [recipe]);

  const copyToClipboard = async () => {
    const list = recipe.ingredients
      ?.map((ing) => {
        const parts = [];
        if (ing.amount) parts.push(ing.amount);
        if (ing.weight) {
          let w = ing.weight;
          // Auto-append 'г' only if it's just a number (backwards compatibility)
          if (/^\d+(?:[.,]\d+)?$/.test(w)) {
            w += " г";
          } else if (/мг/i.test(w)) {
            w = w.replace(/(\d+(?:[.,]\d+)?)(?:\s*)мг/i, "$1 г");
          } else {
            // If it already has a unit, ensure space before unit (e.g., "100г" -> "100 г")
            w = w.replace(/(\d+)([гмл]+)/i, "$1 $2");
          }
          parts.push(`(${w})`);
        }
        const measure = parts.length > 0 ? ` ${parts.join(" ")}` : "";
        return `- ${ing.name}${measure}`;
      })
      .join("\n");
    const text = `🛒 Список покупок для "${recipe.title}":\n\n${list}\n\nПриятного аппетита! Dr.Welnes`;

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success("Список ингредиентов скопирован!");
    } else {
      // Fallback for non-secure contexts (local IP testing)
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("Список ингредиентов скопирован!");
      } catch (err) {
        toast.error("Не удалось скопировать");
      }
    }
  };

  return (
    <main className="max-w-7xl mx-auto animate-in fade-in duration-700 relative px-0 md:px-0">
      {/* Immersive Blurred Background */}
      {recipe.image && (
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-[600px] -z-10 opacity-20 blur-[120px] pointer-events-none"
          style={{ backgroundImage: `url(${recipe.image})`, backgroundSize: "cover" }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Title card */}
          <section className="bg-[#13151a]/60 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden p-5 md:p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />

            <Link href="/recipes" className="inline-flex items-center gap-2 group mb-6">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-orange-500/30 transition-all">
                <ChevronRight className="w-3 h-3 rotate-180 text-orange-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
                К рецептам
              </span>
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {recipe.categories?.[0] && (
                    <div className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-lg">
                      {recipe.categories[0]}
                    </div>
                  )}
                  {/* Smart Tags */}
                  {smartTags.map((tag) => (
                    <div
                      key={tag.label}
                      className={`px-2.5 py-1 bg-white/5 border border-white/10 ${tag.color} text-[9px] font-black uppercase tracking-widest rounded-lg`}
                    >
                      {tag.label}
                    </div>
                  ))}
                </div>
                <h1 className="font-black text-white uppercase tracking-tighter leading-tight italic text-2xl md:text-3xl">
                  {recipe.title}
                </h1>
                {recipe.description && (
                  <p className="mt-4 text-zinc-500 leading-relaxed font-medium max-w-[50ch] text-sm md:text-base">
                    {recipe.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFavorite(recipe.slug)}
                  className={`flex items-center justify-center rounded-2xl border transition-all shadow-2xl active:scale-90 w-12 h-12 md:w-14 md:h-14
                    ${
                      fav
                        ? "bg-orange-500/20 border-orange-500 text-orange-500 shadow-orange-500/20"
                        : "bg-white/5 border-white/10 text-zinc-500 hover:border-orange-500/50 hover:text-white"
                    }`}
                >
                  <Heart className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 md:gap-8 border-t border-white/5 mt-5 pt-5 md:mt-8 md:pt-6">
              {[
                [
                  "Время подготовки",
                  recipe.prepTimeMinutes ? `${recipe.prepTimeMinutes} мин` : null,
                ],
                ["Готовка", recipe.cookTimeMinutes ? `${recipe.cookTimeMinutes} мин` : null],
                [
                  "Общее время",
                  recipe.prepTimeMinutes || recipe.cookTimeMinutes
                    ? `${(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} мин`
                    : null,
                ],
              ].map(([lbl, val]) => (
                <div key={lbl as string}>
                  <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">
                    {lbl as string}
                  </div>
                  <div className="text-white font-black text-base uppercase tracking-tighter whitespace-nowrap">
                    {val || "—"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Video Section with Smart Detection - Moved up */}
          {(() => {
            const vFile = normalizeMediaUrl(recipe.videoFile);
            const vUrl = normalizeMediaUrl(recipe.videoUrl);
            const vPoster = normalizeMediaUrl(recipe.videoPoster);

            const isLocalVideo =
              (vFile && (vFile.toLowerCase().endsWith(".mp4") || vFile.startsWith("/uploads"))) ||
              (vUrl && vUrl.toLowerCase().endsWith(".mp4"));

            const finalVideoSrc = isLocalVideo ? vFile || vUrl : null;

            if (finalVideoSrc) {
              const cleanedSrc = finalVideoSrc.startsWith("http")
                ? finalVideoSrc
                : finalVideoSrc.startsWith("/")
                  ? finalVideoSrc
                  : `/${finalVideoSrc}`;

              return (
                <div
                  className={`rounded-[40px] overflow-hidden bg-black shadow-2xl flex items-center justify-center border border-white/5 w-full transition-all duration-500 ${isVideoVertical ? "aspect-[9/16] max-w-[400px] mx-auto" : "aspect-video"}`}
                >
                  <video
                    key={cleanedSrc}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                    poster={vPoster || undefined}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      if (video.videoHeight > video.videoWidth) {
                        setIsVideoVertical(true);
                      }
                    }}
                  >
                    <source src={cleanedSrc} type="video/mp4" />
                    Ваш браузер не поддерживает встроенные видео.
                  </video>
                </div>
              );
            }

            if (vUrl || vFile) {
              const embedUrl = toEmbedUrl(vUrl || vFile || "");
              return (
                <div className="rounded-[40px] overflow-hidden shadow-2xl aspect-video border border-white/5 w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title={recipe.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="border-0"
                  />
                </div>
              );
            }

            return null;
          })()}

          {/* KBRU Stats immediately below header (Mobile only) */}
          <div className="block lg:hidden">
            <KbruCard
              kbru={recipe.kbru}
              kbruTotal={recipe.kbruTotal}
              view={kbruView}
              setView={setKbruView}
            />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {/* Ingredients — Modern Clean Design */}
            <section className="p-5 md:p-6">
              <div className="flex flex-col gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-orange-500" />
                  <h2 className="font-black text-white uppercase tracking-tight text-lg md:text-xl">
                    Ингредиенты
                  </h2>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    Копировать
                  </button>
                  <button
                    onClick={toggleShoppingMode}
                    className={`flex-1 px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      isShoppingMode
                        ? "bg-orange-500 text-black"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {isShoppingMode ? "Готово" : "Покупка"}
                  </button>
                </div>
              </div>

              <div className="space-y-0">
                {recipe.ingredients?.map((ing, idx) =>
                  ing.isGroup ? (
                    // Group header — minimal elegant style
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-4 mt-6 first:mt-0 border-b border-white/10"
                    >
                      <span className="text-orange-500 font-black uppercase tracking-[0.15em] text-xs">
                        {ing.name}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
                    </div>
                  ) : (
                    // Regular ingredient — clean row style
                    <div
                      key={idx}
                      onClick={() =>
                        isShoppingMode &&
                        setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className={`flex items-center justify-between py-3.5 border-b border-white/5 transition-all ${
                        isShoppingMode ? "cursor-pointer" : "cursor-default"
                      } ${checkedIngredients[idx] && isShoppingMode ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        {isShoppingMode && (
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              checkedIngredients[idx]
                                ? "bg-orange-500 text-black"
                                : "border border-white/20 text-transparent"
                            }`}
                          >
                            {checkedIngredients[idx] && (
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                        <span
                          className={`text-zinc-300 font-medium text-sm ${
                            checkedIngredients[idx] && isShoppingMode ? "line-through" : ""
                          }`}
                        >
                          {ing.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        {ing.amount && <span className="text-zinc-500 text-sm">{ing.amount}</span>}
                        {ing.weight && (
                          <span className="text-orange-500 font-semibold text-sm tabular-nums">
                            {(() => {
                              const w = ing.weight;
                              if (/^\d+(?:[.,]\d+)?$/.test(w)) {
                                return w + " г";
                              }
                              if (/мг/i.test(w)) {
                                return w.replace(/(\d+(?:[.,]\d+)?)(?:\s*)мг/i, "$1 г");
                              }
                              return w.replace(/(\d+)([гмлкг]+)/i, "$1 $2");
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </section>

            {/* Steps — Modern Clean Design */}
            <section className="p-5 md:p-6">
              <div className="flex flex-col gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-[2px] bg-orange-500" />
                  <h2 className="font-black text-white uppercase tracking-tight text-lg md:text-xl">
                    Инструкция
                  </h2>
                </div>

                <button
                  onClick={toggleCookingMode}
                  className={`w-full py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                    ${
                      isCookingMode
                        ? "bg-orange-500 text-black"
                        : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  {isCookingMode ? "Готово" : "Режим готовки"}
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                {recipe.steps?.map((step: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => isCookingMode && toggleStep(idx)}
                    className={`flex items-center gap-3 rounded-2xl border transition-all
                      ${isCookingMode ? "cursor-pointer" : "cursor-default"}
                      py-3 px-4
                      ${
                        completedSteps.has(idx)
                          ? "bg-orange-500/10 border border-orange-500/40"
                          : "border border-white/5 hover:border-white/10 hover:bg-white/5"
                      }
                    `}
                  >
                    {/* Circular Step number */}
                    <div
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] transition-all
                        ${completedSteps.has(idx) ? "bg-orange-500 text-black" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"}
                      `}
                    >
                      {idx + 1}
                    </div>
                    <p
                      className={`flex-1 font-medium transition-all text-sm ${completedSteps.has(idx) ? "text-white" : "text-zinc-400"}`}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-4 mb-8 block lg:hidden">
            <CalorieShareWidget recipe={recipe} isMobile={true} />
            <NutrientRadarChart kbru={recipe.kbru || {}} />
          </div>

          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-500 shadow-[0_0_15px_rgba(249,87,0,0.05)] cursor-default transition-all hover:border-orange-500/40"
                >
                  <Tag className="w-3 h-3 opacity-80" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right column — sidebar (Desktop only) */}
        <aside className="hidden lg:flex sticky top-28 flex-col gap-6">
          <KbruCard
            kbru={recipe.kbru}
            kbruTotal={recipe.kbruTotal}
            view={kbruView}
            setView={setKbruView}
          />
          <CalorieShareWidget recipe={recipe} isMobile={false} />
          <NutrientRadarChart kbru={recipe.kbru || {}} />
        </aside>
      </div>
    </main>
  );
}
