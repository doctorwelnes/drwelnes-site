"use client";

import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import AdminWorkoutsDashboard from "../components/AdminWorkoutsDashboard";
import ActiveWorkoutsWidget from "../components/ActiveWorkoutsWidget";
import AdminUsersWidget from "../components/AdminUsersWidget";
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
        <div className="max-w-7xl mx-auto space-y-6">
          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f95700]/10 border border-[#f95700]/20 text-[#f95700]">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Обзор
                </p>
                <h2 className="text-lg font-black text-white">Вид на неделю</h2>
              </div>
            </div>
            <AdminWorkoutsDashboard />
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Живой контроль
                </p>
                <h2 className="text-lg font-black text-white">Активные тренировки</h2>
              </div>
            </div>
            <ActiveWorkoutsWidget />
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Система
                </p>
                <h2 className="text-lg font-black text-white">Все пользователи</h2>
              </div>
            </div>
            <AdminUsersWidget />
          </section>

          <section className="rounded-3xl border border-white/5 bg-[#0d0d0d] p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  Управление
                </p>
                <h2 className="text-lg font-black text-white">Пакеты и слоты</h2>
              </div>
            </div>
            <WorkoutSlotManager />
          </section>
        </div>
      </main>
    </div>
  );
}
