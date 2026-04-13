"use client";

import { useState, useMemo } from "react";
import { ChevronRight, Scale, Info } from "lucide-react";
import Link from "next/link";

export default function IdealWeightPage() {
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState(175);

  const results = useMemo(() => {
    const heightInches = height / 2.54;
    const over60 = Math.max(0, heightInches - 60);

    // Miller Formula
    const miller = sex === "male" ? 56.2 + 1.41 * over60 : 53.1 + 1.36 * over60;

    // Devine Formula
    const devine = sex === "male" ? 50 + 2.3 * over60 : 45.5 + 2.3 * over60;

    // Robinson Formula
    const robinson = sex === "male" ? 52 + 1.9 * over60 : 49 + 1.7 * over60;

    const avg = (miller + devine + robinson) / 3;

    return {
      miller: miller.toFixed(1),
      devine: devine.toFixed(1),
      robinson: robinson.toFixed(1),
      avg: avg.toFixed(1),
    };
  }, [sex, height]);

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
          <span className="text-zinc-500">Идеальный вес</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Scale className="w-8 h-8 text-orange-500" /> Идеальный вес
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Узнай свой идеальный вес по классическим формулам для своего роста и пола.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-12">
          <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/5 max-w-[280px]">
            <button
              onClick={() => setSex("male")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sex === "male" ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              Мужской
            </button>
            <button
              onClick={() => setSex("female")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sex === "female" ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              Женский
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Ваш рост
              </label>
              <div className="text-2xl font-black italic text-white leading-none">
                {height}{" "}
                <span className="text-[10px] not-italic text-zinc-600 uppercase ml-1">см</span>
              </div>
            </div>
            <input
              type="range"
              min="140"
              max="230"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-orange-500"
            />
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Эти формулы рассчитывают «медицинский ориентир» веса для долголетия, а не эстетический
              предел.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-500 p-8 rounded-[40px] text-black shadow-xl relative overflow-hidden group min-h-[160px] flex flex-col justify-center">
              <Scale className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                Средний идеал
              </div>
              <div className="text-6xl font-black italic tracking-tighter leading-none mb-1">
                {results.avg}
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest opacity-60">кг</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { lbl: "По формуле Девина", val: results.devine },
                { lbl: "По формуле Миллера", val: results.miller },
                { lbl: "По формуле Робинсона", val: results.robinson },
              ].map((r) => (
                <div
                  key={r.lbl}
                  className="bg-[#13151a]/60 backdrop-blur-md p-4 rounded-2xl border border-white/5 text-center"
                >
                  <div className="text-[7.5px] font-black uppercase tracking-widest text-zinc-500 mb-1 leading-snug">
                    {r.lbl}
                  </div>
                  <div className="text-sm font-black text-white italic">{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
