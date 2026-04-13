"use client";

import { useState, useMemo } from "react";
import { Droplets, ChevronRight, Info } from "lucide-react";
import Link from "next/link";

export default function WaterPage() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState(30); // minutes per day

  const result = useMemo(() => {
    // Formula: Weight * 0.033 + (activityMinutes / 30) * 0.35
    const base = weight * 0.033;
    const activityBonus = (activity / 30) * 0.35;
    const total = base + activityBonus;

    return {
      total: total.toFixed(1),
      base: base.toFixed(1),
      bonus: activityBonus.toFixed(1),
    };
  }, [weight, activity]);

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
          <span className="text-zinc-500">Норма воды</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Droplets className="w-8 h-8 text-orange-500" /> Норма воды
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Рассчитай оптимальный объём воды по весу и уровню активности.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-12">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Ваш вес
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {weight}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">кг</span>
              </div>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Активность в день
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {activity}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">мин</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="180"
              step="15"
              value={activity}
              onChange={(e) => setActivity(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Норма воды может увеличиваться в жаркую погоду или при активном потоотделении.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-500 p-8 rounded-[40px] text-black shadow-xl relative overflow-hidden group min-h-[180px] flex flex-col justify-center">
              <Droplets className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Итоговая норма
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none mb-1">
                {result.total}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                литров / день
              </div>
            </div>

            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Базовая потребность
                </span>
                <span className="text-sm font-black text-white italic">{result.base} л</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                  Нагрузка (спорт)
                </span>
                <span className="text-sm font-black text-orange-400 italic">+{result.bonus} л</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
