"use client";

import { useEffect, useMemo, useState } from "react";

type InviteDto = {
  id: string;
  code: string;
  role: "ADMIN" | "CLIENT";
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  usedByUserId: string | null;
};

export default function InvitesClient() {
  const [items, setItems] = useState<InviteDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expiresDays, setExpiresDays] = useState<string>("");

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/invites", { cache: "no-store" });
    setLoading(false);
    if (!res.ok) {
      setError("failed_to_load");
      return;
    }
    const data = (await res.json()) as { invites: InviteDto[] };
    setItems(data.invites);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Истекает через (дней)</div>
            <input
              value={expiresDays}
              onChange={(e) => setExpiresDays(e.target.value)}
              placeholder="например 7"
              className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm sm:w-56"
            />
          </label>

          <button
            type="button"
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            onClick={async () => {
              setError(null);
              const res = await fetch("/api/admin/invites", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ expiresDays: expiresDays ? Number(expiresDays) : null }),
              });
              if (!res.ok) {
                setError("failed_to_create");
                return;
              }
              setExpiresDays("");
              await refresh();
            }}
          >
            Создать инвайт
          </button>
        </div>

        <button
          type="button"
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
          onClick={refresh}
        >
          Обновить
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          Ошибка: {error}
        </div>
      ) : null}

      {loading ? <div className="text-sm text-zinc-600">Загрузка...</div> : null}

      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Код
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Ссылка
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Статус
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Создан
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-zinc-600">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {items.map((i) => {
              const link = origin ? `${origin}/invite?code=${encodeURIComponent(i.code)}` : "";
              const isUsed = Boolean(i.usedAt || i.usedByUserId);
              const isExpired = Boolean(i.expiresAt && new Date(i.expiresAt).getTime() < Date.now());
              const status = isUsed ? "использован" : isExpired ? "истёк" : "активен";

              return (
                <tr key={i.id} className="hover:bg-zinc-50">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-sm text-zinc-900">
                    {i.code}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    {link ? (
                      <div className="flex min-w-[420px] items-center gap-2">
                        <a className="truncate" href={link} target="_blank" rel="noreferrer">
                          {link}
                        </a>
                        <button
                          type="button"
                          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                          onClick={async () => {
                            await navigator.clipboard.writeText(link);
                          }}
                        >
                          Копировать
                        </button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm">
                    <span
                      className={
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium " +
                        (status === "активен"
                          ? "bg-emerald-50 text-emerald-800"
                          : status === "использован"
                            ? "bg-blue-50 text-blue-800"
                            : "bg-zinc-100 text-zinc-700")
                      }
                    >
                      {status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-zinc-700">
                    {new Date(i.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isExpired}
                        className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
                        onClick={async () => {
                          setError(null);
                          const res = await fetch(`/api/admin/invites/${i.id}/revoke`, {
                            method: "POST",
                          });
                          if (!res.ok) {
                            setError("failed_to_revoke");
                            return;
                          }
                          await refresh();
                        }}
                      >
                        Отозвать
                      </button>

                      <button
                        type="button"
                        className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-900 shadow-sm hover:bg-rose-100"
                        onClick={async () => {
                          setError(null);
                          const res = await fetch(`/api/admin/invites/${i.id}`, { method: "DELETE" });
                          if (!res.ok) {
                            setError("failed_to_delete");
                            return;
                          }
                          await refresh();
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
