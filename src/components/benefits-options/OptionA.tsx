"use client";

import { Utensils, Accessibility, TrendingUp, ShieldCheck } from "lucide-react";

export default function OptionA() {
  return (
    <section className="py-20 px-6 sm:px-12 bg-[#0c0d10] relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            ЧТО ТЫ ПОЛУЧИШЬ
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">
            Твой путь к совершенству начинается здесь
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Large Card */}
          <div className="md:col-span-2 md:row-span-2 bg-[#16181d] border border-white/5 rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f95700]/10 blur-[100px] -z-10 group-hover:bg-[#f95700]/20 transition-all duration-700" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-16 h-16 bg-[#f95700]/10 border border-[#f95700]/20 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500">
                <Utensils className="w-8 h-8 text-[#f95700]" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                  ПЕРСОНАЛЬНОЕ <br /> МЕНЮ
                </h3>
                <p className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed max-w-[30ch]">
                  Рацион, составленный экспертом под твои цели, вкус и ритм жизни. Больше никаких
                  голодовок.
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-zinc-400">
                    Auto-tracking
                  </div>
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-zinc-400">
                    Recipe Book
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Medium Card 1 */}
          <div className="md:col-span-2 bg-[#16181d] border border-white/5 rounded-[40px] p-8 relative overflow-hidden group hover:border-[#f95700]/30 transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#f95700]/10 group-hover:border-[#f95700]/20 transition-all">
                <Accessibility className="w-7 h-7 text-zinc-400 group-hover:text-[#f95700]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white group-hover:text-[#f95700] transition-colors">
                  ТРЕНИРОВКИ 24/7
                </h3>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                  Всегда под рукой на любом устройстве
                </p>
              </div>
            </div>
          </div>

          {/* Small Card 1 */}
          <div className="bg-[#16181d] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between hover:bg-white/5 transition-colors group">
            <TrendingUp className="w-10 h-10 text-[#f95700] opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-2">
              <h4 className="text-lg font-black italic uppercase tracking-tight text-white">
                ПРОГРЕСС
              </h4>
              <p className="text-zinc-600 text-xs font-medium">
                Еженедельные замеры и аналитика тела.
              </p>
            </div>
          </div>

          {/* Small Card 2 */}
          <div className="bg-[#16181d] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between hover:bg-white/5 transition-colors group">
            <ShieldCheck className="w-10 h-10 text-white opacity-20 group-hover:opacity-100 transition-opacity" />
            <div className="space-y-2">
              <h4 className="text-lg font-black italic uppercase tracking-tight text-white">
                ГАРАНТИЯ
              </h4>
              <p className="text-zinc-600 text-xs font-medium">
                Научный подход без вреда для организма.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
