"use client";

import { useState, useMemo } from "react";
import { Dumbbell, ChevronRight, Activity, History } from "lucide-react";
import Link from "next/link";

export default function WorkoutVolumePage() {
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(60);

  const tonnage = useMemo(() => {
    return sets * reps * weight;
  }, [sets, reps, weight]);

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
          <span className="text-zinc-500">Объём (тоннаж)</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-orange-500" /> Объём (тоннаж)
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Подсчитай суммарный тоннаж тренировки и контролируй нагрузку.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Кол-во подходов
              </label>
              <div className="text-2xl font-black italic text-white leading-none">{sets}</div>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={sets}
              onChange={(e) => setSets(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Повторений в подходе
              </label>
              <div className="text-2xl font-black italic text-white leading-none">{reps}</div>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Рабочий вес
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {weight}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">кг</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-orange-500 p-8 rounded-[40px] text-black shadow-xl relative overflow-hidden group min-h-[220px] flex flex-col justify-center">
            <History className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
              Суммарный тоннаж
            </div>
            <div className="text-6xl font-black italic tracking-tighter leading-none mb-2">
              {tonnage}
            </div>
            <div className="text-sm font-black uppercase tracking-widest opacity-60">
              кг поднято
            </div>
          </div>

          <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
              «Увеличение объема (веса или повторений) со временем — основной фактор гипертрофии.»
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
