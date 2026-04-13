"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Calendar, MapPin, X } from "lucide-react";

interface WaitlistEntry {
  id: string;
  slotId: string;
  userId: string;
  position: number;
  status: string;
  totalWaiting: number;
  probability: number;
  createdAt: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    workoutType?: string;
    location?: string;
    price?: number;
    currentParticipants: number;
    maxParticipants: number;
  };
}

interface UserWaitlistProps {
  userId: string;
  refreshTrigger?: number;
}

export default function UserWaitlist({ userId, refreshTrigger }: UserWaitlistProps) {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchWaitlistEntries = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/waitlist?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        setWaitlistEntries(data);
      } else {
        setError("Не удалось загрузить очередь");
      }
    } catch {
      setError("Ошибка при загрузке очереди");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchWaitlistEntries();
    }
  }, [fetchWaitlistEntries, userId, refreshTrigger]);

  const handleLeaveWaitlist = async (entryId: string) => {
    if (!confirm("Вы уверены, что хотите выйти из очереди?")) {
      return;
    }

    try {
      const response = await fetch(`/api/waitlist?entryId=${entryId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuccess("Вы вышли из очереди");
        fetchWaitlistEntries();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Не удалось выйти из очереди");
      }
    } catch {
      setError("Ошибка при выходе из очереди");
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

  const formatTimeInQueue = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) {
      return "Только что";
    } else if (diffHours < 24) {
      return `${diffHours} ч. в очереди`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} д. в очереди`;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (probability >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const getProbabilityText = (probability: number) => {
    if (probability >= 80) return "Высокий";
    if (probability >= 50) return "Средний";
    return "Низкий";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        <p className="text-zinc-500 mt-2">Загрузка...</p>
      </div>
    );
  }

  if (waitlistEntries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Мои очереди</h3>
        <div className="text-sm text-zinc-500">
          {waitlistEntries.length} {waitlistEntries.length === 1 ? "очередь" : "очереди"}
        </div>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {waitlistEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-orange-500/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-medium text-lg">
                      {entry.slot.startTime} - {entry.slot.endTime}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      Очередь
                    </span>
                  </div>
                  <p className="text-zinc-500">{formatDate(entry.slot.date)}</p>
                  {entry.slot.workoutType && (
                    <p className="text-zinc-400 text-sm">{entry.slot.workoutType}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleLeaveWaitlist(entry.id)}
                className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
                title="Выйти из очереди"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500">#{entry.position}</div>
                <div className="text-xs text-zinc-500">Место в очереди</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white">{entry.totalWaiting}</div>
                <div className="text-xs text-zinc-500">Всего в очереди</div>
              </div>

              <div className="text-center">
                <div
                  className={`text-lg font-bold ${getProbabilityColor(entry.probability).split(" ")[0]}`}
                >
                  {entry.probability}%
                </div>
                <div className="text-xs text-zinc-500">Вероятность</div>
              </div>

              <div className="text-center">
                <div className="text-lg font-medium text-zinc-400">
                  {formatTimeInQueue(entry.createdAt)}
                </div>
                <div className="text-xs text-zinc-500">В очереди</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-zinc-500">
              {entry.slot.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{entry.slot.location}</span>
                </div>
              )}
              {entry.slot.price && entry.slot.price > 0 && (
                <div className="flex items-center gap-1">
                  <span>{entry.slot.price} ₽</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div
                  className={`px-3 py-1 rounded-lg text-xs font-medium border ${getProbabilityColor(entry.probability)}`}
                >
                  Шанс: {getProbabilityText(entry.probability)}
                </div>
                <div className="text-xs text-zinc-500">
                  Слот: {entry.slot.currentParticipants}/{entry.slot.maxParticipants}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
