"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";
import { isWorkoutSlotUnavailable } from "@/lib/workout-availability";

type WorkoutBooking = {
  id: string;
  status: string;
  paymentStatus: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    telegram?: string | null;
  };
};

type WorkoutSlot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  workoutType?: string;
  location?: string;
  price?: number;
  notes?: string;
  isBlockedByOverlap?: boolean;
  bookings?: WorkoutBooking[];
};

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => new Date(`${value}T00:00:00`);

const getStartOfWeek = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
};

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" });

const formatFullLabel = (date: Date) =>
  date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

export default function AdminWorkoutsDashboard() {
  const [slots, setSlots] = useState<WorkoutSlot[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(() => formatLocalDateKey(new Date()));
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [bookedOnly, setBookedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSlots = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workout-slots");
      if (!response.ok) {
        setError("Не удалось загрузить расписание тренировок");
        return;
      }

      const data = await response.json();
      const nextSlots = data.slots || data;
      setSlots(nextSlots);
      setSelectedSlotId((current) => {
        if (current && nextSlots.some((slot: WorkoutSlot) => slot.id === current)) return current;
        return nextSlots[0]?.id ?? null;
      });
    } catch {
      setError("Ошибка при загрузке расписания тренировок");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const selectedDate = parseDateKey(selectedDateKey);
  const weekStart = getStartOfWeek(selectedDate);
  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        return date;
      }),
    [weekStart],
  );

  const selectedDaySlots = useMemo(
    () => slots.filter((slot) => slot.date.split("T")[0] === selectedDateKey),
    [slots, selectedDateKey],
  );

  const visibleSlots =
    viewMode === "day"
      ? selectedDaySlots
      : slots.filter((slot) => {
          const key = slot.date.split("T")[0];
          return weekDays.some((day) => formatLocalDateKey(day) === key);
        });

  const filterBookedSlots = (collection: WorkoutSlot[]) =>
    bookedOnly ? collection.filter((slot) => (slot.bookings?.length || 0) > 0) : collection;

  const filteredVisibleSlots = filterBookedSlots(visibleSlots);

  const selectedSlot = useMemo(() => {
    if (selectedSlotId) {
      return slots.find((slot) => slot.id === selectedSlotId) ?? null;
    }
    return filteredVisibleSlots[0] ?? null;
  }, [selectedSlotId, slots, filteredVisibleSlots]);

  const totalBookings = useMemo(
    () => slots.reduce((sum, slot) => sum + (slot.bookings?.length || 0), 0),
    [slots],
  );
  const totalUpcoming = slots.length;
  const totalFull = slots.filter(
    (slot) => slot.status === "FULL" || slot.currentParticipants >= slot.maxParticipants,
  ).length;

  const shiftDate = (direction: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction);
    setSelectedDateKey(formatLocalDateKey(next));
  };

  const shiftWeek = (direction: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + direction * 7);
    setSelectedDateKey(formatLocalDateKey(next));
  };

  const statusClasses = (slot: WorkoutSlot) => {
    if (isWorkoutSlotUnavailable(slot)) {
      return "border-red-500/20 bg-red-500/10 text-red-400";
    }
    if (slot.status === "AVAILABLE") {
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    }
    return "border-zinc-500/20 bg-zinc-500/10 text-zinc-400";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Всего слотов
          </p>
          <p className="mt-2 text-2xl font-black text-white">{totalUpcoming}</p>
        </div>
        <div className="rounded-2xl border border-[#f95700]/20 bg-[#f95700]/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">
            Записей
          </p>
          <p className="mt-2 text-2xl font-black text-[#f95700]">{totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Заполнено
          </p>
          <p className="mt-2 text-2xl font-black text-white">{totalFull}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 rounded-2xl border border-white/10 bg-[#111217] p-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => (viewMode === "day" ? shiftDate(-1) : shiftWeek(-1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={selectedDateKey}
            onChange={(e) => setSelectedDateKey(e.target.value)}
            className="min-w-0 bg-transparent px-2 py-2 text-sm text-white outline-none"
          />
          <button
            onClick={() => (viewMode === "day" ? shiftDate(1) : shiftWeek(1))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode("day")}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${viewMode === "day" ? "bg-[#f95700] text-black" : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"}`}
          >
            <CalendarDays className="h-4 w-4" />
            День
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${viewMode === "week" ? "bg-[#f95700] text-black" : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"}`}
          >
            <Calendar className="h-4 w-4" />
            Неделя
          </button>
          <button
            onClick={fetchSlots}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Обновить
          </button>
          <button
            onClick={() => setBookedOnly((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${bookedOnly ? "bg-[#f95700] text-black" : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"}`}
          >
            <Users className="h-4 w-4" />
            Только записанные
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500" />
          <p className="mt-3 text-zinc-500">Загрузка...</p>
        </div>
      ) : viewMode === "day" ? (
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#111217] p-4">
              <h3 className="text-lg font-black text-white">{formatFullLabel(selectedDate)}</h3>
              <p className="text-sm text-zinc-500 mt-1">Слоты на выбранный день</p>
            </div>

            {filteredVisibleSlots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                <CalendarDays className="mx-auto mb-3 h-12 w-12 text-zinc-600" />
                <p className="text-zinc-400">На эту дату нет слотов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredVisibleSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${selectedSlotId === slot.id ? "border-[#f95700]/30 bg-[#f95700]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 text-white font-semibold">
                          <Clock className="h-4 w-4 text-orange-500" />
                          {slot.startTime} — {slot.endTime}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                          {slot.workoutType && <span>{slot.workoutType}</span>}
                          {slot.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {slot.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${statusClasses(slot)}`}
                      >
                        {slot.currentParticipants}/{slot.maxParticipants}
                      </span>
                    </div>
                    {slot.bookings && slot.bookings.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {slot.bookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300"
                          >
                            <span className="font-semibold">{booking.user?.name || "Аноним"}</span>
                            {(booking.user?.phone || booking.user?.telegram) && (
                              <span className="ml-2 text-zinc-500">
                                {booking.user?.phone && <span>Тел: {booking.user.phone}</span>}
                                {booking.user?.phone && booking.user?.telegram && <span> · </span>}
                                {booking.user?.telegram && (
                                  <span>@{booking.user.telegram.replace(/^@/, "")}</span>
                                )}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-white/10 bg-[#111217] p-5 space-y-4 h-fit xl:sticky xl:top-6">
            <h3 className="text-lg font-black text-white">Детали слота</h3>
            {selectedSlot ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">
                    {selectedSlot.startTime} — {selectedSlot.endTime}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDayLabel(new Date(selectedSlot.date))}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      Участники
                    </p>
                    <p className="mt-2 text-xl font-black text-white">
                      {selectedSlot.currentParticipants}/{selectedSlot.maxParticipants}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      Записей
                    </p>
                    <p className="mt-2 text-xl font-black text-[#f95700]">
                      {selectedSlot.bookings?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-zinc-400">
                  {selectedSlot.workoutType && <p>{selectedSlot.workoutType}</p>}
                  {selectedSlot.location && <p>{selectedSlot.location}</p>}
                  {selectedSlot.notes && (
                    <p className="rounded-xl border border-white/10 bg-white/5 p-3">
                      {selectedSlot.notes}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-3">
                    Клиенты
                  </p>
                  {selectedSlot.bookings && selectedSlot.bookings.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSlot.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="space-y-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold">{booking.user?.name || "Аноним"}</span>
                          </div>
                          {(booking.user?.phone || booking.user?.telegram) && (
                            <div className="pl-6 text-xs text-zinc-500">
                              {booking.user?.phone && <div>Телефон: {booking.user.phone}</div>}
                              {booking.user?.telegram && (
                                <div>Telegram: {booking.user.telegram}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">Нет записей.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Выберите слот, чтобы увидеть детали.</p>
            )}
          </aside>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111217] p-4">
            <h3 className="text-lg font-black text-white">Неделя с {formatDayLabel(weekStart)}</h3>
            <p className="text-sm text-zinc-500 mt-1">Все предстоящие тренировки на 7 дней</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {weekDays.map((day) => {
              const key = formatLocalDateKey(day);
              const daySlots = filterBookedSlots(
                slots.filter((slot) => slot.date.split("T")[0] === key),
              );
              return (
                <div
                  key={key}
                  className="rounded-2xl border border-white/10 bg-[#111217] p-3 space-y-3 min-h-48"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                        {day.toLocaleDateString("ru-RU", { weekday: "short" })}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {day.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedDateKey(key)}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-white/10"
                    >
                      День
                    </button>
                  </div>
                  <div className="space-y-2">
                    {daySlots.length === 0 ? (
                      <p className="text-sm text-zinc-600">Нет слотов</p>
                    ) : (
                      daySlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => {
                            setSelectedDateKey(key);
                            setViewMode("day");
                            setSelectedSlotId(slot.id);
                          }}
                          className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedSlotId === slot.id ? "border-[#f95700]/30 bg-[#f95700]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white">
                                {slot.startTime} — {slot.endTime}
                              </p>
                              <p className="text-xs text-zinc-500 truncate">
                                {slot.workoutType || "Тренировка"}
                              </p>
                              {slot.isBlockedByOverlap &&
                                slot.currentParticipants < slot.maxParticipants && (
                                  <p className="mt-1 inline-flex rounded-full border border-[#f95700]/20 bg-[#f95700]/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#f95700]">
                                    Пересечение
                                  </p>
                                )}
                              {slot.bookings && slot.bookings.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {slot.bookings.slice(0, 2).map((booking) => (
                                    <div key={booking.id} className="text-[11px] text-zinc-400">
                                      <span className="font-semibold text-zinc-300">
                                        {booking.user?.name || "Аноним"}
                                      </span>
                                      {(booking.user?.phone || booking.user?.telegram) && (
                                        <span className="ml-1">
                                          · {booking.user?.phone || booking.user?.telegram}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span
                              className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-widest ${statusClasses(slot)}`}
                            >
                              {slot.currentParticipants}/{slot.maxParticipants}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
