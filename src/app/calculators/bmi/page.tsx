"use client";

import { useState, useMemo } from "react";
import { Scale, ChevronRight, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function BmiPage() {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);

  const { bmi, category, color, percent, weightDiff, diffType, idealRange } = useMemo(() => {
    const val = weight / (height / 100) ** 2;
    let cat = "";
    let clr = "text-emerald-400";
    let pct = 0; // for visual scale (15 to 40 range)

    if (val < 18.5) {
      cat = "Недостаточная масса";
      clr = "text-blue-400";
      pct = Math.max(0, ((val - 15) / (40 - 15)) * 100);
    } else if (val < 25) {
      cat = "Норма вес";
      clr = "text-emerald-400";
      pct = ((val - 15) / (40 - 15)) * 100;
    } else if (val < 30) {
      cat = "Избыточный вес";
      clr = "text-amber-400";
      pct = ((val - 15) / (40 - 15)) * 100;
    } else if (val < 35) {
      cat = "Ожирение I степени";
      clr = "text-orange-400";
      pct = ((val - 15) / (40 - 15)) * 100;
    } else if (val < 40) {
      cat = "Ожирение II степени";
      clr = "text-red-400";
      pct = ((val - 15) / (40 - 15)) * 100;
    } else {
      cat = "Ожирение III степени";
      clr = "text-rose-600";
      pct = 100;
    }

    // Ideal weight range
    const hM = height / 100;
    const minWeight = 18.5 * hM ** 2;
    const maxWeight = 24.9 * hM ** 2;
    let weightDiff = 0;
    let diffType: "loss" | "gain" | "none" = "none";

    if (weight > maxWeight) {
      weightDiff = weight - maxWeight;
      diffType = "loss";
    } else if (weight < minWeight) {
      weightDiff = minWeight - weight;
      diffType = "gain";
    }

    return {
      bmi: val.toFixed(1),
      category: cat,
      color: clr,
      percent: pct,
      weightDiff: weightDiff.toFixed(1),
      diffType,
      idealRange: `${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} кг`,
    };
  }, [height, weight]);

  return (
    <main className="animate-in fade-in duration-700">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#13151a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">
          <Link
            href="/calculators"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3 h-3 rotate-180" />
            Назад
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-zinc-500">Индекс массы тела</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-orange-500" />
          Индекс массы тела
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Посчитай свой BMI и оцени, в каком диапазоне здоровья ты находишься.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Form */}
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          {/* Height Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Ваш рост
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {height}{" "}
                <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">см</span>
              </div>
            </div>
            <input
              type="range"
              min="120"
              max="230"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>

          {/* Weight Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Ваш вес
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {weight}{" "}
                <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">кг</span>
              </div>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              BMI не учитывает процент мышечной массы, поэтому может быть неточным для
              профессиональных атлетов.
            </p>
          </div>
        </section>

        {/* Results Bento Grid */}
        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* BMI Card */}
            <div className="col-span-2 bg-orange-500 p-8 rounded-[40px] text-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
              <Scale className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Индекс (BMI)
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none mb-2">
                {bmi}
              </div>
            </div>

            {/* Category Card */}
            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl flex flex-col justify-center gap-3">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Категория
              </div>
              <div
                className={`flex items-center gap-2 ${color} text-sm font-black uppercase tracking-widest`}
              >
                {category === "Норма вес" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {category}
              </div>
            </div>

            {/* Scale card */}
            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl flex flex-col justify-center">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                Положение
              </div>
              <div className="space-y-3">
                <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-400 opacity-20" />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white] transition-all duration-500 ease-out"
                    style={{ left: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-zinc-600">
                  <span>15</span>
                  <span className="text-emerald-500/50">25</span>
                  <span>40</span>
                </div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="col-span-2 bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl flex flex-col justify-center gap-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Цель для нормы
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-white italic">
                  {diffType === "none" ? (
                    <span className="text-emerald-500 tracking-widest font-black uppercase">
                      Ваш вес в норме
                    </span>
                  ) : (
                    <>
                      {diffType === "loss" ? "Сбросить" : "Набрать"}{" "}
                      <span className="text-xl text-orange-500">{weightDiff}</span>{" "}
                      <span className="text-[10px] not-italic">кг</span>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">
                    Идеальный диапазон
                  </div>
                  <div className="text-[10px] font-black text-zinc-300">{idealRange}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[32px]">
            <h3 className="text-white text-[11px] font-black uppercase tracking-widest mb-3 italic">
              Рекомендации
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Посчитать норму калорий", icon: "→", href: "/calculators/tdee" },
                { label: "Узнать норму белка", icon: "→", href: "/calculators/protein" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between text-[10px] font-bold text-zinc-400 hover:text-white transition-colors group"
                  >
                    {item.label}
                    <span className="group-hover:translate-x-1 transition-transform">
                      {item.icon}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
