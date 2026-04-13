"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface WorkoutBooking {
  id: string;
  status: string;
  notes?: string;
  paymentStatus: string;
  createdAt: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    workoutType?: string;
    location?: string;
    price?: number;
    maxParticipants: number;
    currentParticipants: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface UserWorkoutBookingsProps {
  userId: string;
  refreshTrigger?: number;
  section?: "all" | "preview" | "upcoming" | "past";
  previewLimit?: number;
  upcomingHref?: string;
  pastHref?: string;
}

export default function UserWorkoutBookings({
  userId,
  refreshTrigger,
  section = "all",
  previewLimit = 1,
  upcomingHref = "/dashboard/workouts/upcoming",
  pastHref = "/dashboard/workouts/past",
}: UserWorkoutBookingsProps) {
  const [bookings, setBookings] = useState<WorkoutBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    bookingId: string;
  }>({ isOpen: false, bookingId: "" });

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        userId ? `/api/workout-bookings?userId=${userId}` : "/api/workout-bookings",
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError("Не удалось загрузить расписание тренировок");
      }
    } catch {
      setError("Ошибка при загрузке расписания тренировок");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, userId, refreshTrigger]);

  const handleCancelBooking = (bookingId: string) => {
    setConfirmModal({
      isOpen: true,
      bookingId,
    });
  };

  const confirmCancelBooking = async () => {
    try {
      const response = await fetch(`/api/workout-bookings?bookingId=${confirmModal.bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Запись успешно отменена");
        fetchBookings();

        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Не удалось отменить запись");
      }
    } catch {
      setError("Ошибка при отмене записи");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLocation = (location?: string) => {
    return location || "Фитнес-клуб DDX Патриот";
  };

  const getSlotWindow = (booking: WorkoutBooking) => {
    const startDate = new Date(booking.slot.date);
    const [startHours, startMinutes] = booking.slot.startTime.split(":").map(Number);
    startDate.setHours(startHours, startMinutes, 0, 0);

    const endDate = new Date(booking.slot.date);
    const [endHours, endMinutes] = booking.slot.endTime.split(":").map(Number);
    endDate.setHours(endHours, endMinutes, 0, 0);

    return { startDate, endDate };
  };

  const isUpcoming = (booking: WorkoutBooking) => {
    const { startDate } = getSlotWindow(booking);
    return startDate > new Date();
  };

  const isInProgress = (booking: WorkoutBooking) => {
    const { startDate, endDate } = getSlotWindow(booking);
    const now = new Date();
    return now >= startDate && now <= endDate;
  };

  const upcomingBookings = bookings.filter(
    (booking) => isUpcoming(booking) && booking.status !== "CANCELLED",
  );
  const pastBookings = bookings.filter(
    (booking) => !isUpcoming(booking) && booking.status !== "CANCELLED",
  );

  const previewMode = section === "preview";
  const showUpcomingSection = section !== "past";
  const showPastSection = section !== "upcoming";
  const visibleUpcomingBookings = previewMode
    ? upcomingBookings.slice(0, previewLimit)
    : upcomingBookings;
  const visiblePastBookings = previewMode ? pastBookings.slice(0, previewLimit) : pastBookings;

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <p className="text-zinc-500 mt-2">Загрузка записей...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500">
            {success}
          </div>
        )}

        {/* Upcoming Bookings */}
        {showUpcomingSection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Предстоящие тренировки</h3>
              {previewMode && upcomingBookings.length > previewLimit && (
                <Link
                  href={upcomingHref}
                  className="text-xs font-black uppercase tracking-widest text-[#f95700] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  Все
                </Link>
              )}
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">У вас нет запланированных тренировок</p>
                <p className="text-zinc-600 text-sm mt-2">Запишитесь на тренировку в календаре</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleUpcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="relative overflow-hidden rounded-2xl border border-[#f95700]/18 bg-linear-to-br from-[#f95700]/14 via-white/4 to-[#101217] p-4 sm:p-5 pr-14 sm:pr-16 shadow-[0_18px_50px_rgba(249,87,0,0.10)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#f95700] via-orange-400 to-amber-300" />
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#f95700]/10 blur-2xl" />

                    <div className="relative z-10 space-y-3 min-w-0">
                      {booking.slot.workoutType && (
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm sm:text-base font-semibold text-zinc-200">
                          {booking.slot.workoutType}
                        </span>
                      )}

                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#f95700]/20 bg-[#f95700]/12 text-[#f95700]">
                            <Calendar className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                              Дата
                            </p>
                            <p className="mt-0.5 text-sm sm:text-base font-semibold leading-snug text-white wrap-break-word">
                              {formatDate(booking.slot.date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#f95700]/20 bg-[#f95700]/12 text-[#f95700]">
                            <Clock className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                              Время
                            </p>
                            <p className="mt-0.5 text-sm sm:text-base font-semibold leading-snug text-white wrap-break-word">
                              {booking.slot.startTime} — {booking.slot.endTime}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#f95700]/20 bg-[#f95700]/12 text-[#f95700]">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                              Адрес
                            </p>
                            <p className="mt-0.5 text-xs sm:text-sm leading-snug text-zinc-300 wrap-break-word">
                              {formatLocation(booking.slot.location)}
                            </p>
                          </div>
                        </div>

                        {booking.slot.price && booking.slot.price > 0 && (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f95700]/18 bg-[#f95700]/10 px-3 py-1 text-[#ffb98a]">
                            <span className="text-xs sm:text-sm font-black">
                              {booking.slot.price} ₽
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isUpcoming(booking) && booking.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[#ffb98a] backdrop-blur-md transition-all hover:bg-[#f95700]/20 hover:text-white sm:right-4 sm:top-4 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Past Bookings */}
        {showPastSection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Прошедшие тренировки</h3>
              {previewMode && pastBookings.length > previewLimit && (
                <Link
                  href={pastHref}
                  className="text-xs font-black uppercase tracking-widest text-[#f95700] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  Все
                </Link>
              )}
            </div>

            {pastBookings.length === 0 ? (
              <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">У вас нет прошедших тренировок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visiblePastBookings.map((booking) => {
                  const inProgress = isInProgress(booking);
                  return (
                    <div
                      key={booking.id}
                      className="relative overflow-hidden rounded-2xl border border-[#f95700]/12 bg-linear-to-br from-[#f95700]/8 via-white/4 to-[#101217] p-4 sm:p-5 opacity-80"
                    >
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#f95700]/40 via-zinc-500 to-zinc-700" />

                      <div className="relative z-10 space-y-3 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] ${
                              inProgress
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                                : "border-zinc-600/40 bg-zinc-700/30 text-zinc-400"
                            }`}
                          >
                            {inProgress ? "Идет" : "Закончено"}
                          </span>
                          {booking.slot.workoutType && (
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-zinc-300">
                              {booking.slot.workoutType}
                            </span>
                          )}
                          {booking.paymentStatus === "PAID" && (
                            <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-green-400">
                              Оплачено
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-600/30 bg-zinc-700/25 text-zinc-500">
                              <Calendar className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                                Дата
                              </p>
                              <p className="mt-0.5 text-sm font-semibold leading-snug text-zinc-300 wrap-break-word">
                                {formatDate(booking.slot.date)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-600/30 bg-zinc-700/25 text-zinc-500">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                                Время
                              </p>
                              <p className="mt-0.5 text-sm font-semibold leading-snug text-zinc-300">
                                {booking.slot.startTime} — {booking.slot.endTime}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-600/30 bg-zinc-700/25 text-zinc-500">
                              <MapPin className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                                Адрес
                              </p>
                              <p className="mt-0.5 text-xs leading-snug text-zinc-400 wrap-break-word">
                                {formatLocation(booking.slot.location)}
                              </p>
                            </div>
                          </div>

                          {booking.slot.price && booking.slot.price > 0 && (
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f95700]/12 bg-[#f95700]/8 px-3 py-1 text-zinc-300">
                              <span className="text-xs font-black">{booking.slot.price} ₽</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: "" })}
        onConfirm={confirmCancelBooking}
        title="Подтвердите отмену"
        message="Вы уверены, что хотите отменить запись на тренировку?"
        confirmText="Да, отменить"
        cancelText="Отмена"
        type="danger"
      />
    </>
  );
}
