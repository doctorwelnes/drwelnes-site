"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, MapPin, RefreshCw, Users } from "lucide-react";

type ActiveWorkoutBooking = {
  id: string;
  status: string;
  paymentStatus: string;
  notes?: string | null;
  createdAt: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    workoutType?: string | null;
    location?: string | null;
    price?: number | null;
    currentParticipants: number;
    maxParticipants: number;
  };
  user?: {
    id: string;
    name?: string | null;
    phone?: string | null;
    telegram?: string | null;
  };
};

const getSlotDateTime = (date: string, startTime: string) => {
  const value = new Date(date);
  const [hours, minutes] = startTime.split(":").map(Number);
  value.setHours(hours, minutes, 0, 0);
  return value;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export default function ActiveWorkoutsWidget() {
  const [bookings, setBookings] = useState<ActiveWorkoutBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchActiveWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/active-workouts", { cache: "no-store" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch active workouts");
      }

      setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error ? fetchError.message : "Failed to fetch active workouts",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveWorkouts();
  }, [fetchActiveWorkouts]);

  const activeBookings = useMemo(() => {
    const now = new Date();

    return [...bookings]
      .filter((booking) => {
        const end = getSlotDateTime(booking.slot.date, booking.slot.endTime);
        return booking.status !== "CANCELLED" && end >= now;
      })
      .sort((a, b) => {
        const aStart = getSlotDateTime(a.slot.date, a.slot.startTime).getTime();
        const bStart = getSlotDateTime(b.slot.date, b.slot.startTime).getTime();
        return aStart - bStart;
      });
  }, [bookings]);

  const uniqueUsers = useMemo(
    () => new Set(activeBookings.map((booking) => booking.user?.id)).size,
    [activeBookings],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111217] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Активные тренировки
          </p>
          <h3 className="text-lg font-black text-white">Список по дате и времени</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Записей: {activeBookings.length} · Уникальных клиентов: {uniqueUsers}
          </p>
        </div>

        <button
          onClick={fetchActiveWorkouts}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-500">
          Загрузка активных тренировок...
        </div>
      ) : activeBookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-500">
          Активных тренировок нет
        </div>
      ) : (
        <div className="space-y-3">
          {activeBookings.map((booking) => (
            <article
              key={booking.id}
              className="rounded-2xl border border-white/10 bg-[#111217] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)]"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#f95700]/20 bg-[#f95700]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#f95700]">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(booking.slot.date)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                      {booking.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                      {booking.paymentStatus}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2 text-sm text-white font-semibold">
                      <Clock className="h-4 w-4 text-orange-500" />
                      {booking.slot.startTime} — {booking.slot.endTime}
                    </div>
                    {booking.slot.workoutType && (
                      <div className="text-sm text-zinc-400">{booking.slot.workoutType}</div>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-sm text-zinc-400">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <span className="wrap-break-word">
                      {booking.slot.location || "Без локации"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 min-w-0 lg:min-w-72">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-white">
                      {booking.user?.name || "Аноним"}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-zinc-500">
                    {booking.user?.phone && <div>Телефон: {booking.user.phone}</div>}
                    {booking.user?.telegram && <div>Telegram: {booking.user.telegram}</div>}
                    {!booking.user?.phone && !booking.user?.telegram && (
                      <div>Контакты не указаны</div>
                    )}
                  </div>
                  <div className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                    {booking.slot.currentParticipants}/{booking.slot.maxParticipants} участников
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
