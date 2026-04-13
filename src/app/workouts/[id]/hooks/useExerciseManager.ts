"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { ExerciseDto, WorkoutDto } from "./useWorkoutData";

interface UseExerciseManagerProps {
  workoutId: string;
  workout: WorkoutDto | null;
  selectedExerciseId: string | null;
  refresh: () => Promise<void>;
}

interface UseExerciseManagerReturn {
  exercises: ExerciseDto[];
  exerciseName: string;
  setExerciseName: (value: string) => void;
  savingExercise: boolean;
  savingEditId: string | null;
  deletingExerciseId: string | null;
  deletingSetId: string | null;
  error: string | null;
  canAddExercise: boolean;
  addExercise: () => Promise<void>;
  deleteExercise: (exerciseId: string, exerciseName: string) => Promise<void>;
  editExerciseName: string;
  setEditExerciseName: (value: string) => void;
  editSetValues: Record<string, { reps: string; weightKg: string }>;
  updateEditSetValue: (setId: string, field: "reps" | "weightKg", value: string) => void;
}

export function useExerciseManager({
  workoutId,
  workout,
  selectedExerciseId,
  refresh,
}: UseExerciseManagerProps): UseExerciseManagerReturn {
  const [exerciseName, setExerciseName] = useState("");
  const [editExerciseName, setEditExerciseName] = useState("");
  const [editSetValues, setEditSetValues] = useState<
    Record<string, { reps: string; weightKg: string }>
  >({});

  const [savingExercise, setSavingExercise] = useState(false);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const autosaveTimerRef = useRef<number | null>(null);
  const lastSavedExerciseNameRef = useRef<Record<string, string>>({});
  const lastSavedSetRef = useRef<Record<string, { reps: string; weightKg: string }>>({});

  const exercises = workout?.exercises ?? [];
  const isFinished = Boolean(workout?.endedAt);
  const canAddExercise = exerciseName.trim().length > 0 && !savingExercise;

  // Sync edit values when selected exercise changes
  useEffect(() => {
    if (!workout || !selectedExerciseId) return;
    if (isFinished) return;

    const ex = workout.exercises.find((e) => e.id === selectedExerciseId) ?? null;
    if (!ex) return;

    setEditExerciseName(ex.exerciseName);

    setEditSetValues((prev) => {
      const next: Record<string, { reps: string; weightKg: string }> = { ...prev };

      for (const s of ex.sets) {
        if (!next[s.id]) {
          next[s.id] = {
            reps: s.reps === null || s.reps === undefined ? "" : String(s.reps),
            weightKg: s.weightKg === null || s.weightKg === undefined ? "" : String(s.weightKg),
          };
        }

        if (!lastSavedSetRef.current[s.id]) {
          lastSavedSetRef.current[s.id] = {
            reps: s.reps === null || s.reps === undefined ? "" : String(s.reps),
            weightKg: s.weightKg === null || s.weightKg === undefined ? "" : String(s.weightKg),
          };
        }
      }

      if (!lastSavedExerciseNameRef.current[ex.id]) {
        lastSavedExerciseNameRef.current[ex.id] = ex.exerciseName;
      }

      return next;
    });
  }, [workout, selectedExerciseId, isFinished]);

  // Autosave exercise name and sets
  useEffect(() => {
    if (!workout || !selectedExerciseId) return;
    const ex = workout.exercises.find((e) => e.id === selectedExerciseId) ?? null;
    if (!ex) return;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(async () => {
      try {
        const targetExerciseId = ex.id;
        const desiredExerciseName = editExerciseName.trim();

        const lastExerciseName =
          lastSavedExerciseNameRef.current[targetExerciseId] ?? ex.exerciseName;

        if (
          desiredExerciseName &&
          desiredExerciseName !== lastExerciseName &&
          !deletingExerciseId &&
          !deletingSetId
        ) {
          setSavingEditId(targetExerciseId);
          setError(null);
          const res = await fetch(`/api/exercises/${encodeURIComponent(targetExerciseId)}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ exerciseName: desiredExerciseName }),
          });
          setSavingEditId(null);

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(data?.error ?? "failed_to_update");
          } else {
            lastSavedExerciseNameRef.current[targetExerciseId] = desiredExerciseName;
            await refresh();
          }
        }

        for (const s of ex.sets) {
          const desired = editSetValues[s.id];
          if (!desired) continue;

          const desiredReps = desired.reps.trim() || "";
          const desiredWeight = desired.weightKg.trim() || "";
          const last = lastSavedSetRef.current[s.id] ?? { reps: "", weightKg: "" };

          if (desiredReps === last.reps && desiredWeight === last.weightKg) continue;
          if (deletingExerciseId || deletingSetId) continue;

          setSavingEditId(s.id);
          setError(null);
          const payload = {
            reps: desiredReps || null,
            weightKg: desiredWeight || null,
          };

          const res = await fetch(`/api/sets/${encodeURIComponent(s.id)}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
          setSavingEditId(null);

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(data?.error ?? "failed_to_update");
          } else {
            lastSavedSetRef.current[s.id] = { reps: desiredReps, weightKg: desiredWeight };
            await refresh();
          }
        }
      } finally {
        autosaveTimerRef.current = null;
      }
    }, 600);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [
    workout,
    selectedExerciseId,
    editExerciseName,
    editSetValues,
    deletingExerciseId,
    deletingSetId,
    refresh,
  ]);

  const addExercise = useCallback(async () => {
    if (!canAddExercise) return;

    setSavingExercise(true);
    setError(null);

    const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}/exercises`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ exerciseName: exerciseName.trim() }),
    });

    setSavingExercise(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "failed_to_create_exercise");
      return;
    }

    setExerciseName("");
    await refresh();
  }, [canAddExercise, workoutId, exerciseName, refresh]);

  const deleteExercise = useCallback(
    async (exerciseId: string, name: string) => {
      const ok = window.confirm(`Удалить упражнение "${name}" и все его сеты?`);
      if (!ok) return;

      setDeletingExerciseId(exerciseId);
      setError(null);

      const res = await fetch(`/api/exercises/${encodeURIComponent(exerciseId)}`, {
        method: "DELETE",
      });

      setDeletingExerciseId(null);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "failed_to_delete_exercise");
      } else {
        await refresh();
      }
    },
    [refresh],
  );

  const updateEditSetValue = useCallback(
    (setId: string, field: "reps" | "weightKg", value: string) => {
      setEditSetValues((prev) => ({
        ...prev,
        [setId]: {
          ...prev[setId],
          [field]: value,
        },
      }));
    },
    [],
  );

  return {
    exercises,
    exerciseName,
    setExerciseName,
    savingExercise,
    savingEditId,
    deletingExerciseId,
    deletingSetId,
    error,
    canAddExercise,
    addExercise,
    deleteExercise,
    editExerciseName,
    setEditExerciseName,
    editSetValues,
    updateEditSetValue,
  };
}
