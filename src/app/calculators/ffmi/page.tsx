"use client";

import { useState, useMemo } from "react";
import { Activity, ChevronRight, Info } from "lucide-react";
import Link from "next/link";

export default function FfmiPage() {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const [bodyFat, setBodyFat] = useState(15);

  const results = useMemo(() => {
    const leanMass = weight * (1 - bodyFat / 100);
    const ffmi = leanMass / (height / 100) ** 2;
    const normalizedFfmi = ffmi + 6 * (height / 100 - 1.8);

    let category = "Средний";
    let desc = "Обычный уровень без тренировок";
    let color = "text-blue-400";

    if (normalizedFfmi < 18) {
      category = "Ниже среднего";
      desc = "Недостаток мышечной массы";
      color = "text-zinc-500";
    } else if (normalizedFfmi < 20) {
      category = "Средний";
      desc = "Обычный уровень без тренировок";
      color = "text-emerald-500";
    } else if (normalizedFfmi < 22) {
      category = "Выше среднего";
      desc = "Регулярный любительский тренинг";
      color = "text-emerald-400";
    } else if (normalizedFfmi < 25) {
      category = "Отличный";
      desc = "Продвинутый уровень, хорошая генетика";
      color = "text-orange-500";
    } else {
      category = "Превосходный";
      desc = "Близок к натуральному (генетическому) максимуму";
      color = "text-red-500";
    }

    return {
      ffmi: ffmi.toFixed(1),
      normalized: normalizedFfmi.toFixed(1),
      leanMass: leanMass.toFixed(1),
      category,
      desc,
      color,
    };
  }, [height, weight, bodyFat]);

  return (
    <main className="animate-in fade-in duration-700">
      <section className="relative overflow-hidden bg-[#13151a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-3">
          <Link
            href="/calculators"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3 h-3 rotate-180" /> Назад
          </Link>
          <ChevronRight className="w-3 h-3 opacity-50" />
          <span className="text-zinc-500">Индекс FFMI</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-orange-500" /> Индекс FFMI
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Определи потенциал мышечного роста относительно нормы.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Рост
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {height}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">см</span>
              </div>
            </div>
            <input
              type="range"
              min="140"
              max="220"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Вес
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {weight}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">кг</span>
              </div>
            </div>
            <input
              type="range"
              min="40"
              max="150"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Процент жира
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {bodyFat}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">%</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="50"
              value={bodyFat}
              onChange={(e) => setBodyFat(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
            <div className="flex items-center gap-2 text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
              <Info className="w-3 h-3" />
              <span>
                Если вы не знаете процент жира, воспользуйтесь{" "}
                <Link
                  href="/calculators/body-fat"
                  className="text-orange-500 underline underline-offset-2"
                >
                  калькулятором жира
                </Link>
              </span>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-500 p-8 rounded-[40px] text-black shadow-xl relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
              <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Normalized FFMI
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none mb-1">
                {results.normalized}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                уровень атлетизма
              </div>
            </div>

            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col justify-center gap-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Категория
              </div>
              <div
                className={`text-sm font-black uppercase tracking-widest leading-snug ${results.color}`}
              >
                {results.category}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">{results.desc}</div>
            </div>

            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col justify-center gap-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Сухая масса
              </div>
              <div className="text-xl font-black text-white italic">
                {results.leanMass} <span className="text-[10px] not-italic opacity-40">кг</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
