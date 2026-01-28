"use client";

import { useEffect, useMemo, useState } from "react";

type TemplateExerciseDto = {
  id: string;
  exerciseName: string;
  position: number | null;
};

type TemplateDto = {
  id: string;
  title: string;
  note: string | null;
  createdAt: string;
  exercises: TemplateExerciseDto[];
};

function humanizeError(code: string) {
  switch (code) {
    case "failed_to_load":
      return "Не удалось загрузить шаблоны";
    case "failed_to_create":
      return "Не удалось создать шаблон";
    case "failed_to_start":
      return "Не удалось создать тренировку по шаблону";
    case "title_required":
      return "Укажи название шаблона";
    case "exercises_required":
      return "Добавь хотя бы одно упражнение";
    case "unauthorized":
      return "Нужно войти в аккаунт";
    default:
      return `Ошибка: ${code}`;
  }
}

export default function TemplatesClient() {
  const [items, setItems] = useState<TemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [exerciseText, setExerciseText] = useState("");

  const canCreate = useMemo(() => title.trim().length > 0 && !saving, [title, saving]);

  async function refresh() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/templates", { cache: "no-store" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "failed_to_load");
      return;
    }

    const data = (await res.json()) as { templates: TemplateDto[] };
    setItems(data.templates);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Новый шаблон</div>

        <div className="mt-3 grid gap-3">
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Название</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Ноги / Спина / Full Body"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Заметка (необязательно)</div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Например: разминка 10 минут"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Упражнения (по одному в строке)</div>
            <textarea
              value={exerciseText}
              onChange={(e) => setExerciseText(e.target.value)}
              rows={6}
              placeholder={`Жим лёжа\nТяга верхнего блока\nПрисед`}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            {humanizeError(error)}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canCreate}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            onClick={async () => {
              setSaving(true);
              setError(null);

              const exercises = exerciseText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);

              const res = await fetch("/api/templates", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ title, note, exercises }),
              });

              setSaving(false);

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "failed_to_create");
                return;
              }

              setTitle("");
              setNote("");
              setExerciseText("");
              await refresh();
            }}
          >
            {saving ? "Создаём..." : "Создать шаблон"}
          </button>

          <button
            type="button"
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
            onClick={refresh}
          >
            Обновить
          </button>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">Мои шаблоны</div>
            <div className="mt-1 text-sm text-zinc-600">Старт создаст новую тренировку и добавит упражнения</div>
          </div>
          {loading ? <div className="text-sm text-zinc-600">Загрузка...</div> : null}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Шаблон
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Упражнения
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-sm text-zinc-600" colSpan={3}>
                    Пока нет шаблонов
                  </td>
                </tr>
              ) : (
                items.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50">
                    <td className="px-3 py-2 text-sm">
                      <div className="font-medium text-zinc-900">{t.title}</div>
                      {t.note ? <div className="mt-1 text-sm text-zinc-600">{t.note}</div> : null}
                      <div className="mt-1 text-xs text-zinc-500">{new Date(t.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-3 py-2 text-sm text-zinc-700">
                      <div className="min-w-[320px]">
                        {t.exercises.map((e) => e.exerciseName).join(", ")}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm">
                      <button
                        type="button"
                        className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
                        disabled={Boolean(startingId)}
                        onClick={async () => {
                          setStartingId(t.id);
                          setError(null);

                          const res = await fetch(`/api/templates/${encodeURIComponent(t.id)}/start`, {
                            method: "POST",
                          });

                          setStartingId(null);

                          if (!res.ok) {
                            const data = await res.json().catch(() => null);
                            setError(data?.error ?? "failed_to_start");
                            return;
                          }

                          const data = (await res.json()) as { workout: { id: string } };
                          window.location.href = `/workouts/${encodeURIComponent(data.workout.id)}`;
                        }}
                      >
                        {startingId === t.id ? "..." : "Старт"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
