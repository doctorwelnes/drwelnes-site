"use client";

import React from "react";
import type { ExerciseDto } from "../hooks/useWorkoutData";

interface ExerciseListProps {
  exercises: ExerciseDto[];
  selectedExerciseId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  deletingExerciseId: string | null;
  isFinished: boolean;
}

export function ExerciseList({
  exercises,
  selectedExerciseId,
  onSelect,
  onDelete,
  deletingExerciseId,
  isFinished,
}: ExerciseListProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900">Упражнения</div>
      </div>

      {exercises.length ? (
        <div className="space-y-2">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              role="button"
              tabIndex={0}
              className={
                "w-full cursor-pointer rounded-md border px-3 py-2 text-left text-sm " +
                (selectedExerciseId === ex.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white hover:bg-zinc-50")
              }
              onClick={() => onSelect(ex.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(ex.id);
                }
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate">
                    {ex.exerciseName}
                    <span className={selectedExerciseId === ex.id ? "text-white/70" : "text-zinc-500"}>
                      {" "}
                      ({ex.sets.length} сетов)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={
                    "shrink-0 rounded-md px-2 py-1 text-xs font-medium " +
                    (selectedExerciseId === ex.id
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "border border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100")
                  }
                  disabled={isFinished || Boolean(deletingExerciseId)}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDelete(ex.id, ex.exerciseName);
                  }}
                >
                  {deletingExerciseId === ex.id ? "..." : "Удалить"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-zinc-600">Пока нет упражнений</div>
      )}
    </div>
  );
}
