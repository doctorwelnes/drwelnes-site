"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Save,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface WorkoutSlot {
  id: string;
  trainerId?: string;
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
  createdAt: string;
  updatedAt: string;
  bookings?: {
    id: string;
    user?: { name?: string | null; phone?: string | null; telegram?: string | null };
  }[];
}

const formatLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultFormData = (date = "") => ({
  date,
  startTime: "",
  maxParticipants: 1,
  location: "DDX Fitness ул. Саляма Адиля, 4, РЦ Патриот, этаж -1",
  workoutType: "Персональная тренировка",
  price: 4000,
  notes: "",
});

export default function WorkoutSlotManager() {
  const [slots, setSlots] = useState<WorkoutSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setError] = useState("");
  const [, setSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingSlot, setEditingSlot] = useState<WorkoutSlot | null>(null);
  const [filterDate, setFilterDate] = useState(() => formatLocalDateKey(new Date()));
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isEveningPackageModalOpen, setIsEveningPackageModalOpen] = useState(false);
  const [eveningPackageDate, setEveningPackageDate] = useState("");
  const [isWeeklyPackageModalOpen, setIsWeeklyPackageModalOpen] = useState(false);
  const [weeklyPackageDate, setWeeklyPackageDate] = useState("");
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" | "info" }[]
  >([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const confirmWeeklyPackage = async () => {
    setIsLoading(true);
    setError("");

    try {
      const anchorDate = weeklyPackageDate || formatLocalDateKey(new Date());
      const weekStart = getStartOfWeek(anchorDate);
      const slots = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + dayOffset);
        const dateKey = formatLocalDateKey(currentDate);

        for (let hour = 17; hour <= 22; hour += 1) {
          const startTime = `${hour.toString().padStart(2, "0")}:00`;
          const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

          slots.push({
            date: dateKey,
            startTime,
            endTime,
            maxParticipants: 1,
            location: "DDX Fitness ул. Саляма Адиля, 4, РЦ Патриот, этаж -1",
            workoutType: "Персональная тренировка",
            price: 4000,
            notes: "Недельный пакет",
          });
        }
      }

      const response = await fetch("/api/workout-slots/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slots }),
      });

      const data = await response.json();

      if (response.ok) {
        const createdCount = data.slots?.length || slots.length;
        setSuccess("Недельный пакет создан");
        addToast(
          `📅 Недельный пакет создан! Создано ${createdCount} слотов на неделю ${formatWeekRange(anchorDate)}`,
          "success",
        );
        fetchSlots();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка создания недельного пакета");
        addToast("❌ Не удалось создать недельный пакет. Попробуйте еще раз", "error");
      }
    } catch {
      setError("Ошибка при создании недельного пакета");
      addToast("❌ Ошибка сети при создании недельного пакета", "error");
    } finally {
      setIsLoading(false);
      setIsWeeklyPackageModalOpen(false);
    }
  };

  // Форма для создания/редактирования
  const [formData, setFormData] = useState(() => getDefaultFormData());

  const fetchSlots = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const url = filterDate ? `/api/workout-slots?date=${filterDate}` : "/api/workout-slots";
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const nextSlots = data.slots || data;
        setSlots(nextSlots);
        setSelectedSlotId((current) =>
          current && nextSlots.some((slot: WorkoutSlot) => slot.id === current)
            ? current
            : (nextSlots[0]?.id ?? null),
        );
      } else {
        setError("Ошибка при загрузке расписания");
      }
    } catch {
      setError("Ошибка при загрузке расписания");
    } finally {
      setIsLoading(false);
    }
  }, [filterDate]);

  // Загрузка слотов
  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const resetForm = () => {
    setFormData({
      date: "",
      startTime: "",
      maxParticipants: 1,
      location: "DDX Fitness ул. Саляма Адиля, 4, РЦ Патриот, этаж -1",
      workoutType: "Персональная тренировка",
      price: 4000,
      notes: "",
    });
    setIsCreating(false);
    setEditingSlot(null);
  };

  const handleCreate = () => {
    setFormData(getDefaultFormData(filterDate || formatLocalDateKey(new Date())));
    setIsCreating(true);
  };

  const selectedSlot = selectedSlotId
    ? (slots.find((slot) => slot.id === selectedSlotId) ?? slots[0] ?? null)
    : (slots[0] ?? null);

  const availableSlots = slots.filter(
    (slot) => slot.status === "AVAILABLE" || slot.currentParticipants < slot.maxParticipants,
  );

  const fullyBookedSlots = slots.filter(
    (slot) => slot.status === "FULL" || slot.currentParticipants >= slot.maxParticipants,
  );

  const shiftFilterDate = (direction: number) => {
    const currentDate = filterDate ? new Date(`${filterDate}T00:00:00`) : new Date();
    currentDate.setDate(currentDate.getDate() + direction);
    setFilterDate(formatLocalDateKey(currentDate));
  };

  const handleEdit = (slot: WorkoutSlot) => {
    setFormData({
      date: slot.date.split("T")[0],
      startTime: slot.startTime,
      maxParticipants: slot.maxParticipants,
      location: slot.location || "DDX Fitness ул. Саляма Адиля, 4, РЦ Патриот, этаж -1",
      workoutType: slot.workoutType || "Персональная тренировка",
      price: slot.price || 4000,
      notes: slot.notes || "",
    });
    setEditingSlot(slot);
    setIsCreating(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Рассчитываем время окончания (+1 час)
      const [hours, minutes] = formData.startTime.split(":").map(Number);
      const endHours = (hours + 1) % 24;
      const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;

      const payload = {
        date: new Date(formData.date + "T00:00:00.000Z"),
        startTime: formData.startTime,
        endTime: endTime,
        maxParticipants: formData.maxParticipants,
        workoutType: formData.workoutType || null,
        location: formData.location,
        price: formData.price,
        notes: formData.notes || null,
        trainerId: null,
      };

      let response;
      if (editingSlot) {
        response = await fetch(`/api/workout-slots/${editingSlot.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("/api/workout-slots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        setSuccess(editingSlot ? "Слот обновлен" : "Слот создан");
        addToast(`✅ Слот успешно ${editingSlot ? "обновлен" : "создан"}`, "success");
        resetForm();
        fetchSlots();

        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка сохранения");
        addToast("❌ Ошибка при сохранении слота", "error");
      }
    } catch {
      setError("Ошибка при сохранении");
      addToast("❌ Ошибка сети при сохранении", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    setSlotToDelete(slotId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/workout-slots/${slotToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Слот удален");
        addToast("🗑️ Слот успешно удален", "success");
        fetchSlots();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        if (response.status === 409) {
          setError("Нельзя удалить слот с активными записями. Сначала отмените все записи.");
          addToast("⚠️ Нельзя удалить слот с активными записями", "error");
        } else {
          setError(data.error || "Ошибка удаления");
          addToast("❌ Ошибка при удалении слота", "error");
        }
      }
    } catch {
      setError("Ошибка при удалении");
      addToast("❌ Ошибка сети при удалении", "error");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setSlotToDelete(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearAllModalOpen(true);
  };

  const confirmClearAll = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/clear-all-workouts", {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Все тренировки очищены");
        addToast("🗑️ Все расписания очищены! Удалены все слоты и записи на тренировки", "success");
        fetchSlots();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Ошибка очистки");
        addToast("❌ Не удалось очистить расписание. Попробуйте еще раз", "error");
      }
    } catch {
      setError("Ошибка при очистке");
      addToast("❌ Ошибка сети при очистке", "error");
    } finally {
      setIsLoading(false);
      setIsClearAllModalOpen(false);
    }
  };

  const handleEveningPackage = async () => {
    setEveningPackageDate(formatLocalDateKey(new Date()));
    setIsEveningPackageModalOpen(true);
  };

  const getStartOfWeek = (dateValue: string) => {
    const date = new Date(`${dateValue}T00:00:00`);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const formatWeekRange = (dateValue: string) => {
    const start = getStartOfWeek(dateValue);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} — ${end.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`;
  };

  const handleWeeklyPackage = async () => {
    setWeeklyPackageDate(filterDate || formatLocalDateKey(new Date()));
    setIsWeeklyPackageModalOpen(true);
  };

  const confirmEveningPackage = async () => {
    setIsLoading(true);
    setError("");

    try {
      const selectedDate = eveningPackageDate || formatLocalDateKey(new Date());

      // Создаем 6 слотов с 17:00 до 23:00
      const slots = [];
      for (let hour = 17; hour <= 22; hour++) {
        const startTime = `${hour.toString().padStart(2, "0")}:00`;
        const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

        slots.push({
          date: selectedDate,
          startTime,
          endTime,
          maxParticipants: 1,
          location: "DDX Fitness ул. Саляма Адиля, 4, РЦ Патриот, этаж -1",
          workoutType: "Персональная тренировка",
          price: 4000,
          notes: "Вечерний пакет",
        });
      }

      // Создаем все слоты одним запросом
      const response = await fetch("/api/workout-slots/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slots }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Вечерний пакет создан");
        addToast(
          `🌅 Вечерний пакет создан! Создано ${data.slots?.length || 6} слотов с 17:00 до 23:00 на ${selectedDate}`,
          "success",
        );
        fetchSlots();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Ошибка создания вечернего пакета");
        addToast("❌ Не удалось создать вечерний пакет. Попробуйте еще раз", "error");
      }
    } catch {
      setError("Ошибка при создании вечернего пакета");
      addToast("❌ Ошибка сети при создании пакета", "error");
    } finally {
      setIsLoading(false);
      setIsEveningPackageModalOpen(false);
    }
  };

  const getStatusColor = (status: string, current: number, max: number) => {
    if (status === "FULL" || current >= max) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (status === "AVAILABLE") return "text-green-500 bg-green-500/10 border-green-500/20";
    return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
  };

  const getStatusText = (status: string, current: number, max: number) => {
    if (status === "FULL" || current >= max) return "Заполнено";
    if (status === "AVAILABLE") return "Доступно";
    return "Недоступно";
  };

  return (
    <div className="space-y-6">
      {/* Модальное окно удаления слота */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-600 flex items-center justify-center p-6 backdrop-blur-md"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-[#141414] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Удаление слота</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Вы уверены, что хотите удалить этот тренировочный слот?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl transition-all border border-neutral-800"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white shadow-red-500/20 py-4 rounded-2xl transition-all"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно недельного пакета */}
      {isWeeklyPackageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-600 flex items-center justify-center p-6 backdrop-blur-md"
          onClick={() => setIsWeeklyPackageModalOpen(false)}
        >
          <div
            className="bg-[#141414] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cyan-500/10 text-cyan-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Недельный пакет</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Создать вечерние слоты на всю неделю, начиная с выбранной даты.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Дата внутри недели
                </label>
                <input
                  type="date"
                  value={weeklyPackageDate}
                  onChange={(e) => setWeeklyPackageDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                />
                {weeklyPackageDate && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Неделя: {formatWeekRange(weeklyPackageDate)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsWeeklyPackageModalOpen(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl transition-all border border-neutral-800"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmWeeklyPackage}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20 py-4 rounded-2xl transition-all"
                >
                  Создать пакет
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно очистки всех слотов */}
      {isClearAllModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-600 flex items-center justify-center p-6 backdrop-blur-md"
          onClick={() => setIsClearAllModalOpen(false)}
        >
          <div
            className="bg-[#141414] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 text-red-500">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Очистка расписания</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Вы уверены, что хотите удалить ВСЕ тренировочные слоты и записи? Это действие
                    нельзя отменить!
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl transition-all border border-neutral-800"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmClearAll}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white shadow-red-500/20 py-4 rounded-2xl transition-all"
                >
                  Очистить все
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно вечернего пакета */}
      {isEveningPackageModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-600 flex items-center justify-center p-6 backdrop-blur-md"
          onClick={() => setIsEveningPackageModalOpen(false)}
        >
          <div
            className="bg-[#141414] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/10 text-amber-500">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Вечерний пакет</h2>
                  <p className="text-neutral-500 text-sm mt-1">
                    Создать вечерний пакет на выбранную дату? Будет создано 6 слотов с 17:00 до
                    23:00.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Дата создания
                </label>
                <input
                  type="date"
                  value={eveningPackageDate}
                  onChange={(e) => setEveningPackageDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEveningPackageModalOpen(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl transition-all border border-neutral-800"
                >
                  Отмена
                </button>
                <button
                  onClick={confirmEveningPackage}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 py-4 rounded-2xl transition-all"
                >
                  Создать пакет
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Уведомления */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-sm transition-all transform ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
          }`}
          style={{
            background:
              toast.type === "success" ? "#10b981" : toast.type === "error" ? "#ef4444" : "#3b82f6",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Заголовок и управление */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Управление расписанием
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5">
            <button
              onClick={() => shiftFilterDate(-1)}
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
              aria-label="Предыдущая дата"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 bg-transparent border-0 text-white text-sm focus:outline-none min-w-0 flex-1"
            />
            <button
              onClick={() => shiftFilterDate(1)}
              className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
              aria-label="Следующая дата"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="truncate">Добавить слот</span>
            </button>
            <button
              onClick={handleEveningPackage}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors disabled:opacity-50 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span className="truncate">Вечерний пакет</span>
            </button>
            <button
              onClick={handleWeeklyPackage}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span className="truncate">Недельный пакет</span>
            </button>
            <button
              onClick={handleClearAll}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 col-span-2 sm:col-span-1 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Очистить все
            </button>
          </div>
        </div>
      </div>

      {/* Форма создания/редактирования */}
      {(isCreating || editingSlot) && (
        <div className="bg-white/5 rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">
              {editingSlot ? "Редактирование слота" : "Новый слот"}
            </h3>
            <button
              onClick={resetForm}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Дата</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Время начала</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Макс. участников
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={(e) =>
                  setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Вид тренировки</label>
              <select
                value={formData.workoutType}
                onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="Персональная тренировка">Персональная тренировка</option>
                <option value="Групповая тренировка">Групповая тренировка</option>
                <option value="Фитнес-консультация">Фитнес-консультация</option>
                <option value="Спортивное питание">Спортивное питание</option>
                <option value="Восстановление">Восстановление</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Местоположение</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="DDX Fitness ул. Саляма Адиля, 4, РЦ Патриот, этаж -1"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Цена (₽)</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                placeholder="4000"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Примечания</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Дополнительная информация..."
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-neutral-600 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editingSlot ? "Обновить" : "Создать"}
            </button>
          </div>
        </div>
      )}

      {/* Список слотов */}
      {!isCreating && !editingSlot && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="text-zinc-500 mt-2">Загрузка...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">Нет доступных слотов</p>
              <p className="text-zinc-600 text-sm mt-2">Создайте новый слот для начала работы</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_0.95fr] gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      Всего слотов
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{slots.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#f95700]/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-300">
                      Доступные
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#f95700]">
                      {availableSlots.length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      Полные
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">{fullyBookedSlots.length}</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111217]">
                  <div className="hidden md:grid grid-cols-[1.35fr_1fr_1fr_1.2fr_96px] gap-4 border-b border-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    <div>Слот</div>
                    <div>Статус</div>
                    <div>Локация</div>
                    <div>Участники</div>
                    <div className="text-right">Действия</div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {slots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      return (
                        <div
                          key={slot.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedSlotId(slot.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedSlotId(slot.id);
                            }
                          }}
                          className={`cursor-pointer px-4 py-4 transition-colors ${
                            isSelected ? "bg-white/5" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.35fr_1fr_1fr_1.2fr_96px] md:gap-4 md:items-center">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                                <span className="font-semibold text-white">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-zinc-500">
                                {new Date(slot.date).toLocaleDateString("ru-RU")}
                              </p>
                              {slot.workoutType && (
                                <p className="mt-1 text-xs font-medium text-zinc-400">
                                  {slot.workoutType}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${getStatusColor(
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

                            <div className="flex items-center gap-2 text-sm text-zinc-500 min-w-0">
                              <MapPin className="w-4 h-4 shrink-0" />
                              <span className="truncate">{slot.location || "—"}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                              <Users className="w-4 h-4 shrink-0" />
                              <span>
                                {slot.currentParticipants}/{slot.maxParticipants}
                              </span>
                              {slot.price && slot.price > 0 && (
                                <span className="text-orange-400">· {slot.price} ₽</span>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleEdit(slot);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                                aria-label="Редактировать слот"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDelete(slot.id);
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                                aria-label="Удалить слот"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <aside className="rounded-2xl border border-white/10 bg-[#111217] p-5 space-y-4 xl:sticky xl:top-6 h-fit">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    Day-view
                  </p>
                  <h3 className="mt-2 text-lg font-black text-white">Выбранный слот</h3>
                </div>

                {selectedSlot ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f95700]/15 text-[#f95700]">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {selectedSlot.startTime} - {selectedSlot.endTime}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {new Date(selectedSlot.date).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                      </div>
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
                          Цена
                        </p>
                        <p className="mt-2 text-xl font-black text-[#f95700]">
                          {selectedSlot.price && selectedSlot.price > 0
                            ? `${selectedSlot.price} ₽`
                            : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-zinc-400">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-zinc-500" />
                        <p>{selectedSlot.location || "Без локации"}</p>
                      </div>
                      {selectedSlot.workoutType && (
                        <div className="flex items-start gap-3">
                          <Calendar className="mt-0.5 w-4 h-4 shrink-0 text-zinc-500" />
                          <p>{selectedSlot.workoutType}</p>
                        </div>
                      )}
                      {selectedSlot.notes && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-zinc-500">
                          {selectedSlot.notes}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-3">
                        Записи ({selectedSlot.bookings?.length || 0})
                      </p>
                      {selectedSlot.bookings && selectedSlot.bookings.length > 0 ? (
                        <div className="space-y-2">
                          {selectedSlot.bookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300"
                            >
                              <Users className="h-4 w-4 text-orange-500" />
                              <div className="min-w-0">
                                <div className="font-semibold">
                                  {booking.user?.name || "Аноним"}
                                </div>
                                {(booking.user?.phone || booking.user?.telegram) && (
                                  <div className="text-xs text-zinc-500">
                                    {booking.user?.phone && (
                                      <span>Телефон: {booking.user.phone}</span>
                                    )}
                                    {booking.user?.phone && booking.user?.telegram && (
                                      <span> · </span>
                                    )}
                                    {booking.user?.telegram && (
                                      <span>Telegram: {booking.user.telegram}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-500">На этот слот пока нет записей.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">
                    Выберите слот в таблице, чтобы увидеть детали.
                  </p>
                )}
              </aside>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
