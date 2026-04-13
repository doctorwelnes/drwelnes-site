"use client";

import { useState, useRef, useEffect } from "react";
import {
  Zap,
  Heart,
  Utensils,
  Activity,
  Trophy,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BENEFITS = [
  {
    id: 1,
    title: "Жиросжигание",
    desc: "Снижение жировой массы тела",
    icon: <Activity className="w-6 h-6" />,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-500/10",
  },
  {
    id: 2,
    title: "Набор массы",
    desc: "Наращивание мышечной массы",
    icon: <Trophy className="w-6 h-6" />,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 3,
    title: "Рацион",
    desc: "Выстраивание правильного рациона",
    icon: <Utensils className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: 4,
    title: "Реабилитация",
    desc: "Реабилитация после травм/операций",
    icon: <Heart className="w-6 h-6" />,
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-500/10",
  },
  {
    id: 5,
    title: "Здоровье",
    desc: "Контроль/лечение хронических заболеваний",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "from-amber-400 to-orange-400",
    bg: "bg-amber-400/10",
  },
];

// Variant 1: Bento Lite (Responsive Masonry)
export function Finalist1() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        {/* Large Card */}
        <div className="sm:col-span-3 h-64 sm:h-auto rounded-[32px] bg-[#16181d] border border-white/5 p-8 flex flex-col justify-between group hover:border-[#f95700]/30 transition-all duration-500">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            {BENEFITS[0].icon}
          </div>
          <div>
            <h3 className="text-white font-black uppercase text-2xl italic tracking-tighter mb-2">
              {BENEFITS[0].title}
            </h3>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-tight">
              {BENEFITS[0].desc}
            </p>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.slice(1).map((b, i) => (
            <div
              key={i}
              className="rounded-[32px] bg-[#16181d] border border-white/5 p-6 hover:bg-white/5 transition-colors group"
            >
              <div className="text-zinc-500 group-hover:text-white transition-colors mb-4">
                {b.icon}
              </div>
              <h4 className="text-white font-black uppercase text-sm italic mb-1">{b.title}</h4>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-tight leading-tight">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Variant 2: Swipe Cards (Mobile Scroll Snap)
export function Finalist2() {
  return (
    <div className="max-w-7xl mx-auto py-12">
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 px-6 md:grid md:grid-cols-5 md:overflow-visible">
        {BENEFITS.map((b, i) => (
          <div
            key={i}
            className="min-w-[280px] snap-center aspect-[4/5] rounded-[40px] bg-gradient-to-b from-[#1a1c23] to-[#0c0d10] border border-white/5 p-8 flex flex-col justify-between group hover:border-white/20 transition-all"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${b.bg} flex items-center justify-center text-white mb-6 group-hover:animate-wiggle`}
            >
              {b.icon}
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-white/30 tracking-[0.3em]">
                0{i + 1}
              </span>
              <h3 className="text-white font-black uppercase text-xl italic tracking-tighter leading-tight">
                {b.title}
              </h3>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-tight leading-relaxed">
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 px-6 md:hidden">
        <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Листай влево <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

// Variant 3: Interactive List (Mobile Accordion)
export function Finalist3() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-3">
      {BENEFITS.map((b, i) => {
        const isOpen = openIdx === i;
        return (
          <button
            key={i}
            onClick={() => setOpenIdx(i)}
            className={`w-full rounded-[24px] overflow-hidden transition-all duration-500 border ${isOpen ? "bg-white border-white" : "bg-[#16181d] border-white/5"}`}
          >
            <div className="px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span
                  className={`text-sm font-black italic ${isOpen ? "text-black/20" : "text-white/20"}`}
                >
                  0{i + 1}
                </span>
                <h3
                  className={`font-black uppercase text-lg tracking-tighter ${isOpen ? "text-black" : "text-white"}`}
                >
                  {b.title}
                </h3>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-500 ${isOpen ? "bg-black text-white rotate-90" : "bg-white/5 text-zinc-500 rotate-0"}`}
              >
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-500 ${isOpen ? "max-h-32" : "max-h-0"}`}
            >
              <div className="px-8 pb-8 flex items-center gap-4">
                <div className={`w-1 bg-[#f95700] h-10 rounded-full`} />
                <p className="text-black font-bold uppercase text-[11px] tracking-tight leading-relaxed text-left">
                  {b.desc}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Variant 4: Modern Density (2-Column Grid)
export function Finalist4() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        {BENEFITS.map((b, i) => (
          <div
            key={i}
            className={`p-6 rounded-[32px] bg-[#111111] border border-white/5 flex flex-col items-center text-center group hover:scale-[1.02] transition-all hover:bg-[#16181d] ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div className="p-4 rounded-3xl bg-white/5 text-zinc-400 group-hover:text-[#f95700] group-hover:bg-[#f95700]/10 transition-all mb-6">
              {b.icon}
            </div>
            <h3 className="text-white font-black uppercase text-[11px] tracking-widest mb-2 italic">
              {b.title}
            </h3>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-tight leading-tight">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Variant 5: Premium Cards (Progressive Reveal)
export function Finalist5() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-12">
          {BENEFITS.slice(0, 3).map((b, i) => (
            <div key={i} className="relative group pl-12">
              <div className="absolute left-0 top-0 w-px h-full bg-white/5 group-hover:bg-[#f95700]/50 transition-colors" />
              <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-[#f95700] transition-colors" />

              <div className="text-zinc-600 group-hover:text-white transition-colors mb-4">
                {b.icon}
              </div>
              <h3 className="text-white font-black uppercase text-2xl tracking-tighter italic mb-3">
                {b.title}
              </h3>
              <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-12 md:mt-24">
          {BENEFITS.slice(3).map((b, i) => (
            <div key={i} className="relative group pl-12">
              <div className="absolute left-0 top-0 w-px h-full bg-white/5 group-hover:bg-blue-500/50 transition-colors" />
              <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors" />

              <div className="text-zinc-600 group-hover:text-white transition-colors mb-4">
                {b.icon}
              </div>
              <h3 className="text-white font-black uppercase text-2xl tracking-tighter italic mb-3">
                {b.title}
              </h3>
              <p className="text-zinc-500 font-bold uppercase text-xs tracking-widest leading-relaxed">
                {b.desc}
              </p>
            </div>
          ))}

          <div className="p-8 rounded-[40px] bg-gradient-to-br from-[#f95700] to-orange-700 mt-12 group hover:scale-105 transition-transform cursor-pointer">
            <Sparkles className="w-8 h-8 text-black mb-4" />
            <h4 className="text-black font-black uppercase text-xl leading-none italic mb-1">
              Получить личный план
            </h4>
            <p className="text-black/60 text-[10px] font-black uppercase tracking-widest">
              Бесплатная диагностика
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
