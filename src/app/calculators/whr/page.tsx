"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft, ChevronRight, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WhrPage() {
  const [sex, setSex] = useState("male");
  const [waist, setWaist] = useState(80);
  const [hip, setHip] = useState(95);

  const results = useMemo(() => {
    const val = waist / hip;
    let status = "Низкий риск";
    let desc = "Норма, ваше здоровье в безопасности от абдоминального ожирения.";
    let color = "text-emerald-500";

    if (sex === "male") {
      if (val < 0.9) {
        status = "Низкий риск";
        desc = "Норма, ваше здоровье в безопасности от абдоминального ожирения.";
        color = "text-emerald-500";
      } else if (val < 1.0) {
        status = "Умеренный риск";
        desc = "Есть повод начать следить за питанием и физической активностью.";
        color = "text-amber-500";
      } else {
        status = "Высокий риск";
        desc = "Опасность метаболического синдрома и сердечно-сосудистых заболеваний.";
        color = "text-red-500";
      }
    } else {
      if (val < 0.8) {
        status = "Низкий риск";
        desc = "Норма, ваше здоровье в безопасности от абдоминального ожирения.";
        color = "text-emerald-500";
      } else if (val < 0.85) {
        status = "Умеренный риск";
        desc = "Есть повод начать следить за питанием и физической активностью.";
        color = "text-amber-500";
      } else {
        status = "Высокий риск";
        desc = "Опасность метаболического синдрома и сердечно-сосудистых заболеваний.";
        color = "text-red-500";
      }
    }

    return {
      ratio: val.toFixed(2),
      status,
      desc,
      color,
    };
  }, [sex, waist, hip]);

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
          <span className="text-zinc-500">Индекс WHR</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <ArrowRightLeft className="w-8 h-8 text-orange-500" /> Индекс WHR
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Посчитай соотношение талии и бёдер и оцени риск по типу ожирения.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-12">
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

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Обхват талии
                </label>
                <div className="text-2xl font-black italic text-white leading-none">
                  {waist}{" "}
                  <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">см</span>
                </div>
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

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  Обхват бедер
                </label>
                <div className="text-2xl font-black italic text-white leading-none">
                  {hip}{" "}
                  <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">см</span>
                </div>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                value={hip}
                onChange={(e) => setHip(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
              />
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Высокий индекс WHR может указывать на абдоминальное ожирение и метаболические риски.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-500 p-8 rounded-[40px] text-black shadow-xl relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
              <ArrowRightLeft className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Коэффициент
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none">
                {results.ratio}
              </div>
            </div>

            <div className="bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 flex flex-col justify-center gap-3 min-h-[120px]">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Оценка риска
              </div>
              <div
                className={`flex items-center gap-2 ${results.color} text-sm font-black uppercase tracking-widest`}
              >
                {results.status === "Низкий риск" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {results.status}
              </div>
              <div className="text-[10px] text-zinc-400 font-medium">{results.desc}</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
