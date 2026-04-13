"use client";

import { Search, Compass, Trophy } from "lucide-react";

export default function OptionB() {
  const steps = [
    {
      title: "АНАЛИЗ",
      desc: "Изучаем твои текущие показатели, анализы и цели.",
      icon: <Search className="w-6 h-6" />,
      color: "bg-blue-500",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    },
    {
      title: "СТРАТЕГИЯ",
      desc: "Создаем пошаговый план питания и тренировок.",
      icon: <Compass className="w-6 h-6" />,
      color: "bg-[#f95700]",
      shadow: "shadow-[0_0_20px_rgba(249,87,0,0.5)]",
    },
    {
      title: "ДЕЙСТВИЕ",
      desc: "Сопровождение 24/7 и корректировки плана.",
      icon: <TrendingUpIcon className="w-6 h-6" />,
      color: "bg-orange-600",
      shadow: "shadow-[0_0_20px_rgba(234,88,12,0.5)]",
    },
    {
      title: "РЕЗУЛЬТАТ",
      desc: "Закрепление достигнутого и выход на новый уровень.",
      icon: <Trophy className="w-6 h-6" />,
      color: "bg-amber-500",
      shadow: "shadow-[0_0_20px_rgba(245,158,11,0.5)]",
    },
  ];

  return (
    <section className="py-20 px-6 sm:px-12 bg-[#0c0d10] border-t border-white/5">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
            ПУТЬ К РЕЗУЛЬТАТУ
          </h2>
          <p className="text-[#f95700] font-black uppercase tracking-[0.3em] text-[10px]">
            Step by Step Transformation
          </p>
        </div>

        <div className="relative space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-[#f95700] to-amber-500 opacity-20 hidden md:block" />

          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row items-center gap-8 relative z-10 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            >
              {/* Content Side */}
              <div
                className={`flex-1 w-full p-8 rounded-[32px] bg-[#16181d] border border-white/5 hover:border-white/10 transition-colors ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}
              >
                <h3 className="text-2xl font-black italic uppercase tracking-tight text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-[40ch] mx-auto md:mx-0">
                  {step.desc}
                </p>
              </div>

              {/* Icon / Center */}
              <div
                className={`w-14 h-14 rounded-full ${step.color} ${step.shadow} flex items-center justify-center shrink-0 border-4 border-[#0c0d10] relative`}
              >
                <div className="text-black">{step.icon}</div>
                {/* Number indicator */}
                <div className="absolute -top-6 text-[10px] font-black text-zinc-700">0{i + 1}</div>
              </div>

              {/* Placeholder for symmetry */}
              <div className="flex-1 hidden md:block" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
