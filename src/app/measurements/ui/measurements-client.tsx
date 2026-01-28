"use client";

import { useEffect, useMemo, useState } from "react";

type MeasurementDto = {
  id: string;
  date: string;
  weightKg: string | number | null;
  waistCm: string | number | null;
  hipsCm: string | number | null;
  chestCm: string | number | null;
  bicepsCm: string | number | null;
  note: string | null;
};

function humanizeError(code: string) {
  switch (code) {
    case "failed_to_load":
      return "Не удалось загрузить замеры";
    case "failed_to_create":
      return "Не удалось сохранить замеры";
    case "failed_to_update":
      return "Не удалось обновить замер";
    case "failed_to_delete":
      return "Не удалось удалить замер";
    case "date_required":
      return "Укажи дату";
    case "invalid_date":
      return "Некорректная дата";
    case "already_exists_for_date":
      return "Запись на эту дату уже существует";
    case "not_found":
      return "Запись не найдена";
    case "invalid_weight":
      return "Вес должен быть числом";
    case "invalid_waist":
      return "Талия должна быть числом";
    case "invalid_hips":
      return "Бёдра должны быть числом";
    case "invalid_chest":
      return "Грудь должна быть числом";
    case "invalid_biceps":
      return "Бицепс должен быть числом";
    case "unauthorized":
      return "Нужно войти в аккаунт";
    default:
      return `Ошибка: ${code}`;
  }
}

function toInputDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function MeasurementsClient() {
  const [items, setItems] = useState<MeasurementDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editWeightKg, setEditWeightKg] = useState("");
  const [editWaistCm, setEditWaistCm] = useState("");
  const [editHipsCm, setEditHipsCm] = useState("");
  const [editChestCm, setEditChestCm] = useState("");
  const [editBicepsCm, setEditBicepsCm] = useState("");
  const [editNote, setEditNote] = useState("");

  const [date, setDate] = useState(() => toInputDate(new Date()));
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipsCm, setHipsCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [bicepsCm, setBicepsCm] = useState("");
  const [note, setNote] = useState("");

  const canSave = useMemo(() => Boolean(date) && !saving, [date, saving]);

  async function refresh() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/measurements", { cache: "no-store" });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "failed_to_load");
      return;
    }

    const data = (await res.json()) as { measurements: MeasurementDto[] };
    setItems(data.measurements);
  }

  useEffect(() => {
    refresh();
  }, []);

  const weightSeries = useMemo(() => {
    const rows = [...items]
      .filter((x) => x.weightKg !== null && x.weightKg !== undefined && x.weightKg !== "")
      .map((x) => {
        const w = typeof x.weightKg === "number" ? x.weightKg : Number(String(x.weightKg));
        return { date: new Date(x.date), weight: Number.isFinite(w) ? w : null };
      })
      .filter((x) => x.weight !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime()) as { date: Date; weight: number }[];

    return rows;
  }, [items]);

  const weightChart = useMemo(() => {
    if (weightSeries.length < 2) return null;
    const width = 760;
    const height = 160;
    const padX = 12;
    const padY = 18;

    const weights = weightSeries.map((p) => p.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const span = Math.max(0.0001, max - min);

    const xStep = (width - padX * 2) / (weightSeries.length - 1);
    const points = weightSeries
      .map((p, idx) => {
        const x = padX + idx * xStep;
        const y = height - padY - ((p.weight - min) / span) * (height - padY * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const last = weightSeries[weightSeries.length - 1];
    const first = weightSeries[0];

    return { width, height, points, min, max, first, last };
  }, [weightSeries]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">График веса</div>
            <div className="mt-1 text-sm text-zinc-600">
              {weightSeries.length === 0
                ? "Нет данных"
                : `Записей: ${weightSeries.length}`}
            </div>
          </div>

          {weightChart ? (
            <div className="text-right text-sm text-zinc-700">
              <div>
                {weightChart.first.date.toLocaleDateString()} → {weightChart.last.date.toLocaleDateString()}
              </div>
              <div className="text-xs text-zinc-600">
                {weightChart.min.toFixed(1)} кг — {weightChart.max.toFixed(1)} кг
              </div>
            </div>
          ) : null}
        </div>

        {weightChart ? (
          <div className="mt-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${weightChart.width} ${weightChart.height}`}
              className="h-40 w-full min-w-[760px]"
            >
              <rect x="0" y="0" width={weightChart.width} height={weightChart.height} fill="#fff" />
              <polyline
                points={weightChart.points}
                fill="none"
                stroke="#18181b"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <div className="mt-3 text-sm text-zinc-600">Добавь хотя бы 2 записи с весом</div>
        )}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Новая запись</div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Дата</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Вес (кг)</div>
            <input
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              inputMode="decimal"
              placeholder="например 80.5"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Талия (см)</div>
            <input
              value={waistCm}
              onChange={(e) => setWaistCm(e.target.value)}
              inputMode="decimal"
              placeholder="например 82"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Бёдра (см)</div>
            <input
              value={hipsCm}
              onChange={(e) => setHipsCm(e.target.value)}
              inputMode="decimal"
              placeholder="например 98"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Грудь (см)</div>
            <input
              value={chestCm}
              onChange={(e) => setChestCm(e.target.value)}
              inputMode="decimal"
              placeholder="например 104"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Бицепс (см)</div>
            <input
              value={bicepsCm}
              onChange={(e) => setBicepsCm(e.target.value)}
              inputMode="decimal"
              placeholder="например 36"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            />
          </label>

          <label className="block md:col-span-3">
            <div className="text-sm font-medium text-zinc-700">Заметка</div>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="например: хорошо поспал, держал питание"
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
            disabled={!canSave}
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            onClick={async () => {
              setSaving(true);
              setError(null);

              const iso = new Date(`${date}T00:00:00`).toISOString();
              const res = await fetch("/api/measurements", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  date: iso,
                  weightKg,
                  waistCm,
                  hipsCm,
                  chestCm,
                  bicepsCm,
                  note,
                }),
              });

              setSaving(false);

              if (!res.ok) {
                const data = await res.json().catch(() => null);
                setError(data?.error ?? "failed_to_create");
                return;
              }

              setWeightKg("");
              setWaistCm("");
              setHipsCm("");
              setChestCm("");
              setBicepsCm("");
              setNote("");
              await refresh();
            }}
          >
            {saving ? "Сохраняем..." : "Сохранить"}
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
            <div className="text-sm font-semibold text-zinc-900">История замеров</div>
            <div className="mt-1 text-sm text-zinc-600">Одна запись на дату (если нужно — изменим)</div>
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
                  Вес
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Талия
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Бёдра
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Грудь
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Бицепс
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Заметка
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-sm text-zinc-600" colSpan={8}>
                    Пока нет замеров
                  </td>
                </tr>
              ) : (
                items.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-50">
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-700">
                      {editingId === m.id ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-36 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        new Date(m.date).toLocaleDateString()
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                      {editingId === m.id ? (
                        <input
                          value={editWeightKg}
                          onChange={(e) => setEditWeightKg(e.target.value)}
                          inputMode="decimal"
                          className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        m.weightKg ?? "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                      {editingId === m.id ? (
                        <input
                          value={editWaistCm}
                          onChange={(e) => setEditWaistCm(e.target.value)}
                          inputMode="decimal"
                          className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        m.waistCm ?? "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                      {editingId === m.id ? (
                        <input
                          value={editHipsCm}
                          onChange={(e) => setEditHipsCm(e.target.value)}
                          inputMode="decimal"
                          className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        m.hipsCm ?? "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                      {editingId === m.id ? (
                        <input
                          value={editChestCm}
                          onChange={(e) => setEditChestCm(e.target.value)}
                          inputMode="decimal"
                          className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        m.chestCm ?? "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-900">
                      {editingId === m.id ? (
                        <input
                          value={editBicepsCm}
                          onChange={(e) => setEditBicepsCm(e.target.value)}
                          inputMode="decimal"
                          className="w-20 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        m.bicepsCm ?? "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-zinc-700">
                      {editingId === m.id ? (
                        <input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          className="w-[320px] max-w-[320px] rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
                        />
                      ) : (
                        m.note || "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {editingId === m.id ? (
                          <>
                            <button
                              type="button"
                              className="rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800"
                              disabled={saving}
                              onClick={async () => {
                                setSaving(true);
                                setError(null);

                                const iso = new Date(`${editDate}T00:00:00`).toISOString();
                                const res = await fetch(`/api/measurements/${encodeURIComponent(m.id)}`, {
                                  method: "PATCH",
                                  headers: { "content-type": "application/json" },
                                  body: JSON.stringify({
                                    date: iso,
                                    weightKg: editWeightKg,
                                    waistCm: editWaistCm,
                                    hipsCm: editHipsCm,
                                    chestCm: editChestCm,
                                    bicepsCm: editBicepsCm,
                                    note: editNote,
                                  }),
                                });

                                setSaving(false);

                                if (!res.ok) {
                                  const data = await res.json().catch(() => null);
                                  setError(data?.error ?? "failed_to_update");
                                  return;
                                }

                                setEditingId(null);
                                await refresh();
                              }}
                            >
                              {saving ? "..." : "Сохранить"}
                            </button>

                            <button
                              type="button"
                              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
                              disabled={saving}
                              onClick={() => {
                                setEditingId(null);
                              }}
                            >
                              Отмена
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
                              onClick={() => {
                                setEditingId(m.id);
                                setEditDate(toInputDate(new Date(m.date)));
                                setEditWeightKg(m.weightKg === null || m.weightKg === undefined ? "" : String(m.weightKg));
                                setEditWaistCm(m.waistCm === null || m.waistCm === undefined ? "" : String(m.waistCm));
                                setEditHipsCm(m.hipsCm === null || m.hipsCm === undefined ? "" : String(m.hipsCm));
                                setEditChestCm(m.chestCm === null || m.chestCm === undefined ? "" : String(m.chestCm));
                                setEditBicepsCm(m.bicepsCm === null || m.bicepsCm === undefined ? "" : String(m.bicepsCm));
                                setEditNote(m.note || "");
                              }}
                            >
                              Изменить
                            </button>

                            <button
                              type="button"
                              className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-900 shadow-sm hover:bg-rose-100"
                              disabled={saving}
                              onClick={async () => {
                                const ok = window.confirm("Удалить запись замеров?");
                                if (!ok) return;
                                setSaving(true);
                                setError(null);

                                const res = await fetch(`/api/measurements/${encodeURIComponent(m.id)}`, {
                                  method: "DELETE",
                                });
                                setSaving(false);

                                if (!res.ok) {
                                  const data = await res.json().catch(() => null);
                                  setError(data?.error ?? "failed_to_delete");
                                  return;
                                }

                                await refresh();
                              }}
                            >
                              Удалить
                            </button>
                          </>
                        )}
                      </div>
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
