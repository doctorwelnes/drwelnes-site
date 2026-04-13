"use client";

import { useState, useMemo } from "react";
import { Activity, ChevronRight, Target, Zap, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ProteinPage() {
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState("maintain");

  const result = useMemo(() => {
    const ranges: Record<string, { lo: number; hi: number; label: string; desc: string }> = {
      lose: {
        lo: 1.8,
        hi: 2.4,
        label: "Снижение веса",
        desc: "Высокий белок помогает удерживать мышцы при дефиците калорий.",
      },
      maintain: {
        lo: 1.2,
        hi: 1.6,
        label: "Поддержание",
        desc: "Оптимальный баланс для здоровья и восстановления.",
      },
      gain: {
        lo: 1.6,
        hi: 2.2,
        label: "Набор массы",
        desc: "Строительный материал для гипертрофии мышечной ткани.",
      },
      athlete: {
        lo: 2.0,
        hi: 2.8,
        label: "Спортсмен",
        desc: "Для профессиональных атлетов с огромным объемом нагрузок.",
      },
    };

    const current = ranges[goal] || ranges.maintain;
    return {
      ...current,
      minTotal: Math.round(weight * current.lo),
      maxTotal: Math.round(weight * current.hi),
    };
  }, [goal, weight]);

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
          <span className="text-zinc-500">Норма белка</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-orange-500" />
          Норма белка
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Узнай свою индивидуальную норму белка в сутки под свою цель и уровень активности.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        {/* Form */}
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-10">
          {/* Weight Slider */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Текущий вес
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

          {/* Goal Selector */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
              Ваша цель
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "lose", lbl: "Похудение", icon: <Target className="w-4 h-4" /> },
                { id: "maintain", lbl: "Поддержание", icon: <ShieldCheck className="w-4 h-4" /> },
                { id: "gain", lbl: "Набор массы", icon: <Zap className="w-4 h-4" /> },
                { id: "athlete", lbl: "Спорт", icon: <Activity className="w-4 h-4" /> },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`flex items-center gap-3 p-4 rounded-3xl border transition-all text-left ${
                    goal === g.id
                      ? "bg-orange-500/10 border-orange-500 text-white shadow-inner shadow-orange-500/10"
                      : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl border border-white/5 ${goal === g.id ? "bg-orange-500 text-black shadow-lg" : "bg-white/5"}`}
                  >
                    {g.icon}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-tight">{g.lbl}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Белок (протеин) жизненно важен не только для мышц, но и для иммунитета, ферментов и
              качества кожи/волос.
            </p>
          </div>
        </section>

        {/* Results Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="bg-orange-600 p-8 rounded-[40px] text-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group">
            <Activity className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">
              Норма белка в день
            </div>
            <div className="text-5xl font-black italic tracking-tighter leading-none mb-1">
              {result.minTotal} – {result.maxTotal}
            </div>
            <div className="text-[11px] font-black uppercase tracking-widest">грамм</div>

            <div className="mt-6 flex items-center justify-between p-3 bg-black/10 rounded-2xl border border-black/5">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                Коэффициент
              </span>
              <span className="text-xs font-black italic">
                {result.lo} – {result.hi} г/кг
              </span>
            </div>
          </div>

          <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl">
            <h3 className="text-white text-[11px] font-black uppercase tracking-widest mb-3 italic">
              {result.label}
            </h3>
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
              «{result.desc}»
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 text-center">
            <ShieldCheck className="w-5 h-5 text-orange-500 mx-auto mb-3 opacity-50" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
              «Добирайте норму из цельных продуктов: мяса, рыбы, яиц, бобовых и творога».
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
