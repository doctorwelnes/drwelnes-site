"use client";

import { Sparkles, Timer, GraduationCap } from "lucide-react";

export default function OptionC() {
  const cards = [
    {
      title: "ЭКОНОМИЯ ВРЕМЕНИ",
      desc: "Готовые рецепты за 15 минут. Никаких лишних походов по магазинам и раздумий у плиты.",
      icon: <Timer className="w-12 h-12" />,
      tag: "Time Saver",
    },
    {
      title: "НАУЧНЫЙ ПОДХОД",
      desc: "База знаний из 100+ статей на основе доказательной медицины. Только факты без мифов.",
      icon: <GraduationCap className="w-12 h-12" />,
      tag: "Science Based",
    },
    {
      title: "ЭКСПОНЕНЦИАЛЬНЫЙ РОСТ",
      desc: "Профильное сопровождение, которое ускоряет твой результат в 3 раза по сравнению с базой.",
      icon: <Sparkles className="w-12 h-12" />,
      tag: "Premium",
    },
  ];

  return (
    <section className="py-20 px-6 sm:px-12 bg-[#0c0d10] border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">
            ТВОИ НОВЫЕ СУПЕРСПОСОБНОСТИ
          </h2>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs md:text-sm">
            Everything you need to thrive
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div
              key={i}
              className="group relative h-[450px] md:h-[550px] bg-[#16181d] border border-white/5 rounded-[48px] overflow-hidden p-10 flex flex-col justify-between hover:border-[#f95700]/50 transition-all duration-700 hover:-translate-y-4"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#f95700]/10 blur-[80px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="space-y-6">
                <div className="text-[#f95700] mb-8 group-hover:scale-110 transition-transform duration-700 origin-left">
                  {card.icon}
                </div>
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f95700]">
                    {card.tag}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    {card.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">
                  {card.desc}
                </p>
                <div className="w-12 h-1 bg-white/10 group-hover:bg-[#f95700] transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
