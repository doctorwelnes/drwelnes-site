"use client";

import React from "react";
import type { WorkoutDto } from "../hooks/useWorkoutData";

interface WorkoutMetaSectionProps {
  workout: WorkoutDto | null;
  note: string;
  rpe: string;
  setNote: (value: string) => void;
  setRpe: (value: string) => void;
  saving: boolean;
  justSaved: boolean;
  isFinished: boolean;
  onToggleFinished: () => Promise<void>;
  error: string | null;
}

export function WorkoutMetaSection({
  workout,
  note,
  rpe,
  setNote,
  setRpe,
  saving,
  justSaved,
  isFinished,
  onToggleFinished,
  error,
}: WorkoutMetaSectionProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Параметры тренировки</div>
          <div className="mt-1 text-sm text-zinc-600">
            Статус: {workout?.endedAt ? "завершена" : "в процессе"}
          </div>
        </div>

        <button
          type="button"
          disabled={!workout || saving}
          className={
            "rounded-md px-3 py-2 text-sm font-medium shadow-sm " +
            (workout?.endedAt
              ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
              : "bg-zinc-900 text-white hover:bg-zinc-800")
          }
          onClick={onToggleFinished}
        >
          {saving ? "Сохраняем..." : workout?.endedAt ? "Возобновить" : "Завершить"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="block">
          <div className="text-sm font-medium text-zinc-700">RPE (1-10)</div>
          <input
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
            disabled={isFinished}
            inputMode="numeric"
            placeholder="например 8"
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-medium text-zinc-700">Заметка</div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isFinished}
            placeholder="например: хорошо по самочувствию, не добрал по жиму"
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </label>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="text-sm text-zinc-600">
          {saving ? "Сохраняем..." : justSaved ? "Сохранено" : "Автосохранение"}
        </div>
      </div>
    </section>
  );
}
