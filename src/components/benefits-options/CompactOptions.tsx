"use client";

import { useState } from "react";
import {
  Zap,
  Heart,
  Utensils,
  Activity,
  Trophy,
  ShieldCheck,
  Clock,
  Star,
  Target,
} from "lucide-react";

// Option E: Horizontal Icon Ribbon
export function OptionE() {
  const items = [
    { icon: <Utensils className="w-5 h-5" />, label: "Рацион" },
    { icon: <Activity className="w-5 h-5" />, label: "Тренинг" },
    { icon: <Heart className="w-5 h-5" />, label: "Анализы" },
    { icon: <Star className="w-5 h-5" />, label: "Поддержка" },
    { icon: <Target className="w-5 h-5" />, label: "Результат" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-3 group">
            <div className="text-zinc-500 group-hover:text-[#f95700] transition-colors">
              {item.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Option F: Floating Benefit Pills
export function OptionF() {
  const benefits = [
    "Персональное меню",
    "Техника упражнений",
    "24/7 Поддержка",
    "Аналитика тела",
    "База знаний",
    "Закрытый клуб",
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex flex-wrap justify-center gap-3">
        {benefits.map((b, i) => (
          <div
            key={i}
            className="px-5 py-2.5 rounded-full bg-[#16181d] border border-white/5 text-[11px] font-bold text-zinc-400 hover:border-[#f95700]/30 hover:text-white transition-all cursor-default"
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}

// Option G: 2x3 Mini Grid
export function OptionG() {
  const items = [
    { icon: <Clock className="w-5 h-5" />, title: "Экономия времени", desc: "Все готово за тебя" },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Безопасность",
      desc: "Без вреда здоровью",
    },
    { icon: <Zap className="w-5 h-5" />, title: "Быстрый старт", desc: "План в день оплаты" },
    { icon: <Trophy className="w-5 h-5" />, title: "Результат", desc: "Гарантия прогресса" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-5 rounded-3xl bg-[#16181d] border border-white/5 hover:bg-white/5 transition-colors group"
        >
          <div className="text-[#f95700] mb-3 group-hover:scale-110 transition-transform">
            {item.icon}
          </div>
          <h4 className="text-xs font-black uppercase text-white mb-1 tracking-tight">
            {item.title}
          </h4>
          <p className="text-[10px] text-zinc-600 font-medium">{item.desc}</p>
        </div>
      ))}
    </div>
  );
}

// Option H: Text-ONLY Minimalist List
export function OptionH() {
  const lines = [
    "Индивидуальный КБЖУ под твои цели",
    "Видео-разбор каждого упражнения",
    "Еженедельная корректировка стратегии",
    "Чат с экспертом без выходных",
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-4">
      {lines.map((line, i) => (
        <div key={i} className="flex items-baseline gap-4 group">
          <span className="text-[#f95700] font-black italic text-lg opacity-30 group-hover:opacity-100 transition-opacity">
            0{i + 1}
          </span>
          <p className="text-sm font-bold text-zinc-500 group-hover:text-white transition-colors tracking-tight uppercase">
            {line}
          </p>
        </div>
      ))}
    </div>
  );
}

// Option I: Progress Focus Bars
export function OptionI() {
  const focuses = [
    { label: "Питание", value: "95%", desc: "Точность попадания в КБЖУ" },
    { label: "Техника", value: "100%", desc: "Безопасность выполнения" },
    { label: "Поддержка", value: "24/7", desc: "Скорость ответа" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      {focuses.map((f, i) => (
        <div key={i} className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#f95700]">
              {f.label}
            </span>
            <span className="text-xl font-black italic text-white leading-none">{f.value}</span>
          </div>
          <div className="h-[2px] w-full bg-white/5 overflow-hidden">
            <div className="h-full bg-[#f95700] w-full animate-in slide-in-from-left duration-1000" />
          </div>
          <p className="text-[10px] text-zinc-600 font-bold uppercase">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

// Option J: Interactive Benefit Hub (Magnetic Focus)
export function OptionJ() {
  const [activeIndex, setActiveIndex] = useState(0);

  const benefits = [
    {
      title: "Жиросжигание",
      full: "Снижение жировой массы тела",
      icon: <Activity className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Набор массы",
      full: "Наращивание мышечной массы",
      icon: <Trophy className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Рацион",
      full: "Выстраивание правильного рациона",
      icon: <Utensils className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Реабилитация",
      full: "Реабилитация после травм/операций",
      icon: <Heart className="w-5 h-5" />,
      color: "from-rose-500 to-pink-500",
    },
    {
      title: "Здоровье",
      full: "Контроль/лечение хронических заболеваний",
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "from-amber-400 to-orange-400",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">
      {/* Left Side: Icons Hub */}
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Decorative Ring */}
        <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow opacity-20" />
        <div className="absolute inset-10 rounded-full border border-white/10 opacity-40" />

        {/* Icons Arc */}
        {benefits.map((b, i) => {
          const angle = (i * 360) / benefits.length;
          const isActive = activeIndex === i;

          return (
            <button
              key={i}
              onMouseEnter={() => setActiveIndex(i)}
              className={`
                absolute w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-500
                ${isActive ? "bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-[#16181d] text-zinc-500 hover:text-white border border-white/5"}
              `}
              style={{
                transform: `rotate(${angle}deg) translate(${isActive ? "110%" : "100%"}) rotate(-${angle}deg)`,
              }}
            >
              <div className={isActive ? "animate-wiggle" : ""}>{b.icon}</div>
            </button>
          );
        })}

        {/* Center Display */}
        <div className="relative w-24 h-24 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
          <div
            className={`absolute inset-0 opacity-20 bg-gradient-to-br ${benefits[activeIndex].color} transition-all duration-700`}
          />
          <span
            className="text-white font-black italic text-xl sm:text-2xl z-10 animate-in fade-in zoom-in duration-500"
            key={activeIndex}
          >
            0{activeIndex + 1}
          </span>
        </div>
      </div>

      {/* Right Side: Content */}
      <div className="flex-1 space-y-6 max-w-sm text-center md:text-left">
        <div className="space-y-2">
          <div
            className={`h-1 w-12 bg-gradient-to-r ${benefits[activeIndex].color} transition-all duration-700 mb-4 inline-block`}
          />
          <h3
            className="text-white font-black uppercase text-xl sm:text-2xl tracking-tighter leading-none animate-in slide-in-from-right-4 duration-500"
            key={`title-${activeIndex}`}
          >
            {benefits[activeIndex].title}
          </h3>
          <p
            className="text-zinc-500 text-[11px] font-bold uppercase tracking-tight leading-relaxed animate-in slide-in-from-right-8 duration-700"
            key={`desc-${activeIndex}`}
          >
            {benefits[activeIndex].full}
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center md:justify-start gap-4">
          {benefits.map((_, i) => (
            <div
              key={i}
              className={`h-1 transition-all duration-500 ${activeIndex === i ? "w-8 bg-white" : "w-2 bg-white/10"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
