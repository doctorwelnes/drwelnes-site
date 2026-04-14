"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, X, Users, Plus } from "lucide-react";
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
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingNotes, setBookingNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Загрузка слотов для выбранной даты
  const fetchSlots = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(
        `/api/workout-slots?date=${dateStr}${userId ? `&userId=${userId}` : ""}`,
      );

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || data);

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
    } catch {
      setError("Ошибка при загрузке расписания");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, userId]);

  useEffect(() => {
    if (isOpen && selectedDate) {
      fetchSlots();
    }
  }, [isOpen, selectedDate, fetchSlots]);

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

        // Если слот заполнен, предлагаем очередь
        if (data.canJoinWaitlist) {
          if (confirm("Слот заполнен. Хотите добавиться в очередь?")) {
            await handleJoinWaitlist();
          }
        } else {
          setError(data.error || "Ошибка при записи на тренировку");
        }
      }
    } catch {
      setError("Ошибка при записи на тренировку");
    } finally {
      setIsBooking(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!selectedSlot || !userId) return;

    setIsJoiningWaitlist(true);
    setError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          userId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Вы добавлены в очередь! Ваше место: #${data.position}`);
        setSelectedSlot(null);
        fetchSlots();

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка при добавлении в очередь");
      }
    } catch {
      setError("Ошибка при добавлении в очередь");
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
        return "Заполнено";
      case "CANCELLED":
        return "Отменено";
      default:
        return "Недоступно";
    }
  };

  const isSlotFull = (slot: WorkoutSlot) => {
    return slot.currentParticipants >= slot.maxParticipants;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-4 sm:p-6 border-b border-orange-500/20 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  Выберите время тренировки
                </h2>
                <p className="text-zinc-400 text-sm mt-1">Dr.Welnes Premium</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-xl bg-white/10 border border-white/20 text-zinc-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Date Selection */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium text-white mb-1">Выберите дату</h3>
                <button
                  onClick={() => setIsCalendarOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all duration-200 text-sm sm:text-base"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedDate.toISOString())}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slots List */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <p className="text-zinc-500 mt-2">Загрузка...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500">Нет доступных слотов</p>
                <p className="text-zinc-600 text-sm mt-2">Выберите другую дату</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 hover:border-orange-500/30 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                              isSlotFull(slot)
                                ? "bg-red-500/20 group-hover:bg-red-500/30"
                                : "bg-orange-500/20 group-hover:bg-orange-500/30"
                            }`}
                          >
                            <Clock
                              className={`w-6 h-6 transition-colors duration-200 ${
                                isSlotFull(slot) ? "text-red-500" : "text-orange-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-bold text-lg">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wide ${getStatusColor(
                                  slot.status,
                                )}`}
                              >
                                {getStatusText(slot.status)}
                              </span>
                              {isSlotFull(slot) && (
                                <span className="px-2 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                                  Очередь
                                </span>
                              )}
                            </div>
                            <p className="text-zinc-500 text-sm font-medium">
                              {formatDate(slot.date)}
                            </p>
                            {slot.workoutType && (
                              <p className="text-orange-500 text-sm font-medium uppercase tracking-wide">
                                {slot.workoutType}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                            <Users className="w-4 h-4 text-orange-500" />
                            <span className="text-zinc-300 font-medium">
                              {slot.currentParticipants}/{slot.maxParticipants}
                            </span>
                          </div>
                          {slot.location && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <span className="text-zinc-300 text-xs sm:text-sm break-words flex-1">
                                {slot.location}
                              </span>
                            </div>
                          )}
                        </div>

                        {slot.price && slot.price > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
                            <span className="text-orange-500 font-black text-lg">
                              {slot.price} ₽
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Form */}
          {selectedSlot && (
            <div className="border-t border-white/10 p-4 sm:p-6 bg-[#13151a] flex-shrink-0">
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </h4>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>Дата: {formatDate(selectedSlot.date)}</p>
                    {selectedSlot.location && (
                      <p className="break-words">Место: {selectedSlot.location}</p>
                    )}
                    {selectedSlot.price && <p>Цена: {selectedSlot.price} ₽</p>}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {selectedSlot.currentParticipants}/{selectedSlot.maxParticipants} участников
                      </span>
                    </div>
                  </div>
                </div>

                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Добавьте комментарий (необязательно)"
                  rows={2}
                  className="w-full px-3 sm:px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none text-sm sm:text-base"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors text-sm sm:text-base"
                  >
                    Отмена
                  </button>

                  {!isSlotFull(selectedSlot) ? (
                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {isBooking ? "Запись..." : "Записаться"}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinWaitlist}
                      disabled={isJoiningWaitlist}
                      className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4" />
                      {isJoiningWaitlist ? "Добавление..." : "В очередь"}
                    </button>
                  )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom duration-200">
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
    </>
  );
}
