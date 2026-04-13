"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronRight, Target } from "lucide-react";
import Link from "next/link";

export default function TrainingMacrosPage() {
  const [dayType, setDayType] = useState("training"); // training, rest
  const [calories, setCalories] = useState(2500);

  const macros = useMemo(() => {
    let ratios = { p: 30, f: 25, c: 45 }; // Default training

    if (dayType === "rest") {
      ratios = { p: 35, f: 35, c: 30 }; // Higher protein/fat, lower carbs on rest
    }

    const pG = Math.round((calories * (ratios.p / 100)) / 4);
    const fG = Math.round((calories * (ratios.f / 100)) / 9);
    const cG = Math.round((calories * (ratios.c / 100)) / 4);

    return { pG, fG, cG, ratios };
  }, [dayType, calories]);

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
          <span className="text-zinc-500">БЖУ по дням</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Calendar className="w-8 h-8 text-orange-500" /> БЖУ по дням
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Составь циклирование БЖУ по дням отдыха и тренировок.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Тип дня
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDayType("training")}
                className={`p-6 rounded-2xl border transition-all text-left flex flex-col gap-2 ${dayType === "training" ? "bg-orange-500/10 border-orange-500 shadow-lg text-white" : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/20"}`}
              >
                <div className="text-xs font-black uppercase tracking-tight">Тренировка</div>
                <div className="text-[9px] font-bold opacity-60 leading-tight">
                  Высокие углеводы для энергии и роста
                </div>
              </button>
              <button
                onClick={() => setDayType("rest")}
                className={`p-6 rounded-2xl border transition-all text-left flex flex-col gap-2 ${dayType === "rest" ? "bg-zinc-800 border-zinc-700 shadow-lg text-white" : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/20"}`}
              >
                <div className="text-xs font-black uppercase tracking-tight">Отдых</div>
                <div className="text-[9px] font-bold opacity-60 leading-tight">
                  Низкие углеводы, фокус на жиры и белок
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Суточный калораж
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {calories}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">ккал</span>
              </div>
            </div>
            <input
              type="range"
              min="1200"
              max="5000"
              step="50"
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {[
              {
                lbl: "Белки",
                val: macros.pG,
                ratio: macros.ratios.p,
                color: "bg-emerald-500",
                icon: "🥩",
              },
              {
                lbl: "Жиры",
                val: macros.fG,
                ratio: macros.ratios.f,
                color: "bg-orange-500",
                icon: "🥑",
              },
              {
                lbl: "Углеводы",
                val: macros.cG,
                ratio: macros.ratios.c,
                color: "bg-blue-500",
                icon: "🍚",
              },
            ].map((m) => (
              <div
                key={m.lbl}
                className="bg-orange-500 p-6 rounded-[32px] text-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden flex items-center justify-between group"
              >
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    {m.lbl} ({m.ratio}%)
                  </div>
                  <div className="text-3xl font-black italic leading-none">
                    {m.val}{" "}
                    <span className="text-[10px] not-italic opacity-60 uppercase ml-1">г</span>
                  </div>
                </div>
                <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">
                  {m.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[32px] flex items-center gap-4">
            <Target className="w-8 h-8 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
              «Углеводное чередование предотвращает застой и оптимизирует гормональный фон.»
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
