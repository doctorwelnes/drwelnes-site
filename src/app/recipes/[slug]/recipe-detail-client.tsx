"use client";

import { useState } from "react";
import type { Recipe } from "@/lib/content";

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

function KbruCard({ label, data }: { label: string; data: Recipe["kbru"] }) {
  if (!data) return null;
  const hasValues = Object.values(data).some((v) => v !== undefined && v !== null);
  if (!hasValues) return null;

  return (
    <section className="card p-5 bg-gradient-to-br from-white/95 to-amber-50/40 border-amber-200/30">
      <h2 className="mb-3 text-base font-bold flex items-center gap-2">
        <span className="text-amber-500">⚡</span> {label}
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          ["Ккал", data.calories],
          ["Белки", data.protein],
          ["Жиры", data.fat],
          ["Углеводы", data.carbs],
        ].map(([lbl, val]) => (
          <div
            key={lbl as string}
            className="p-2.5 rounded-xl bg-white/80 border border-zinc-200/80"
          >
            <div className="text-xs text-muted">{lbl as string}</div>
            <div className="font-bold">{val ?? "—"}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RecipeDetailClient({ recipe }: { recipe: Recipe }) {
  const hasKbru = recipe.kbru && Object.values(recipe.kbru).some((v) => v != null);
  const hasKbruTotal = recipe.kbruTotal && Object.values(recipe.kbruTotal).some((v) => v != null);
  const hasKbruBasal = recipe.kbruBasal && Object.values(recipe.kbruBasal).some((v) => v != null);
  const showToggle = hasKbru && hasKbruTotal;

  const [kbruView, setKbruView] = useState<"100g" | "dish">(hasKbru ? "100g" : "dish");

  return (
    <main>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          {/* Title card */}
          <section className="card p-6 border-zinc-200/90 shadow-lg">
            <h1 className="m-0 text-[28px] leading-[1.12] tracking-[-0.03em] font-bold">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="mt-2 text-muted leading-relaxed max-w-[64ch]">{recipe.description}</p>
            )}
            {(recipe.prepTimeMinutes !== undefined || recipe.cookTimeMinutes !== undefined) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {recipe.prepTimeMinutes !== undefined && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300/25 text-amber-900">
                    🕐 Подготовка: {recipe.prepTimeMinutes} мин
                  </span>
                )}
                {recipe.cookTimeMinutes !== undefined && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-br from-red-100 to-rose-100 border border-red-300/20 text-red-900">
                    🔥 Приготовление: {recipe.cookTimeMinutes} мин
                  </span>
                )}
              </div>
            )}
          </section>

          {/* Video */}
          {recipe.videoFile ? (
            <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full h-auto max-h-[75vh]"
                src={recipe.videoFile}
                poster={recipe.videoPoster}
              />
            </div>
          ) : recipe.videoUrl ? (
            <iframe
              width="100%"
              height="420"
              src={toEmbedUrl(recipe.videoUrl)}
              title={recipe.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-2xl border-0 shadow-xl"
            />
          ) : null}

          {/* KBRU toggle */}
          {showToggle && (
            <div className="inline-flex self-start gap-1.5 p-1 rounded-full border border-zinc-200 bg-white/75 shadow-sm">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border-0 ${
                  kbruView === "100g"
                    ? "bg-zinc-100 border border-zinc-200 font-bold shadow-sm"
                    : "bg-transparent text-zinc-600"
                }`}
                onClick={() => setKbruView("100g")}
              >
                100 г
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-full text-sm cursor-pointer border-0 ${
                  kbruView === "dish"
                    ? "bg-zinc-100 border border-zinc-200 font-bold shadow-sm"
                    : "bg-transparent text-zinc-600"
                }`}
                onClick={() => setKbruView("dish")}
              >
                Блюдо
              </button>
            </div>
          )}
        </div>

        {/* Right column — sidebar */}
        <aside className="flex flex-col gap-3.5">
          {hasKbru && kbruView === "100g" && (
            <KbruCard label="КБЖУ (на 100 г)" data={recipe.kbru} />
          )}
          {hasKbruTotal && kbruView === "dish" && (
            <KbruCard label="КБЖУ (на блюдо)" data={recipe.kbruTotal} />
          )}
          {hasKbruBasal && (
            <KbruCard label="КБЖУ (100 г на основной обмен)" data={recipe.kbruBasal} />
          )}

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <section className="card p-5 bg-gradient-to-br from-white/95 to-amber-50/40 border-amber-200/20">
              <h2 className="mb-3 text-base font-bold flex items-center gap-2">
                <span className="text-amber-500">🧂</span> Ингредиенты
              </h2>
              <ul className="m-0 pl-4 grid gap-1.5">
                {recipe.ingredients.map((it, i) => (
                  <li key={i}>
                    <span className="font-semibold">{it.name}</span>
                    {it.amount && <span className="text-muted"> — {it.amount}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        {/* Steps — full width */}
        {recipe.steps && recipe.steps.length > 0 && (
          <section className="lg:col-span-2 card p-5 bg-gradient-to-br from-white/95 to-red-50/30 border-red-200/20">
            <h2 className="mb-3 text-lg font-bold flex items-center gap-2">
              <span className="text-red-400">✓</span> Шаги
            </h2>
            <ol className="m-0 p-0 list-none grid gap-3">
              {recipe.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 p-3 bg-white/70 rounded-xl border border-red-100/30"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-red-200 to-red-400 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
