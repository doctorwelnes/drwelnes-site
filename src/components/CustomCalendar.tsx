"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableDates?: string[]; // YYYY-MM-DD format
  bookedDates?: string[]; // YYYY-MM-DD format
  minDate?: Date;
  maxDate?: Date;
}

export default function CustomCalendar({
  selectedDate,
  onDateChange,
  availableDates = [],
  bookedDates = [],
  minDate,
  maxDate,
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getStartOfDay = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const normalizedMinDate = minDate ? getStartOfDay(minDate) : undefined;
  const normalizedMaxDate = maxDate ? getStartOfDay(maxDate) : undefined;

  const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    // Convert Sunday (0) to Monday (1) for our week starting on Monday
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isDateAvailable = (date: Date) => {
    const dateKey = formatDateKey(date);
    return availableDates.includes(dateKey);
  };

  const isDateBooked = (date: Date) => {
    const dateKey = formatDateKey(date);
    return bookedDates.includes(dateKey);
  };

  const isDateDisabled = (date: Date) => {
    const normalizedDate = getStartOfDay(date);

    if (normalizedMinDate && normalizedDate < normalizedMinDate) return true;
    if (normalizedMaxDate && normalizedDate > normalizedMaxDate) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateChange(date);
    }
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-12"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const available = isDateAvailable(date);
      const booked = isDateBooked(date);
      const disabled = isDateDisabled(date);
      const today = isToday(date);
      const selected = isSelected(date);

      let dayClasses =
        "h-10 sm:h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 cursor-pointer relative ";

      if (selected) {
        dayClasses += "bg-orange-500 text-white shadow-lg shadow-orange-500/30 ";
      } else if (booked) {
        dayClasses += "bg-red-500/10 text-red-500 border border-red-500/20 ";
      } else if (available) {
        dayClasses +=
          "bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 ";
      } else if (disabled) {
        dayClasses += "text-zinc-600 cursor-not-allowed opacity-50 ";
      } else {
        dayClasses += "text-zinc-400 hover:bg-white/5 hover:text-white ";
      }

      if (today) {
        dayClasses += "ring-2 ring-orange-500 ring-offset-2 ring-offset-[#13151a] ";
      }

      days.push(
        <div key={day} onClick={() => handleDateClick(date)} className={dayClasses}>
          {day}
          {available && !selected && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
          )}
          {booked && !selected && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          )}
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="bg-linear-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">
            {months[currentMonth.getMonth()]}
          </h3>
          <p className="text-zinc-400 text-sm mt-1">{currentMonth.getFullYear()}</p>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-black text-zinc-500 uppercase tracking-wider py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs text-zinc-400">Доступно</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs text-zinc-400">Заполнено</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 ring-2 ring-orange-500 ring-offset-2 ring-offset-[#13151a] rounded-full"></div>
          <span className="text-xs text-zinc-400">Сегодня</span>
        </div>
      </div>
    </div>
  );
}
