"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";

export default function OptionD() {
  const benefits = [
    "Меню под твой КБЖУ и предпочтения",
    "Разбор техники упражнений по видео",
    "Еженедельные отчеты и корректировки",
    "База знаний из 100+ экспертных статей",
    "Прямая связь с наставником 24/7",
    "Доступ к закрытому сообществу единомышленников",
  ];

  return (
    <section className="py-20 px-6 sm:px-12 bg-[#0c0d10] border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
              ПОЛНЫЙ ПАКЕТ <br /> РЕЗУЛЬТАТА
            </h2>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">
              Transparent Value & Commitment
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#16181d] border border-white/5 p-4 rounded-3xl">
            <div className="text-4xl font-black italic text-[#f95700]">100%</div>
            <div className="text-[10px] font-black uppercase text-zinc-500 leading-tight">
              Expert <br /> Support
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="group bg-[#16181d] border border-white/5 p-6 rounded-[32px] flex items-center gap-6 hover:border-[#f95700]/30 transition-all hover:translate-x-2"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#f95700] transition-colors">
                <CheckCircle2 className="w-6 h-6 text-zinc-600 group-hover:text-black transition-colors" />
              </div>
              <p className="text-zinc-400 font-bold text-sm md:text-base group-hover:text-white transition-colors">
                {benefit}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-12 text-center">
          <p className="text-zinc-500 font-medium italic text-sm mb-6 max-w-lg mx-auto leading-relaxed">
            «Мы объединили науку, технологии и поддержку, чтобы у тебя не осталось шанса не прийти к
            цели».
          </p>
          <div className="inline-flex items-center gap-2 group cursor-pointer">
            <span className="text-xs font-black uppercase tracking-widest text-[#f95700] group-hover:underline underline-offset-4">
              Узнать все детали
            </span>
            <ChevronRight className="w-4 h-4 text-[#f95700] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
}
