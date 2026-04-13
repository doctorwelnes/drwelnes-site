"use client";

import { useState, useMemo } from "react";
import { Beaker, ChevronRight, Activity, Info, Trophy } from "lucide-react";
import Link from "next/link";

export default function OneRmPage() {
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(5);

  const stats = useMemo(() => {
    if (reps === 1) return { avg: weight, epley: weight, brzycki: weight, lander: weight };

    const epley = Math.round(weight * (1 + reps / 30));
    const brzycki = Math.round(weight * (36 / (37 - reps)));
    const lander = Math.round((weight * 100) / (101.3 - 2.67123 * reps));
    const avg = Math.round((epley + brzycki + lander) / 3);

    return { avg, epley, brzycki, lander };
  }, [weight, reps]);

  // Percentage table for training
  const percentages = [100, 95, 90, 85, 80, 75, 70, 60, 50].map((p) => ({
    pct: p,
    val: Math.round((stats.avg * p) / 100),
  }));

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
          <span className="text-zinc-500">Разовый максимум (1RM)</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Beaker className="w-8 h-8 text-orange-500" />
          Разовый максимум (1RM)
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Определи свой разовый максимум в базовых упражнениях по подтягиванию, жиму или приседу.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Calc Form */}
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          {/* Weight Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Рабочий вес
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {weight}{" "}
                <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">кг</span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="400"
              step="2.5"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>

          {/* Reps Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Повторения
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {reps}{" "}
                <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">раз</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              value={reps}
              onChange={(e) => setReps(Number(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { lbl: "По формуле Эпли", val: stats.epley },
              { lbl: "По формуле Бржицки", val: stats.brzycki },
              { lbl: "По формуле Ландера", val: stats.lander },
            ].map((f) => (
              <div
                key={f.lbl}
                className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center"
              >
                <div className="text-[7.5px] font-black uppercase tracking-widest text-zinc-600 mb-1 leading-snug">
                  {f.lbl}
                </div>
                <div className="text-lg font-black italic text-zinc-400">
                  {f.val} <span className="text-[8px] not-italic">кг</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Results Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="bg-orange-600 p-8 rounded-[40px] text-white shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group">
            <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
              Ваш 1RM (Средний)
            </div>
            <div className="text-6xl font-black italic tracking-tighter leading-none mb-2">
              {stats.avg}
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest">килограмм</div>
          </div>

          <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-orange-400" />
              <h2 className="text-[10px] font-black uppercase tracking-widest text-white">
                Проценты от веса
              </h2>
            </div>
            <div className="space-y-2">
              {percentages.map((p) => (
                <div
                  key={p.pct}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    {p.pct}%
                  </span>
                  <span className="text-sm font-black italic text-white">{p.val} кг</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 text-center justify-center">
            <Info className="w-4 h-4 text-zinc-600 shrink-0" />
            <p className="text-[9px] text-zinc-600 font-bold leading-tight italic">
              «Чем меньше повторений в подходе, тем точнее расчёт разового максимума».
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
