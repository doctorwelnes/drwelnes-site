"use client";

import React, { useState, useCallback } from "react";
import type { ExerciseDto } from "../hooks/useWorkoutData";

interface SetEditorProps {
  exercise: ExerciseDto;
  editSetValues: Record<string, { reps: string; weightKg: string }>;
  onUpdateSetValue: (setId: string, field: "reps" | "weightKg", value: string) => void;
  savingEditId: string | null;
  isFinished: boolean;
  onDeleteSet: (setId: string) => Promise<void>;
  onAddSet: () => Promise<void>;
  setReps: string;
  setWeight: string;
  onSetRepsChange: (value: string) => void;
  onSetWeightChange: (value: string) => void;
  savingSet: boolean;
}

export function SetEditor({
  exercise,
  editSetValues,
  onUpdateSetValue,
  savingEditId,
  isFinished,
  onDeleteSet,
  onAddSet,
  setReps,
  setWeight,
  onSetRepsChange,
  onSetWeightChange,
  savingSet,
}: SetEditorProps) {
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (setId: string) => {
      const ok = window.confirm("Удалить этот сет?");
      if (!ok) return;

      setDeletingSetId(setId);
      await onDeleteSet(setId);
      setDeletingSetId(null);
    },
    [onDeleteSet],
  );

  return (
    <div className="mt-3 space-y-4">
      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
        <div className="text-sm font-medium text-zinc-900">Добавить сет</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Повторы</div>
            <input
              value={setReps}
              onChange={(e) => onSetRepsChange(e.target.value)}
              disabled={isFinished}
              inputMode="numeric"
              placeholder="например 8"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Вес (кг)</div>
            <input
              value={setWeight}
              onChange={(e) => onSetWeightChange(e.target.value)}
              disabled={isFinished}
              inputMode="decimal"
              placeholder="например 80"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
          disabled={isFinished || savingSet}
          onClick={onAddSet}
        >
          {savingSet ? "Добавляем..." : "Добавить сет"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                #
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Повторы
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Вес
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {exercise.sets.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-sm text-zinc-600" colSpan={3}>
                  Пока нет сетов
                </td>
              </tr>
            ) : (
              exercise.sets.map((s, idx) => (
                <tr key={s.id} className="hover:bg-zinc-50">
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-700">{idx + 1}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                    <input
                      value={editSetValues[s.id]?.reps ?? ""}
                      onChange={(e) => onUpdateSetValue(s.id, "reps", e.target.value)}
                      disabled={isFinished}
                      inputMode="numeric"
                      className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        value={editSetValues[s.id]?.weightKg ?? ""}
                        onChange={(e) => onUpdateSetValue(s.id, "weightKg", e.target.value)}
                        disabled={isFinished}
                        inputMode="decimal"
                        className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                      />
                      <div className="text-xs text-zinc-600">
                        {savingEditId === s.id ? "Сохраняем..." : ""}
                      </div>
                      <button
                        type="button"
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-900 hover:bg-rose-100"
                        disabled={isFinished || Boolean(deletingSetId)}
                        onClick={() => handleDelete(s.id)}
                      >
                        {deletingSetId === s.id ? "..." : "Удалить"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
