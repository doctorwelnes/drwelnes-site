"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import UserWorkoutBookings from "@/components/UserWorkoutBookings";

export default function UpcomingWorkoutsPage() {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id || "";

  return (
    <main className="min-h-screen bg-[#0c0d10] text-zinc-300 px-3 py-4 sm:px-4 md:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#121319] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                Профиль
              </p>
              <h1 className="text-lg font-black text-white">Предстоящие тренировки</h1>
            </div>
          </div>
          <Link
            href="/dashboard/workouts/past"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#f95700]/20 bg-[#f95700]/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-[#f95700] transition-colors hover:bg-[#f95700]/20"
          >
            <Clock className="w-4 h-4" />
            Прошедшие
          </Link>
        </div>

        {status === "loading" ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500" />
            <p className="mt-3 text-zinc-500">Загрузка...</p>
          </div>
        ) : currentUserId ? (
          <UserWorkoutBookings userId={currentUserId} section="upcoming" />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <CalendarDays className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
            <p className="text-white font-semibold">Войдите в аккаунт, чтобы увидеть тренировки</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center rounded-xl bg-[#f95700] px-4 py-2 text-sm font-black uppercase tracking-widest text-black"
            >
              Войти
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
