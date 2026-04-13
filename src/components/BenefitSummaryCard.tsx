"use client";

import React from "react";
import {
  CheckCircle2,
  Zap,
  Target,
  Sparkles,
  Activity,
  Bluetooth as Healthcare,
} from "lucide-react";

const BENEFITS = [
  {
    title: "Снижение массы тела",
    desc: "Эффективное жиросжигание",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    title: "Долгосрочный рост мышц",
    desc: "Качественный рост",
    icon: <Target className="w-4 h-4" />,
  },
  {
    title: "Выстраивание рациона",
    desc: "Индивидуальный подход",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    title: "Восстановление",
    desc: "После травм/операций",
    icon: <Healthcare className="w-4 h-4" />,
  },
  {
    title: "Контроль/лечение",
    desc: "хронических заболеваний",
    icon: <Activity className="w-4 h-4" />,
  },
];

interface BenefitSummaryCardProps {
  onBookingClick: () => void;
}

export function BenefitSummaryCard({ onBookingClick }: BenefitSummaryCardProps) {
  return (
    <div className="relative group w-full max-w-[320px] animate-in fade-in zoom-in duration-1000 delay-300">
      {/* Background Glow */}
      <div className="absolute inset-x-0 -top-4 -bottom-4 bg-gradient-to-b from-[#f95700]/10 to-transparent blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="relative bg-[#16181d]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 shadow-2xl overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#f95700] flex items-center justify-center shadow-[0_0_20px_rgba(249,87,0,0.3)]">
              <CheckCircle2 className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-white font-black uppercase text-sm tracking-tighter">
              Что Вы получите
            </h3>
          </div>

          <div className="space-y-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-start gap-4 group/item">
                <div className="mt-1 w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 group-hover/item:text-[#f95700] group-hover/item:border-[#f95700]/30 transition-all duration-300">
                  {b.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm uppercase tracking-tighter leading-none group-hover/item:text-[#f95700] transition-colors">
                    {b.title}
                  </span>
                  <span className="text-zinc-600 text-xs font-medium uppercase mt-1 tracking-wider">
                    {b.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Premium Badge */}
          <div className="pt-4 mt-4 border-t border-white/5">
            <button
              onClick={onBookingClick}
              className="w-full bg-white text-black text-sm font-bold uppercase tracking-tighter py-2 px-4 rounded-full text-center hover:bg-[#f95700] transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Персональный план
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
