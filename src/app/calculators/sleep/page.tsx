"use client";

import { useState, useMemo } from "react";
import { Moon, ChevronRight, Zap, Info, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SleepPage() {
  const [wakeTime, setWakeTime] = useState("07:00");

  const results = useMemo(() => {
    const [hours, minutes] = wakeTime.split(":").map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, minutes, 0);

    const cycles = [
      { num: 6, label: "Идеально (9ч)", duration: 9 * 60 },
      { num: 5, label: "Оптимально (7.5ч)", duration: 7.5 * 60 },
      { num: 4, label: "Минимум (6ч)", duration: 6 * 60 },
      { num: 3, label: "Тяжело (4.5ч)", duration: 4.5 * 60 },
    ];

    return cycles.map((c) => {
      const sleepDate = new Date(wakeDate.getTime() - (c.duration + 14) * 60000); // 14 mins to fall asleep
      return {
        ...c,
        time: sleepDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    });
  }, [wakeTime]);

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
          <span className="text-zinc-500">Цикл сна</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
          <Moon className="w-8 h-8 text-orange-500" /> Цикл сна
        </h1>
        <p className="mt-2 text-zinc-500 text-sm font-medium leading-relaxed max-w-[50ch]">
          Подбери оптимальное время отхода ко сну и подъёма по циклам.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        <section className="bg-[#13151a]/40 backdrop-blur-xl p-6 md:p-8 rounded-[40px] border border-white/5 shadow-xl space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Когда нужно проснуться?
            </label>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <Clock className="w-5 h-5 text-orange-500" />
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="bg-transparent border-0 text-3xl font-black text-white focus:ring-0 outline-none w-full italic"
              />
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3">
            <Info className="w-5 h-5 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
              Один цикл сна длится примерно 90 минут. Пробуждение между циклами позволяет
              чувствовать себя бодрее. В расчет заложено 14 минут на засыпание.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-4">
            Время ложиться спать
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {results.map((res, i) => (
              <div
                key={i}
                className={`bg-[#13151a]/60 backdrop-blur-md p-6 rounded-[32px] border border-white/5 shadow-xl flex items-center justify-between group hover:border-orange-500/30 transition-all ${i === 1 ? "border-orange-500/20 bg-orange-500/5" : ""}`}
              >
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">
                    {res.label}
                  </div>
                  <div
                    className={`text-3xl font-black italic transition-colors leading-none ${i === 1 ? "text-orange-500" : "text-white group-hover:text-orange-400"}`}
                  >
                    {res.time}
                  </div>
                </div>
                {i <= 1 && <CheckCircle2 className="w-6 h-6 text-orange-500/50" />}
              </div>
            ))}
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-[32px] flex items-center gap-4">
            <Zap className="w-8 h-8 text-orange-500 shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
              «Сон — это бесплатная и самая мощная добавка для вашего прогресса.»
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
