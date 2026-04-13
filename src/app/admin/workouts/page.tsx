"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import AdminWorkoutsDashboard from "../components/AdminWorkoutsDashboard";

export default function AdminWorkoutsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <header className="border-b border-white/5 bg-[#0d0d0d] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">Админка</p>
              <h1 className="text-lg font-black text-white">Дашборд тренировок</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#f95700]/20 bg-[#f95700]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#f95700] w-fit">
            <CalendarDays className="h-4 w-4" />
            Day / Week
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <AdminWorkoutsDashboard />
      </div>
    </main>
  );
}
