"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Utensils, Dumbbell, Calculator, Calendar, ArrowUpRight } from "lucide-react";

interface HomeNavigationCardsProps {
  onBookingClick: () => void;
}

export const HomeNavigationCards = ({ onBookingClick }: HomeNavigationCardsProps) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const navCards = [
    {
      title: "Консультация",
      desc: "Запись на занятие",
      icon: (
        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-black drop-shadow-md" strokeWidth={2.5} />
      ),
      onClick: onBookingClick,
      color: "bg-[#f95700]",
      textColor: "text-black",
      rotate: "-rotate-9",
      translateY: "translate-y-12",
      border: "border-orange-500/20",
      defaultZ: 40,
    },
    {
      title: "Рецепты",
      desc: "Здоровое питание",
      icon: <Utensils className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/recipes",
      color: "bg-zinc-900",
      textColor: "text-white",
      rotate: "-rotate-3",
      translateY: "translate-y-12",
      defaultZ: 30,
    },
    {
      title: "Упражнения",
      desc: "Программы тренировок",
      icon: <Dumbbell className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/exercises",
      color: "bg-[#3a3b3e]",
      textColor: "text-white",
      rotate: "rotate-3",
      translateY: "translate-y-4",
      border: "border-white/10",
      defaultZ: 20,
    },
    {
      title: "Калькуляторы",
      desc: "Расчет показателей",
      icon: <Calculator className="w-5 h-5 md:w-6 md:h-6" />,
      href: "/calculators",
      color: "bg-white",
      textColor: "text-black",
      rotate: "rotate-9",
      translateY: "translate-y-4",
      defaultZ: 10,
    },
  ];

  return (
    <div className="relative w-full flex justify-center items-end overflow-visible z-20 mt-auto pt-8">
      {/* Mobile View */}
      <div className="md:hidden w-full flex flex-col gap-3 px-0 pb-20">
        {navCards.map((card, idx) => {
          const content = (
            <div
              className={`w-full ${card.color} ${card.textColor} p-4 rounded-[28px] ${card.border || "border border-white/5"} flex items-center gap-4 transition-all active:scale-[0.98] shadow-lg`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color === "bg-white" ? "bg-zinc-100" : card.color === "bg-[#16181d]" ? "bg-white/10" : "bg-white/20"}`}
              >
                {card.icon}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="text-sm font-black italic uppercase tracking-tighter leading-tight mb-1">
                  {card.title}
                </h3>
                <p className="text-[11px] font-medium normal-case tracking-normal opacity-60 whitespace-normal leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${card.textColor === "text-white" ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}
              >
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          );
          if (card.href)
            return (
              <Link key={idx} href={card.href} className="block w-full">
                {content}
              </Link>
            );
          return (
            <button key={idx} onClick={card.onClick} className="block w-full text-left">
              {content}
            </button>
          );
        })}
      </div>

      {/* Desktop View */}
      <div
        className="hidden md:flex items-end justify-start group/fan -space-x-20 md:-space-x-28 lg:-space-x-32 w-full max-w-3xl px-6"
        style={{
          position: "fixed",
          bottom: 0,
          right: "100px",
          zIndex: 20,
        }}
      >
        {navCards.map((card, idx) => {
          const isThisHovered = hoveredIdx === idx;
          const content = (
            <div
              className={`
                ${card.color} ${card.textColor} ${card.rotate}
                ${card.border || ""}
                w-full max-w-[190px] md:max-w-[210px] lg:max-w-[230px] aspect-[4/5] p-6 md:p-6 rounded-[36px]
                shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                pointer-events-auto flex flex-col relative overflow-hidden
                animate-in fade-in slide-in-from-bottom-10
                ${isThisHovered ? "translate-y-0 scale-110 shadow-[0_40px_80px_rgba(0,0,0,0.8)] brightness-100" : "translate-y-[40%] grayscale-[0.1] opacity-90 hover:opacity-100 hover:grayscale-0"}
              `}
              style={{
                transitionDelay: `${idx * 50}ms`,
                zIndex: card.defaultZ,
              }}
            >
              {/* Internal Card Decor */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />

              <div
                className={`
                w-8 h-8 md:w-10 md:h-10 rounded-[14px] flex items-center justify-center mb-auto relative z-10
                ${card.color === "bg-white" ? "bg-zinc-100" : card.color === "bg-[#16181d]" ? "bg-white/10" : "bg-white/20"}
                ${isThisHovered ? "scale-110" : "scale-100"} transition-all duration-500
              `}
              >
                <div
                  className={`${isThisHovered ? "scale-125 rotate-6" : "scale-100 rotate-0"} transition-all duration-500 ease-out`}
                >
                  {card.icon}
                </div>
              </div>

              <div className="space-y-0.5 md:space-y-1 mb-2 md:mb-3 relative z-10">
                <div className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] opacity-40">
                  Dr.Welnes
                </div>
                <div className="text-sm md:text-sm lg:text-base font-black italic tracking-tighter leading-none uppercase">
                  {card.title}
                </div>
                <div className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.12em] opacity-40">
                  {card.desc}
                </div>
              </div>

              <div className="flex justify-end mt-auto relative z-10">
                <div
                  className={`
                  w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border
                  ${card.textColor === "text-white" ? "border-white/10" : "border-black/10"}
                  transition-all ${isThisHovered ? "bg-white/10" : ""}
                `}
                >
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          );

          if (card.href) {
            return (
              <Link
                key={idx}
                href={card.href}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="contents"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={card.onClick}
              className="contents"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};
