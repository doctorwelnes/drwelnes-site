"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, X, Users } from "lucide-react";

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
}

export default function WorkoutCalendar({
  isOpen,
  onClose,
  userId,
  onBookingSuccess,
}: WorkoutCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState<WorkoutSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<WorkoutSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatLocalDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
        setSlots(data);
      } else {
        setError("Ошибка при загрузке расписания тренировок");
      }
    } catch {
      setError("Ошибка при загрузке расписания тренировок");
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

  // Отладка для selectedSlot
  useEffect(() => {
    console.log("Selected slot changed:", selectedSlot);
  }, [selectedSlot]);

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
        fetchSlots(); // Обновляем слоты
        onBookingSuccess?.();

        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Не удалось записаться на тренировку");
      }
    } catch {
      setError("Ошибка при записи на тренировку");
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string, current: number, max: number) => {
    if (status === "FULL" || current >= max) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (status === "AVAILABLE") return "text-green-500 bg-green-500/10 border-green-500/20";
    return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
  };

  const getStatusText = (status: string, current: number, max: number) => {
    if (status === "FULL" || current >= max) return "Занято";
    if (status === "AVAILABLE") return "Доступно";
    return "Недоступно";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-9999 flex items-center justify-center p-4">
      <div className="bg-[#13151a] rounded-[40px] border border-white/5 shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Календарь тренировок</h3>
              <p className="text-sm text-zinc-500">Выберите удобное время для тренировки</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Calendar Sidebar */}
          <div className="w-full lg:w-80 p-6 border-b lg:border-b-0 lg:border-r border-white/5">
            <h4 className="text-lg font-semibold text-white mb-4">Выберите дату</h4>
            <input
              type="date"
              value={formatLocalDateKey(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(`${e.target.value}T00:00:00`))}
              min={formatLocalDateKey(new Date())}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            />

            <div className="mt-6">
              <h5 className="text-sm font-medium text-zinc-400 mb-2">Выбранная дата:</h5>
              <p className="text-white font-medium">{formatDate(selectedDate)}</p>
            </div>
          </div>

          {/* Slots List */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="text-lg font-semibold text-white mb-4">Доступные тренировки</h4>

            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-zinc-500 mt-2">Загрузка...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 mb-4">
                {success}
              </div>
            )}

            {!isLoading && !error && slots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">Нет доступных слотов</p>
                <p className="text-zinc-600 text-sm mt-2">Выберите другую дату</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedSlot?.id === slot.id
                        ? "border-orange-500 bg-orange-500/5"
                        : "border-white/10 bg-white/5 hover:border-orange-500/30"
                    }`}
                    onClick={() => {
                      setSelectedSlot(slot);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(
                                slot.status,
                                slot.currentParticipants,
                                slot.maxParticipants,
                              )}`}
                            >
                              {getStatusText(
                                slot.status,
                                slot.currentParticipants,
                                slot.maxParticipants,
                              )}
                            </span>
                          </div>
                          {slot.workoutType && (
                            <p className="text-zinc-500 text-sm">{slot.workoutType}</p>
                          )}
                        </div>
                      </div>
                      {slot.price && slot.price > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <span className="font-medium">{slot.price} ₽</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                      {slot.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="wrap-break-word">{slot.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {slot.currentParticipants}/{slot.maxParticipants} участников
                        </span>
                      </div>
                    </div>

                    {slot.notes && <p className="text-zinc-500 text-sm mt-2">{slot.notes}</p>}

                    {slot.bookings && slot.bookings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-zinc-500 mb-2">Участники:</p>
                        <div className="flex flex-wrap gap-2">
                          {slot.bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg"
                            >
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-xs text-zinc-300">
                                {booking.user?.name || "Аноним"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer with booking form */}
        {selectedSlot && (
          <div className="border-t border-white/5 p-6 bg-[#13151a]">
            <div className="space-y-4">
              <div>
                <h5 className="text-white font-medium mb-2">Записаться на тренировку</h5>
                <p className="text-zinc-500 text-sm">
                  {selectedSlot.startTime} - {selectedSlot.endTime},{" "}
                  {formatDate(new Date(selectedSlot.date))}
                </p>
              </div>

              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Добавьте комментарий (необязательно)"
                rows={2}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleBooking}
                  disabled={
                    isBooking ||
                    selectedSlot.status === "FULL" ||
                    selectedSlot.currentParticipants >= selectedSlot.maxParticipants
                  }
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? "Запись..." : "Записаться"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
