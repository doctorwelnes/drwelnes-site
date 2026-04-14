"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BenefitSummaryCard } from "@/components/BenefitSummaryCard";

export default function TestBenefitsPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] font-sans selection:bg-[#f95700]/30 selection:text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#16181d]/80 backdrop-blur-xl border-b border-white/5 p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-xs font-black uppercase tracking-widest">Назад на главную</span>
          </Link>
          <div className="text-center">
            <h1 className="text-white font-black uppercase text-sm tracking-[0.2em] italic">
              Design Lab: Final Result
            </h1>
            <p className="text-[#f95700] text-[10px] font-black uppercase tracking-widest mt-1">
              Static Premium Benefit Card
            </p>
          </div>
          <div className="w-24" />
        </div>
      </div>

      {/* Showcase */}
      <div className="py-40 flex flex-col items-center justify-center gap-20">
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#f95700]/10 border border-[#f95700]/20">
            <span className="text-[#f95700] text-[9px] font-black uppercase tracking-widest">
              Status: Ready for Production
            </span>
          </div>
          <h2 className="text-white text-4xl font-black uppercase italic tracking-tighter">
            The Benefit Card
          </h2>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
            Premium glassmorphism, side-by-side layout logic, and optimized typography for Dr.Welnes
          </p>
        </div>

        <div className="relative">
          {/* Animated background glow for showcase */}
          <div className="absolute -inset-20 bg-[#f95700]/5 blur-[100px] rounded-full animate-pulse" />
          <BenefitSummaryCard onBookingClick={() => {}} />
        </div>

        <div className="max-w-md w-full px-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <h3 className="text-white font-black uppercase text-[10px] tracking-widest border-b border-white/10 pb-3">
              Технические детали
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-[#f95700]" />
                <span className="text-zinc-400 text-[10px] font-bold uppercase">
                  Glassmorphism / Backdrop Blur 2xl
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-[#f95700]" />
                <span className="text-zinc-400 text-[10px] font-bold uppercase">
                  Animated Float & Zoom-in Entry
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1 h-1 rounded-full bg-[#f95700]" />
                <span className="text-zinc-400 text-[10px] font-bold uppercase">
                  Side-by-side Flex Layout on Desktop
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
