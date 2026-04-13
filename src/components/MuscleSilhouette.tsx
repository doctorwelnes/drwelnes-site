"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Muscle path categories for Front and Back views
const FRONT_MUSCLES = [
  "Грудь",
  "Пресс",
  "Квадрицепс",
  "Бицепс",
  "Плечи",
  "Передние дельты",
  "Косые",
];
const BACK_MUSCLES = [
  "Спина",
  "Трицепс",
  "Ягодицы",
  "Икры",
  "Поясница",
  "Трапеция",
  "Задние дельты",
];

const MUSCLE_PATHS: Record<string, { view: "front" | "back"; path: string }> = {
  // Front View Coords (Relative to 1000x1000 image)
  Грудь: {
    view: "front",
    path: "M420,320 c-10,0 -30,5 -40,15 c-10,10 -15,40 -5,55 c5,10 25,12 45,5 c15,-5 25,10 30,15 c5,-5 15,-20 30,-15 c20,7 40,5 45,-5 c10,-15 5,-45 -5,-55 c-10,-10 -30,-15 -40,-15 c-10,0 -20,5 -30,10 c-10,-5 -20,-10 -30,-10 z",
  },
  Пресс: {
    view: "front",
    path: "M460,450 h80 v120 c0,10 -10,25 -40,25 s-40,-15 -40,-25 z",
  },
  Плечи: {
    view: "front",
    path: "M280,280 c-10,0 -25,5 -30,20 c-5,15 5,30 15,35 l20,10 M720,280 c10,0 25,5 30,20 c5,15 -5,30 -15,35 l-20,10",
  },
  Бицепс: {
    view: "front",
    path: "M270,380 c-5,10 -8,30 -2,45 m464,-45 c5,10 8,30 2,45",
  },
  Квадрицепс: {
    view: "front",
    path: "M400,680 c-5,20 -5,60 5,90 m190,-90 c5,20 5,60 -5,90",
  },

  // Back View Coords
  Спина: {
    view: "back",
    path: "M500,320 c-30,5 -70,20 -85,60 c-10,30 -5,70 15,100 l70,20 l70,-20 c20,-30 25,-70 15,-100 c-15,-40 -55,-55 -85,-60 z",
  },
  Трицепс: {
    view: "back",
    path: "M270,400 c-2,20 -2,50 5,70 m450,-70 c2,20 2,50 -5,70",
  },
  Ягодицы: {
    view: "back",
    path: "M420,630 c5,5 15,15 40,15 s35,-10 40,-15 c5,-5 15,-15 40,-15 s35,10 40,15 s5,30 -20,40 s-50,10 -60,10 s-40,-5 -60,-10 s-25,-30 -20,-40 z",
  },
  Икры: {
    view: "back",
    path: "M400,850 c-5,5 -8,20 -5,35 m210,-35 c5,5 8,20 5,35",
  },
};

export function MuscleSilhouette({ muscles }: { muscles: string[] }) {
  const [activeView, setActiveView] = useState<"front" | "back">("front");

  return (
    <div className="relative w-full aspect-square bg-[#0c0d10] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl group">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.03] to-transparent pointer-events-none" />

      {/* Main Container for Image + SVG Overlay */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* The 3D Base Image */}

        {/* SVG Highlight Overlay */}
        <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full pointer-events-none">
          {muscles.map((muscle) => {
            const mData = Object.keys(MUSCLE_PATHS).find((k) => muscle.includes(k))
              ? MUSCLE_PATHS[Object.keys(MUSCLE_PATHS).find((k) => muscle.includes(k))!]
              : null;

            if (!mData || mData.view !== activeView) return null;

            return (
              <path
                key={muscle}
                d={mData.path}
                className="fill-orange-500/20 stroke-[#f95700] mix-blend-screen"
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 25px rgba(249, 87, 0, 0.8))",
                  animation: "pulse-glow 3s infinite ease-in-out",
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* View Toggle Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
        <button
          onClick={() => setActiveView("front")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "front" ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
        >
          Спереди
        </button>
        <button
          onClick={() => setActiveView("back")}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === "back" ? "bg-orange-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
        >
          Сзади
        </button>
      </div>

      {/* CSS For Pulse Animation */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.4;
            filter: drop-shadow(0 0 15px rgba(249, 87, 0, 0.4));
          }
          50% {
            opacity: 0.9;
            filter: drop-shadow(0 0 35px rgba(249, 87, 0, 1));
          }
        }
      `}</style>
    </div>
  );
}
