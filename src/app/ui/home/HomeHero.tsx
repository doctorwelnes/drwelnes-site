"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Heart } from "lucide-react";

interface HomeHeroProps {
  onBookingClick: () => void;
}

export const HomeHero = ({ onBookingClick }: HomeHeroProps) => {
  const [bpm, setBpm] = useState(65);
  const [userCount, setUserCount] = useState(2);

  useEffect(() => {
    // BPM Live simulation
    const bpmInterval = setInterval(() => {
      setBpm((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return newVal > 70 ? 70 : newVal < 60 ? 60 : newVal;
      });
    }, 2000);

    return () => {
      clearInterval(bpmInterval);
    };
  }, []);

  useEffect(() => {
    const updateUserCount = () => {
      setUserCount(1 + Math.floor(Math.random() * 3));
    };

    updateUserCount();

    const userCountInterval = setInterval(updateUserCount, 5000);

    return () => {
      clearInterval(userCountInterval);
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Top Section: Avatars */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-700 mb-5 md:mb-12 lg:mb-10">
        <div className="flex -space-x-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative aspect-square w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#0d0d0d] bg-zinc-800 overflow-hidden shadow-xl"
            >
              <Image
                src={`/uploads/avatars/avatar-${i}.jpg`}
                alt="User avatar"
                fill
                className="object-cover object-center"
                style={{ objectFit: "cover", objectPosition: "center 30%" }}
                sizes="40px"
              />
            </div>
          ))}
          <div className="rounded-full border-2 border-[#0d0d0d] bg-[#f95700] flex items-center justify-center font-black text-black z-10 shadow-glow transition-all duration-300 w-8 h-8 md:w-10 md:h-10 text-[9px] md:text-[11px]">
            +{userCount}
          </div>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500/80">
          Пользователи онлайн
        </span>
      </div>

      <div className="flex flex-col lg:max-w-2xl">
        <h1 className="font-black italic tracking-tighter uppercase leading-[1.15] flex flex-col animate-in fade-in zoom-in-95 duration-1000">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
            <span className="text-white drop-shadow-2xl whitespace-nowrap text-[22px] md:text-[32px] sm:text-[45px] lg:text-[60px]">
              Здоровье
            </span>
            <span className="text-[#f95700] whitespace-nowrap opacity-90 brightness-110 drop-shadow-[0_0_15px_rgba(249,87,0,0.3)] text-[22px] md:text-[32px] sm:text-[45px] lg:text-[60px]">
              и красота
            </span>
          </div>
          <span className="text-white drop-shadow-2xl text-[22px] md:text-[32px] sm:text-[45px] lg:text-[60px]">
            Начинается с нас
          </span>
        </h1>

        <p className="text-zinc-500 font-medium max-w-[45ch] leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 delay-300 mt-3 md:mt-6 lg:mt-8 text-[9px] md:text-xs lg:text-sm">
          Персональный подход к вашему здоровью <br className="hidden md:block" /> в одном месте —{" "}
          Dr.Welnes
        </p>

        <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-3 md:mt-6 lg:mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link href="/about" className="group flex items-center gap-4 outline-none">
            <span className="font-black uppercase tracking-[0.2em] text-white group-hover:text-[#f95700] transition-colors text-[11px] md:text-[9px]">
              Подробнее о проекте
            </span>
            <div className="relative w-9 h-9 lg:w-11 lg:h-11 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:border-[#f95700]/50 shadow-lg">
              <div className="absolute inset-0 rounded-full border-2 border-[#f95700] border-t-transparent border-r-transparent -rotate-45 group-hover:rotate-0 transition-all duration-700" />
              <div className="w-5 h-5 lg:w-7 lg:h-7 bg-transparent rounded-full flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5 transition-transform group-hover:scale-110" />
              </div>
            </div>
          </Link>

          <div className="relative group/btn">
            <button
              onClick={onBookingClick}
              className="relative z-10 rounded-full bg-white text-black font-black uppercase tracking-widest transition-all hover:bg-[#f95700] hover:text-white hover:scale-105 active:scale-95 overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(249,87,0,0.4)] px-6 lg:px-8 py-3 lg:py-3.5 text-[11px] md:text-[9px]"
            >
              <span className="relative z-10">Записаться на занятие</span>
              <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-shimmer bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-12" />
            </button>
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20 pointer-events-none" />
          </div>

          <Link
            href="/calculators/hr-zones"
            className="flex items-center gap-3 rounded-full bg-[#16181d] backdrop-blur-xl border border-white/5 shadow-2xl transition-all hover:bg-[#1f2229] hover:border-[#f95700]/30 hover:scale-105 active:scale-95 group/bpm px-4 lg:px-5 py-2 lg:py-2.5"
          >
            <Heart className="w-4 h-4 md:w-3 md:h-3 text-[#f95700] animate-heartbeat fill-[#f95700]/10 group-hover/bpm:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-white font-black leading-none tabular-nums text-[14px] md:text-xs lg:text-sm">
                {bpm}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
