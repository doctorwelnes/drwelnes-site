"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

type SetDto = {
  id: string;
  position: number | null;
  reps: number | null;
  weightKg: string | number | null;
  timeSec: number | null;
  distanceM: number | null;
};

type ExerciseDto = {
  id: string;
  exerciseName: string;
  note: string | null;
  position: number | null;
  sets: SetDto[];
};

type WorkoutDto = {
  id: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  rpe: number | null;
  note: string | null;
  createdAt: string;
  exercises: ExerciseDto[];
};

function humanizeError(code: string) {
  switch (code) {
    case "unauthorized":
      return "Нужно войти в аккаунт";
    case "not_found":
      return "Тренировка не найдена";
    case "failed_to_load":
      return "Не удалось загрузить тренировку";
    case "exercise_name_required":
      return "Укажи название упражнения";
    case "invalid_reps":
      return "Повторы должны быть числом";
    case "invalid_rpe":
      return "RPE должен быть числом от 1 до 10";
    case "invalid_endedAt":
      return "Некорректная дата завершения";
    case "ended_before_started":
      return "Время завершения не может быть раньше начала";
    case "failed_to_update":
      return "Не удалось сохранить изменения";
    case "failed_to_create_exercise":
      return "Не удалось добавить упражнение";
    case "failed_to_create_set":
      return "Не удалось добавить сет";
    case "failed_to_delete_exercise":
      return "Не удалось удалить упражнение";
    case "failed_to_delete_set":
      return "Не удалось удалить сет";
    case "invalid_weight":
      return "Вес должен быть числом";
    default:
      return `Ошибка: ${code}`;
  }
}

export default function WorkoutDetailClient() {
  const params = useParams();
  const workoutId = String((params as any).id || "");

  const [workout, setWorkout] = useState<WorkoutDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingExercise, setSavingExercise] = useState(false);
  const [savingSetId, setSavingSetId] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [deletingExerciseId, setDeletingExerciseId] = useState<string | null>(null);
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [exerciseName, setExerciseName] = useState("");
  const [setReps, setSetReps] = useState("");
  const [setWeight, setSetWeight] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [rpe, setRpe] = useState("");

  const [editExerciseName, setEditExerciseName] = useState("");
  const [editSetValues, setEditSetValues] = useState<Record<string, { reps: string; weightKg: string }>>(
    {}
  );

  const autosaveTimerRef = useRef<number | null>(null);
  const lastSavedExerciseNameRef = useRef<Record<string, string>>({});
  const lastSavedSetRef = useRef<Record<string, { reps: string; weightKg: string }>>({});

  const metaAutosaveTimerRef = useRef<number | null>(null);
  const lastSavedMetaRef = useRef<{ rpe: string; note: string }>({ rpe: "", note: "" });
  const [metaJustSaved, setMetaJustSaved] = useState(false);

  const canAddExercise = useMemo(
    () => exerciseName.trim().length > 0 && !savingExercise,
    [exerciseName, savingExercise]
  );

  const isFinished = Boolean(workout?.endedAt);

  async function refresh() {
    if (!workoutId) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}`, { cache: "no-store" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "failed_to_load");
      return;
    }

    const data = (await res.json()) as { workout: WorkoutDto };
    setWorkout(data.workout);

    setNote(data.workout.note ?? "");
    setRpe(data.workout.rpe === null || data.workout.rpe === undefined ? "" : String(data.workout.rpe));

    if (selectedExerciseId) {
      const current = data.workout.exercises.find((e) => e.id === selectedExerciseId) ?? null;
      if (current) {
        setEditExerciseName(current.exerciseName);
      }
    }

    if (!selectedExerciseId && data.workout.exercises[0]?.id) {
      setSelectedExerciseId(data.workout.exercises[0].id);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  useEffect(() => {
    if (!workout) return;
    setNote(workout.note ?? "");
    setRpe(workout.rpe === null || workout.rpe === undefined ? "" : String(workout.rpe));
    lastSavedMetaRef.current = {
      rpe: workout.rpe === null || workout.rpe === undefined ? "" : String(workout.rpe),
      note: workout.note ?? "",
    };
  }, [workout]);

  useEffect(() => {
    if (!workoutId || !workout) return;
    if (isFinished) return;

    if (metaAutosaveTimerRef.current) {
      window.clearTimeout(metaAutosaveTimerRef.current);
    }

    setMetaJustSaved(false);

    metaAutosaveTimerRef.current = window.setTimeout(async () => {
      try {
        const nextRpe = rpe;
        const nextNote = note;

        const last = lastSavedMetaRef.current;
        if (nextRpe === last.rpe && nextNote === last.note) {
          return;
        }

        setSavingMeta(true);
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

        setSavingMeta(false);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "failed_to_update");
          return;
        }

        lastSavedMetaRef.current = { rpe: nextRpe, note: nextNote };
        setMetaJustSaved(true);
        window.setTimeout(() => setMetaJustSaved(false), 1200);
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
  }, [workoutId, workout, rpe, note]);

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
  }, [workout, selectedExerciseId]);

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

        const lastExerciseName = lastSavedExerciseNameRef.current[targetExerciseId] ?? ex.exerciseName;

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
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">
            {workout?.title ?? (loading ? "Загрузка..." : "Тренировка")}
          </h1>
          {workout ? (
            <div className="mt-1 text-sm text-zinc-600">
              {new Date(workout.startedAt).toLocaleString()}
            </div>
          ) : null}
        </div>
        <a
          href="/workouts"
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
        >
          Назад
        </a>
      </div>

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
            disabled={!workout || savingMeta}
            className={
              "rounded-md px-3 py-2 text-sm font-medium shadow-sm " +
              (workout?.endedAt
                ? "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50"
                : "bg-zinc-900 text-white hover:bg-zinc-800")
            }
            onClick={async () => {
              if (!workout) return;
              setSavingMeta(true);
              setError(null);

              const payload = workout.endedAt ? { endedAt: null } : { endedAt: new Date().toISOString() };
              const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}`, {
                method: "PATCH",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
              });

              setSavingMeta(false);

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "failed_to_update");
                return;
              }

              await refresh();
            }}
          >
            {savingMeta
              ? "Сохраняем..."
              : workout?.endedAt
                ? "Возобновить"
                : "Завершить"}
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="text-sm text-zinc-600">
            {savingMeta ? "Сохраняем..." : metaJustSaved ? "Сохранено" : "Автосохранение"}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          {humanizeError(error)}
        </div>
      ) : null}

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Добавить упражнение</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-zinc-700">Название упражнения</div>
            <input
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              disabled={isFinished}
              placeholder="Например: Жим лёжа"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              disabled={isFinished || !canAddExercise}
              className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
              onClick={async () => {
                setSavingExercise(true);
                setError(null);
                const res = await fetch(`/api/workouts/${encodeURIComponent(workoutId)}/exercises`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ exerciseName }),
                });
                setSavingExercise(false);

                if (!res.ok) {
                  const data = await res.json().catch(() => null);
                  setError(data?.error ?? "failed_to_create_exercise");
                  return;
                }

                setExerciseName("");
                await refresh();
              }}
            >
              {savingExercise ? "Добавляем..." : "Добавить"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-zinc-900">Упражнения</div>
            {loading ? <div className="text-sm text-zinc-600">Загрузка...</div> : null}
          </div>

          {workout?.exercises?.length ? (
            <div className="space-y-2">
              {workout.exercises.map((ex) => (
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
                  onClick={() => {
                    setSelectedExerciseId(ex.id);
                    setEditExerciseName(ex.exerciseName);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedExerciseId(ex.id);
                      setEditExerciseName(ex.exerciseName);
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
                      disabled={isFinished || Boolean(deletingExerciseId) || Boolean(deletingSetId)}
                      onClick={async (ev) => {
                        ev.stopPropagation();
                        const ok = window.confirm(`Удалить упражнение "${ex.exerciseName}" и все его сеты?`);
                        if (!ok) return;

                        setDeletingExerciseId(ex.id);
                        setError(null);
                        const res = await fetch(`/api/exercises/${encodeURIComponent(ex.id)}`, {
                          method: "DELETE",
                        });
                        setDeletingExerciseId(null);

                        if (!res.ok) {
                          const data = await res.json().catch(() => null);
                          setError(data?.error ?? "failed_to_delete_exercise");
                          return;
                        }

                        if (selectedExerciseId === ex.id) {
                          setSelectedExerciseId(null);
                        }
                        await refresh();
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

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-semibold text-zinc-900">Подходы</div>

          {workout && selectedExerciseId ? (
            (() => {
              const ex = workout.exercises.find((e) => e.id === selectedExerciseId) ?? null;
              if (!ex) return <div className="mt-3 text-sm text-zinc-600">Выбери упражнение</div>;

              return (
                <div className="mt-3 space-y-4">
                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <div className="text-sm font-medium text-zinc-900">Редактировать упражнение</div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <label className="block sm:col-span-2">
                        <div className="text-sm font-medium text-zinc-700">Название</div>
                        <input
                          value={editExerciseName}
                          onChange={(e) => setEditExerciseName(e.target.value)}
                          disabled={isFinished}
                          className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
                        />
                      </label>
                      <div className="flex items-end">
                        <div className="w-full text-right text-xs text-zinc-600">
                          {savingEditId === ex.id ? "Сохраняем..." : "Автосохранение"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                    <div className="text-sm font-medium text-zinc-900">Добавить сет</div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <label className="block">
                        <div className="text-sm font-medium text-zinc-700">Повторы</div>
                        <input
                          value={setReps}
                          onChange={(e) => setSetReps(e.target.value)}
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
                          onChange={(e) => setSetWeight(e.target.value)}
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
                      disabled={isFinished || Boolean(savingSetId)}
                      onClick={async () => {
                        setSavingSetId(ex.id);
                        setError(null);
                        const res = await fetch(`/api/exercises/${encodeURIComponent(ex.id)}/sets`, {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ reps: setReps, weightKg: setWeight }),
                        });
                        setSavingSetId(null);

                        if (!res.ok) {
                          const data = await res.json().catch(() => null);
                          setError(data?.error ?? "failed_to_create_set");
                          return;
                        }

                        setSetReps("");
                        setSetWeight("");
                        await refresh();
                      }}
                    >
                      {savingSetId ? "Добавляем..." : "Добавить сет"}
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
                        {ex.sets.length === 0 ? (
                          <tr>
                            <td className="px-3 py-3 text-sm text-zinc-600" colSpan={3}>
                              Пока нет сетов
                            </td>
                          </tr>
                        ) : (
                          ex.sets.map((s, idx) => (
                            <tr key={s.id} className="hover:bg-zinc-50">
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-700">
                                {idx + 1}
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                                <input
                                  value={editSetValues[s.id]?.reps ?? ""}
                                  onChange={(e) =>
                                    setEditSetValues((prev) => ({
                                      ...prev,
                                      [s.id]: { reps: e.target.value, weightKg: prev[s.id]?.weightKg ?? "" },
                                    }))
                                  }
                                  disabled={isFinished}
                                  inputMode="numeric"
                                  className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                                />
                              </td>
                              <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                                <div className="flex items-center justify-between gap-3">
                                  <input
                                    value={editSetValues[s.id]?.weightKg ?? ""}
                                    onChange={(e) =>
                                      setEditSetValues((prev) => ({
                                        ...prev,
                                        [s.id]: { reps: prev[s.id]?.reps ?? "", weightKg: e.target.value },
                                      }))
                                    }
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
                                    disabled={isFinished || Boolean(deletingSetId) || Boolean(deletingExerciseId)}
                                    onClick={async () => {
                                      const ok = window.confirm("Удалить этот сет?");
                                      if (!ok) return;

                                      setDeletingSetId(s.id);
                                      setError(null);
                                      const res = await fetch(`/api/sets/${encodeURIComponent(s.id)}`, {
                                        method: "DELETE",
                                      });
                                      setDeletingSetId(null);

                                      if (!res.ok) {
                                        const data = await res.json().catch(() => null);
                                        setError(data?.error ?? "failed_to_delete_set");
                                        return;
                                      }

                                      await refresh();
                                    }}
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
            })()
          ) : (
            <div className="mt-3 text-sm text-zinc-600">Добавь упражнение, чтобы вести подходы</div>
          )}
        </div>
      </section>
    </div>
  );
}
