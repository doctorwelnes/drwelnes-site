"use client";

import { useState } from "react";
import {
  Heart,
  Utensils,
  Activity,
  Trophy,
  ShieldCheck,
  Plus,
  X,
  MousePointer2,
} from "lucide-react";

const BENEFITS = [
  {
    title: "Жиросжигание",
    desc: "Снижение жировой массы тела",
    icon: <Activity className="w-5 h-5" />,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Набор массы",
    desc: "Наращивание мышечной массы",
    icon: <Trophy className="w-5 h-5" />,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Рацион",
    desc: "Выстраивание правильного рациона",
    icon: <Utensils className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Реабилитация",
    desc: "Реабилитация после травм/операций",
    icon: <Heart className="w-5 h-5" />,
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "Здоровье",
    desc: "Контроль/лечение хронических заболеваний",
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "from-amber-400 to-orange-400",
  },
];

// Variant 1: Radial Orbit Hub (Single Point Expansion)
export function Concentrated1() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-[450px] flex items-center justify-center relative">
      <div className="relative flex items-center">
        {/* Label (Visible when closed) */}
        <div
          className={`absolute right-full mr-6 whitespace-nowrap transition-all duration-700 ${isOpen ? "opacity-0 -translate-x-10 pointer-events-none" : "opacity-100 translate-x-0"}`}
        >
          <span className="text-white font-black uppercase text-[10px] tracking-[0.3em] bg-white/5 px-4 py-2 rounded-full border border-white/10">
            Что Вы получите?
          </span>
        </div>

        {/* The Sprouting Items (Expanding to the Right) */}
        <div className="relative">
          {BENEFITS.map((b, i) => {
            // Curved offsets (forming a > shape)
            const offsetsX = [40, 100, 140, 100, 40];
            const offsetsY = [-120, -60, 0, 60, 120];

            const targetX = isOpen ? offsetsX[i] : 0;
            const targetY = isOpen ? offsetsY[i] : 0;

            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group"
                style={{
                  transform: `translate(${targetX}px, ${targetY}px)`,
                  opacity: isOpen ? 1 : 0,
                  scale: isOpen ? 1 : 0,
                  pointerEvents: isOpen ? "auto" : "none",
                  transitionDelay: isOpen ? `${i * 60}ms` : `${(BENEFITS.length - i) * 30}ms`,
                  zIndex: 20,
                }}
              >
                <div className="flex items-center gap-4 bg-[#1a1c23] border border-white/5 pl-4 pr-6 py-3 rounded-2xl shadow-2xl hover:border-[#f95700]/30 transition-all cursor-pointer">
                  <div className="text-[#f95700]">{b.icon}</div>
                  <div className="flex flex-col">
                    <span className="text-white font-black uppercase text-[10px] italic tracking-tighter leading-none">
                      {b.title}
                    </span>
                    <span className="text-zinc-600 text-[8px] font-bold uppercase mt-1">
                      {b.desc}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Central Hub Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              relative z-30 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl overflow-visible
              ${isOpen ? "bg-white text-black rotate-45" : "bg-[#f95700] text-black hover:scale-110 active:scale-95"}
            `}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}

            {/* Pulsating Ring (Only when closed) */}
            {!isOpen && (
              <>
                <div className="absolute inset-0 rounded-full bg-[#f95700] animate-ping opacity-25" />
                <div className="absolute inset-[-8px] rounded-full border border-[#f95700]/30 animate-pulse duration-[2000ms]" />
              </>
            )}

            {/* Spinning decorative ring when open */}
            <div
              className={`absolute inset-[-4px] rounded-full border border-dashed border-white/20 animate-spin-slow transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

// Variant 2: Stacked Fan Expand (Card Deck)
export function Concentrated2() {
  const [isFanned, setIsFanned] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="h-[400px] flex items-center justify-center">
      <div className="relative w-48 h-64">
        {BENEFITS.map((b, i) => {
          const rotation = isFanned ? (i - 2) * 15 : 0;
          const translateX = isFanned ? (i - 2) * 40 : 0;
          const translateY = isFanned ? Math.abs(i - 2) * 10 : 0;
          const isSelected = activeIdx === i;

          return (
            <div
              key={i}
              onClick={() => {
                if (!isFanned) setIsFanned(true);
                else setActiveIdx(isSelected ? null : i);
              }}
              className={`
                absolute inset-0 rounded-[32px] bg-[#16181d] border border-white/10 p-6 flex flex-col justify-between transition-all duration-700 cursor-pointer shadow-2xl
                ${isSelected ? "-translate-y-32 scale-110 z-50 border-[#f95700]/50 bg-[#1a1c23]" : "hover:border-white/20"}
              `}
              style={{
                transform: `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`,
                zIndex: isSelected ? 100 : i,
                transitionDelay: `${(BENEFITS.length - i) * 30}ms`,
              }}
            >
              <div className="text-[#f95700]">{b.icon}</div>
              <div className="space-y-1">
                <h4 className="text-white font-black uppercase text-[10px] italic tracking-widest">
                  {b.title}
                </h4>
                {isSelected && (
                  <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-tight animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {b.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Control Button (Invisible layer or small indicator) */}
        {!isFanned && (
          <div className="absolute inset-x-0 -bottom-12 flex justify-center animate-bounce">
            <MousePointer2 className="w-5 h-5 text-white/20" />
          </div>
        )}
        {isFanned && !activeIdx && (
          <button
            onClick={() => setIsFanned(false)}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-zinc-500 hover:text-white transition-colors text-[9px] font-black uppercase"
          >
            Свернуть
          </button>
        )}
      </div>
    </div>
  );
}

// Variant 3: Expanding Core Pill (Text Sprout)
export function Concentrated3() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="h-[400px] flex items-center justify-center px-6">
      <div
        className={`relative transition-all duration-700 ease-out bg-[#16181d] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden ${isExpanded ? "w-full max-w-sm py-8" : "w-48 py-4"}`}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-8 flex items-center justify-between group"
        >
          <span
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? "text-white" : "text-[#f95700]"}`}
          >
            {isExpanded ? "Что вы получите" : "Раскрыть список"}
          </span>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-500 ${isExpanded ? "bg-white text-black rotate-180" : "bg-white/5 text-white rotate-0"}`}
          >
            {isExpanded ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </div>
        </button>

        <div
          className={`transition-all duration-700 ${isExpanded ? "max-h-[500px] opacity-100 mt-8" : "max-h-0 opacity-0"}`}
        >
          <div className="px-8 space-y-6">
            {BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-4 group/item">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover/item:text-[#f95700] transition-colors">
                  {b.icon}
                </div>
                <div>
                  <h4 className="text-white font-black text-xs uppercase tracking-tight italic mb-0.5">
                    {b.title}
                  </h4>
                  <p className="text-zinc-600 text-[9px] font-bold uppercase">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Variant 4: Magnetic Sphere Reveal (Point Interaction)
export function Concentrated4() {
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="h-[450px] flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center gap-16 relative w-full">
        {/* The 3D Perspective Stack */}
        <div className="relative w-48 h-48 perspective-[1000px]">
          {BENEFITS.map((b, i) => {
            const isCenter = activeIdx === i;
            const diff = (i - activeIdx + BENEFITS.length) % BENEFITS.length;

            // Re-order mapping so others look "behind"
            // diff 0: Front
            // diff 1, 4: Sidelined behind
            // diff 2, 3: Deep background

            let zIndex = 0;
            let scale = 0.5;
            let opacity = 0.2;
            let translateY = 0;
            let translateX = 0;
            let blur = "blur(4px)";

            if (diff === 0) {
              zIndex = 50;
              scale = 1.25;
              opacity = 1;
              translateY = 0;
              blur = "blur(0px)";
            } else if (diff === 1) {
              zIndex = 30;
              scale = 0.8;
              opacity = 0.5;
              translateX = 80;
              translateY = -20;
            } else if (diff === 4) {
              zIndex = 30;
              scale = 0.8;
              opacity = 0.5;
              translateX = -80;
              translateY = -20;
            } else {
              zIndex = 10;
              scale = 0.6;
              opacity = 0.3;
              translateY = -50;
              translateX = diff === 2 ? 40 : -40;
            }

            return (
              <div
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`
                  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                  w-20 h-20 rounded-[32px] bg-[#1a1c23] border border-white/5 shadow-2xl
                  flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                  cursor-pointer group
                `}
                style={{
                  zIndex,
                  transform: `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`,
                  opacity,
                  filter: blur,
                }}
              >
                <div
                  className={`transition-all duration-500 ${isCenter ? "text-[#f95700] scale-110" : "text-zinc-600 group-hover:text-zinc-400"}`}
                >
                  {b.icon}
                </div>

                {/* Visual Glow for Center */}
                {isCenter && (
                  <div className="absolute inset-[-10px] rounded-[40px] bg-[#f95700]/10 blur-xl animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* The Selector (Point Array) */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 p-2 bg-[#16181d] rounded-full border border-white/5 shadow-xl">
            {BENEFITS.map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => setActiveIdx(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${activeIdx === i ? "bg-white scale-125 shadow-[0_0_10px_white]" : "bg-white/10 hover:bg-white/30"}`}
              />
            ))}
          </div>

          {/* The Content (Fade Reveal) */}
          <div className="text-center h-16 pointer-events-none" key={activeIdx}>
            <h3 className="text-white font-black uppercase text-xl italic tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-2 duration-500 mb-2">
              {BENEFITS[activeIdx].title}
            </h3>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
              {BENEFITS[activeIdx].desc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Variant 5: Staggered Vertical Sprout (Minimalist Focus)
export function Concentrated5() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="h-[400px] flex items-center justify-center">
      <div className="relative flex flex-col items-center gap-1">
        {/* Items Sprouting from Bottom Up */}
        {BENEFITS.map((b, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`
                group flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500
                ${isHovered ? "bg-white w-[320px] shadow-2xl" : "bg-white/0 w-[280px] hover:bg-white/5"}
              `}
            >
              <div
                className={`text-sm font-black italic transition-colors ${isHovered ? "text-[#f95700]" : "text-zinc-700"}`}
              >
                0{i + 1}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-black uppercase text-[11px] tracking-widest transition-colors ${isHovered ? "text-black" : "text-zinc-500 group-hover:text-zinc-300"}`}
                >
                  {b.title}
                </h4>
                {isHovered && (
                  <p className="text-[10px] font-bold uppercase text-zinc-500 animate-in fade-in slide-in-from-left-2 duration-300">
                    {b.desc}
                  </p>
                )}
              </div>
              <div
                className={`transition-all duration-500 ${isHovered ? "scale-110 text-[#f95700]" : "scale-75 text-zinc-800"}`}
              >
                {b.icon}
              </div>
            </div>
          );
        })}

        {/* Pulse Point indicator */}
        <div className="mt-4 w-1 animate-pulse h-12 bg-gradient-to-b from-zinc-800 to-transparent rounded-full" />
      </div>
    </div>
  );
}
