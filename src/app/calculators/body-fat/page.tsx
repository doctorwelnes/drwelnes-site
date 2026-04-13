"use client";

import { useState, useMemo } from "react";
import { Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function BodyFatPage() {
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [waist, setWaist] = useState(80);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);

  const results = useMemo(() => {
    let bodyFat = 0;

    if (sex === "male") {
      // US Navy Formula for Men
      bodyFat =
        495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      // US Navy Formula for Women
      bodyFat =
        495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) -
        450;
    }

    const bf = Math.max(2, Math.min(60, bodyFat));
    const fatMass = (weight * bf) / 100;
    const leanMass = weight - fatMass;

    let category = "";
    let color = "text-emerald-500";

    if (sex === "male") {
      if (bf < 6) category = "Жизненно необходимый";
      else if (bf < 14) category = "Атлетический";
      else if (bf < 18) category = "Спортивный";
      else if (bf < 25) category = "Средний";
      else {
        category = "Ожирение";
        color = "text-red-500";
      }
    } else {
      if (bf < 14) category = "Жизненно необходимый";
      else if (bf < 21) category = "Атлетический";
      else if (bf < 25) category = "Спортивный";
      else if (bf < 32) category = "Средний";
      else {
        category = "Ожирение";
        color = "text-red-500";
      }
    }

    return {
      bf: bf.toFixed(1),
      fatMass: fatMass.toFixed(1),
      leanMass: leanMass.toFixed(1),
      category,
      color,
    };
  }, [sex, height, weight, waist, neck, hip]);

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
          <span className="text-zinc-500">Процент жира</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-orange-500" /> Процент жира
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Оцени процент жировой массы по антропометрическим измерениям.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-8">
          <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5 max-w-[280px]">
            <button
              onClick={() => setSex("male")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sex === "male" ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              Мужчина
            </button>
            <button
              onClick={() => setSex("female")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sex === "female" ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              Женщина
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between uppercase text-[10px] font-black tracking-widest text-zinc-500">
                  <span>Рост</span> <span>{height} см</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="230"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between uppercase text-[10px] font-black tracking-widest text-zinc-500">
                  <span>Вес</span> <span>{weight} кг</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between uppercase text-[10px] font-black tracking-widest text-zinc-500">
                  <span>Шея (обхват)</span> <span>{neck} см</span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="60"
                  value={neck}
                  onChange={(e) => setNeck(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between uppercase text-[10px] font-black tracking-widest text-zinc-500">
                  <span>Талия</span> <span>{waist} см</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={waist}
                  onChange={(e) => setWaist(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
                />
              </div>
              {sex === "female" && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="flex justify-between uppercase text-[10px] font-black tracking-widest text-zinc-500">
                    <span>Бедра</span> <span>{hip} см</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={hip}
                    onChange={(e) => setHip(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-orange-500 p-8 rounded-[40px] text-black shadow-[0_20px_40px_rgba(249,115,22,0.3)] relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Ваш жир (%)
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none">
                {results.bf}%
              </div>
            </div>

            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col justify-center gap-3">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Классификация
              </div>
              <div className={`text-sm font-black uppercase tracking-widest ${results.color}`}>
                {results.category}
              </div>
            </div>

            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col justify-center gap-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                LBM (Сухая масса)
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
