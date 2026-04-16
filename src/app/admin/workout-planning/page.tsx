"use client";

import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import WorkoutSlotManager from "@/components/WorkoutSlotManager";

export default function WorkoutPlanningPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      {/* Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#0d0d0d]">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(251,146,60,0.3)]">
              <Calendar size={18} className="text-black" />
            </div>
            <span className="font-black text-[11px] sm:text-[13px] uppercase tracking-[0.15em] sm:tracking-[0.2em]">
              Планирование{" "}
              <span className="text-neutral-500 font-bold hidden sm:inline">тренировок</span>
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="w-px h-8 bg-white/5 mx-2" />
          <div className="flex flex-col items-end px-2">
            <span className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">
              Администратор
            </span>
            <span className="text-[12px] font-bold">Dr. Welnes</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <WorkoutSlotManager />
        </div>
      </main>
    </div>
  );
}
