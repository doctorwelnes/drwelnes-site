"use client";

import { useEffect, useMemo, useState } from "react";

type WorkoutDto = {
  id: string;
  title: string;
  startedAt: string;
  endedAt: string | null;
  rpe: number | null;
  note: string | null;
  createdAt: string;
};

function humanizeError(code: string) {
  switch (code) {
    case "failed_to_load":
      return "Не удалось загрузить тренировки";
    case "failed_to_create":
      return "Не удалось создать тренировку";
    case "title_required":
      return "Укажи название тренировки";
    case "unauthorized":
      return "Нужно войти в аккаунт";
    default:
      return `Ошибка: ${code}`;
  }
}

function toInputDateTimeLocal(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate()) +
    "T" +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export default function WorkoutsClient() {
  const [items, setItems] = useState<WorkoutDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [startedAt, setStartedAt] = useState(() => toInputDateTimeLocal(new Date()));

  const canCreate = useMemo(() => title.trim().length > 0 && !saving, [title, saving]);

  async function refresh() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/workouts", { cache: "no-store" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "failed_to_load");
      return;
    }

    const data = (await res.json()) as { workouts: WorkoutDto[] };
    setItems(data.workouts);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Новая тренировка</div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-zinc-700">Название</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Ноги / Спина / Full Body"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Дата/время</div>
            <input
              type="datetime-local"
              value={startedAt}
              onChange={(e) => setStartedAt(e.target.value)}
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
              const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ title, startedAt: startedAt ? new Date(startedAt).toISOString() : null }),
              });
              setSaving(false);

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "failed_to_create");
                return;
              }

              setTitle("");
              await refresh();
            }}
          >
            {saving ? "Создаём..." : "Создать"}
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
            <div className="text-sm font-semibold text-zinc-900">Последние тренировки</div>
            <div className="mt-1 text-sm text-zinc-600">Пока без упражнений — добавим следующим шагом</div>
          </div>
          {loading ? <div className="text-sm text-zinc-600">Загрузка...</div> : null}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Дата
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Название
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-sm text-zinc-600" colSpan={2}>
                    Пока нет тренировок
                  </td>
                </tr>
              ) : (
                items.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-700">
                      {new Date(w.startedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-sm font-medium">
                      <a className="text-zinc-900" href={`/workouts/${encodeURIComponent(w.id)}`}>
                        {w.title}
                      </a>
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
