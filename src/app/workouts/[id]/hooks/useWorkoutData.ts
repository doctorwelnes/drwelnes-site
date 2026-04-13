"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface WorkoutDto {
  id: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  rpe: number | null;
  note: string | null;
  createdAt: string;
  exercises: ExerciseDto[];
}

export interface ExerciseDto {
  id: string;
  exerciseName: string;
  note: string | null;
  position: number | null;
  sets: SetDto[];
}

export interface SetDto {
  id: string;
  position: number | null;
  reps: number | null;
  weightKg: string | number | null;
  timeSec: number | null;
  distanceM: number | null;
}

interface UseWorkoutDataReturn {
  workout: WorkoutDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setWorkout: React.Dispatch<React.SetStateAction<WorkoutDto | null>>;
}

export function useWorkoutData(workoutId: string): UseWorkoutDataReturn {
  const [workout, setWorkout] = useState<WorkoutDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!workoutId) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}`, { 
        cache: "no-store" 
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "failed_to_load");
        return;
      }

      const data = await res.json();
      setWorkout(data.workout);
    } catch {
      setError("failed_to_load");
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { workout, loading, error, refresh, setWorkout };
}

interface UseWorkoutMetaReturn {
  note: string;
  rpe: string;
  setNote: (value: string) => void;
  setRpe: (value: string) => void;
  saving: boolean;
  justSaved: boolean;
  error: string | null;
  toggleFinished: () => Promise<void>;
}

export function useWorkoutMeta(
  workoutId: string, 
  workout: WorkoutDto | null,
  refresh: () => Promise<void>
): UseWorkoutMetaReturn {
  const [note, setNote] = useState("");
  const [rpe, setRpe] = useState("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const metaAutosaveTimerRef = useRef<number | null>(null);
  const lastSavedMetaRef = useRef<{ rpe: string; note: string }>({ rpe: "", note: "" });

  // Sync with workout data when it loads
  useEffect(() => {
    if (!workout) return;
    setNote(workout.note ?? "");
    setRpe(workout.rpe === null || workout.rpe === undefined ? "" : String(workout.rpe));
    lastSavedMetaRef.current = {
      rpe: workout.rpe === null || workout.rpe === undefined ? "" : String(workout.rpe),
      note: workout.note ?? "",
    };
  }, [workout]);

  // Autosave meta
  useEffect(() => {
    if (!workoutId || !workout) return;
    if (workout.endedAt) return;

    if (metaAutosaveTimerRef.current) {
      window.clearTimeout(metaAutosaveTimerRef.current);
    }

    setJustSaved(false);

    metaAutosaveTimerRef.current = window.setTimeout(async () => {
      try {
        const nextRpe = rpe;
        const nextNote = note;

        const last = lastSavedMetaRef.current;
        if (nextRpe === last.rpe && nextNote === last.note) {
          return;
        }

        setSaving(true);
        setError(null);

        const payload = {
          rpe: nextRpe.trim() ? Number(nextRpe.trim()) : null,
          note: nextNote,
        };

        const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        setSaving(false);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "failed_to_update");
          return;
        }

        lastSavedMetaRef.current = { rpe: nextRpe, note: nextNote };
        setJustSaved(true);
        window.setTimeout(() => setJustSaved(false), 1200);
        await refresh();
      } finally {
        metaAutosaveTimerRef.current = null;
      }
    }, 600);

    return () => {
      if (metaAutosaveTimerRef.current) {
        window.clearTimeout(metaAutosaveTimerRef.current);
        metaAutosaveTimerRef.current = null;
      }
    };
  }, [workoutId, workout, rpe, note, refresh]);

  const toggleFinished = useCallback(async () => {
    if (!workout) return;
    setSaving(true);
    setError(null);

    const payload = workout.endedAt 
      ? { endedAt: null } 
      : { endedAt: new Date().toISOString() };
      
    const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "failed_to_update");
      return;
    }

    await refresh();
  }, [workout, workoutId, refresh]);

  return { note, rpe, setNote, setRpe, saving, justSaved, error, toggleFinished };
}
