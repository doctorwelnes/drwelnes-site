"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, X, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import CustomCalendar from "./CustomCalendar";

interface WorkoutSlot {
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
  bookings?: { id: string; user?: { name?: string | null } }[];
}

interface WorkoutCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onBookingSuccess?: () => void;
  userPhone?: string | null;
  userTelegram?: string | null;
}

export default function WorkoutCalendar({
  isOpen,
  onClose,
  userId,
  onBookingSuccess,
  userPhone,
  userTelegram,
}: WorkoutCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<WorkoutSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<WorkoutSlot | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);
  const router = useRouter();

  const formatLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const shiftSelectedDate = (direction: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + direction);
    setSelectedDate(nextDate);
  };

  const fetchSlots = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const dateStr = formatLocalDateKey(selectedDate);
      const response = await fetch(
        `/api/workout-slots?date=${dateStr}${userId ? `&userId=${userId}` : ""}`,
      );

      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const rawSlots: WorkoutSlot[] = data.slots || data;
        const activeSlots = rawSlots.filter((slot) => {
          const slotDate = new Date(slot.date);
          const [h, m] = (slot.endTime || "23:59").split(":").map(Number);
          slotDate.setHours(h, m, 0, 0);
          return slotDate > now;
        });
        setSlots(activeSlots);

        // Загружаем данные для календаря - доступные и забронированные даты
        const calendarResponse = await fetch(`/api/workout-slots?userId=${userId || ""}`);
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          const allSlots = calendarData.slots || calendarData;

          // Собираем доступные даты (есть слоты)
          const available = allSlots
            .filter(
              (slot: WorkoutSlot) =>
                slot.status === "AVAILABLE" || slot.currentParticipants < slot.maxParticipants,
            )
            .map((slot: WorkoutSlot) => slot.date.split("T")[0]) as string[];

          // Собираем забронированные даты (все слоты заполнены)
          const booked = allSlots
            .filter((slot: WorkoutSlot) => slot.currentParticipants >= slot.maxParticipants)
            .map((slot: WorkoutSlot) => slot.date.split("T")[0]) as string[];

          setAvailableDates([...new Set(available)]);
          setBookedDates([...new Set(booked)]);
        }
      } else {
        setError("Ошибка при загрузке расписания");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, userId]);

  // Загрузка слотов для выбранной даты
  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchSlots();
    }
  }, [fetchSlots, isOpen, selectedDate]);

  const handleBooking = async () => {
    if (!selectedSlot || !userId) return;

    setIsBooking(true);
    setError("");

    try {
      const response = await fetch("/api/workout-bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          userId,
          notes: bookingNotes,
        }),
      });

      if (response.ok) {
        setSuccess("Вы успешно записались на тренировку!");
        setSelectedSlot(null);
        setBookingNotes("");
        fetchSlots();
        onBookingSuccess?.();

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка при записи на тренировку");
      }
    } finally {
      setIsBooking(false);
    }
  };

  const parseDateValue = (dateValue: string | Date) => {
    if (dateValue instanceof Date) return dateValue;

    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
      ? `${dateValue}T12:00:00`
      : dateValue;
    const parsed = new Date(normalizedValue);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDate = (dateValue: string | Date) => {
    const date = parseDateValue(dateValue);
    if (!date) return "Дата недоступна";

    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "FULL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "CANCELLED":
        return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
      default:
        return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "Доступно";
      case "FULL":
        return "Занято";
      case "CANCELLED":
        return "Отменено";
      default:
        return "Недоступно";
    }
  };

  const isSlotFull = (slot: WorkoutSlot) => {
    return slot.currentParticipants >= slot.maxParticipants;
  };

  const hasContact = Boolean(userPhone || userTelegram);

  const isInitialLoading = isLoading && slots.length === 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
        <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0c0d10] shadow-[0_30px_90px_rgba(0,0,0,0.65)] animate-in fade-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="shrink-0 border-b border-white/10 bg-linear-to-r from-[#f95700]/18 via-white/5 to-transparent p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  Выберите время тренировки
                </h2>
                <p className="text-zinc-400 text-sm mt-1">Dr.Welnes Premium</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="shrink-0 border-b border-white/10 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-1">Выберите дату</h3>
                <p className="text-zinc-400 text-sm sm:text-base">
                  Расписание на {formatDate(selectedDate)}
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => shiftSelectedDate(-1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                  aria-label="Предыдущая дата"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-[#f95700]/25 bg-[#f95700]/12 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#f95700]/18 sm:text-base"
                >
                  <Calendar className="w-4 h-4 text-[#f95700]" />
                  <span>{formatDate(selectedDate)}</span>
                </button>

                <button
                  onClick={() => shiftSelectedDate(1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
                  aria-label="Следующая дата"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Slots List */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {isInitialLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-zinc-500 mt-2">Загрузка...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 py-8 text-center">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">Нет доступных слотов</p>
                <p className="text-zinc-600 text-sm mt-2">Выберите другую дату</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                      selectedSlot?.id === slot.id
                        ? "border-[#f95700]/60 bg-[#f95700]/10 shadow-[0_0_0_1px_rgba(249,87,0,0.15)]"
                        : "border-white/10 bg-white/4 hover:border-[#f95700]/30 hover:bg-white/6"
                    }`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                            isSlotFull(slot)
                              ? "bg-red-500/20 text-red-500"
                              : "bg-[#f95700]/15 text-[#f95700]"
                          }`}
                        >
                          <Clock className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-white font-bold text-lg">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span
                              className={`rounded-lg border px-2 py-1 text-xs font-black uppercase tracking-wide ${getStatusColor(
                                slot.status,
                              )}`}
                            >
                              {getStatusText(slot.status)}
                            </span>
                          </div>
                          <p className="text-zinc-500 text-sm font-medium">
                            {formatDate(slot.date)}
                          </p>
                          {slot.workoutType && (
                            <p className="text-[#f95700] text-sm font-medium uppercase tracking-wide">
                              {slot.workoutType}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {slot.location && (
                          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <MapPin className="h-4 w-4 shrink-0 text-[#f95700]" />
                            <span className="min-w-0 flex-1 wrap-break-word text-xs sm:text-sm text-zinc-300">
                              {slot.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {slot.price && slot.price > 0 && (
                        <div className="inline-flex items-center gap-2 rounded-lg border border-[#f95700]/20 bg-[#f95700]/10 px-3 py-1">
                          <span className="text-lg font-black text-[#f95700]">{slot.price} ₽</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Form */}
          {selectedSlot && (
            <div className="shrink-0 border-t border-white/10 bg-[#101216] p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </h4>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>Дата: {formatDate(selectedSlot.date)}</p>
                    {selectedSlot.location && (
                      <p className="wrap-break-word">Место: {selectedSlot.location}</p>
                    )}
                    {selectedSlot.price && <p>Цена: {selectedSlot.price} ₽</p>}
                  </div>
                </div>

                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Добавьте комментарий (необязательно)"
                  rows={2}
                  className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none text-sm sm:text-base"
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:text-base"
                  >
                    Отмена
                  </button>

                  <button
                    onClick={() => {
                      if (isSlotFull(selectedSlot)) return;
                      if (!hasContact) {
                        setShowPhoneWarning(true);
                      } else {
                        handleBooking();
                      }
                    }}
                    disabled={isBooking || isSlotFull(selectedSlot)}
                    className="flex-1 rounded-xl bg-[#f95700] py-3 text-sm font-medium text-white transition-colors hover:bg-[#ff6b1a] disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  >
                    {isSlotFull(selectedSlot)
                      ? "Слот занят"
                      : isBooking
                        ? "Запись..."
                        : "Записаться"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm sm:text-base">
              {error}
            </div>
          )}

          {success && (
            <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm sm:text-base">
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 p-4">
          <div className="bg-linear-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Выберите дату
              </h3>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <CustomCalendar
                selectedDate={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                availableDates={availableDates}
                bookedDates={bookedDates}
                minDate={new Date()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Phone Warning Modal */}
      {showPhoneWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 p-4">
          <div className="bg-linear-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Требуется контакт
              </h3>
              <button
                onClick={() => setShowPhoneWarning(false)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-white font-medium mb-2">
                  Для записи на тренировку нужен телефон или Telegram
                </p>
                <p className="text-zinc-400 text-sm">
                  Пожалуйста, добавьте телефон или Telegram в настройках профиля для возможности
                  записи на тренировки
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPhoneWarning(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/settings");
                  }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Добавить контакт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
