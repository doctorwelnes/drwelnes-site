"use client";

import { useState, useMemo } from "react";
import { Heart, ChevronRight, Activity, Zap, Timer } from "lucide-react";
import Link from "next/link";

export default function HrZonesPage() {
  const [age, setAge] = useState(30);
  const [restHr, setRestHr] = useState(60);

  const stats = useMemo(() => {
    const maxHr = 220 - age;
    const hrr = maxHr - restHr;

    const zones = [
      {
        name: "Зона 1: Восстановление",
        desc: "Активный отдых, разминка",
        minP: 0.5,
        maxP: 0.6,
        color: "bg-blue-400/20 text-blue-400 border-blue-400/30",
      },
      {
        name: "Зона 2: Жиросжигание",
        desc: "Легкий бег, база выносливости",
        minP: 0.6,
        maxP: 0.7,
        color: "bg-emerald-400/20 text-emerald-400 border-emerald-400/30",
      },
      {
        name: "Зона 3: Аэробная",
        desc: "Укрепление сердца, темповой бег",
        minP: 0.7,
        maxP: 0.8,
        color: "bg-amber-400/20 text-amber-400 border-amber-400/30",
      },
      {
        name: "Зона 4: Анаэробная",
        desc: "Порог лактата, интервалы",
        minP: 0.8,
        maxP: 0.9,
        color: "bg-orange-500/20 text-orange-500 border-orange-500/30",
      },
      {
        name: "Зона 5: Максимальная",
        desc: "Спринты, МПК тренировки",
        minP: 0.9,
        maxP: 1.0,
        color: "bg-red-500/20 text-red-500 border-red-500/30",
      },
    ];

    const resultZones = zones.map((z) => ({
      ...z,
      min: Math.round(hrr * z.minP + restHr),
      max: Math.round(hrr * z.maxP + restHr),
    }));

    return { maxHr, resultZones };
  }, [age, restHr]);

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
          <span className="text-zinc-500">Пульсовые зоны</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-orange-500" />
          Пульсовые зоны
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Рассчитай пульсовые зоны для тренировки сердца и сосудов.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Form */}
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          {/* Age Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Возраст
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {age}{" "}
                <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">лет</span>
              </div>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>

          {/* Resting HR Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                ЧСС покоя
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {restHr}{" "}
                <span className="text-[10px] uppercase not-italic text-zinc-600 ml-1">уд/мин</span>
              </div>
            </div>
            <input
              type="range"
              min="40"
              max="110"
              value={restHr}
              onChange={(e) => setRestHr(Number(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
            />
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Timer className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              ЧСС покоя лучше измерять утром после пробуждения, не вставая с кровати — это даст
              самый точный прогноз зон.
            </p>
          </div>
        </section>

        {/* Results Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="bg-orange-500 p-6 rounded-[32px] text-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group">
            <Heart className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">
              Максимальный пульс
            </div>
            <div className="text-4xl font-black italic tracking-tighter">
              {stats.maxHr} <span className="text-xs uppercase not-italic opacity-60">BPM</span>
            </div>
          </div>

          <div className="space-y-2">
            {stats.resultZones.map((z) => (
              <div
                key={z.name}
                className={`p-4 rounded-3xl border ${z.color} transition-all duration-300 hover:translate-x-1`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[10px] font-black uppercase tracking-tight italic">
                    {z.name}
                  </h3>
                  <div className="text-sm font-black tracking-tighter italic">
                    {z.min} – {z.max}
                  </div>
                </div>
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 line-clamp-1">
                  {z.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 text-center">
            <Zap className="w-5 h-5 text-orange-500 mx-auto mb-3 opacity-50" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
              «Зоны позволяют тренироваться эффективно, не перегружая ЦНС и достигая конкретных
              целей».
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
