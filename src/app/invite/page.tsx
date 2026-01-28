"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function InvitePage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-lg">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        <p className="mt-1 text-sm text-zinc-600">Создай аккаунт по инвайт-коду</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSuccess(false);
          setLoading(true);

          const res = await fetch("/api/invite", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ code, name, email, password }),
          });

          setLoading(false);

          if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(data?.error ?? "failed");
            return;
          }

          setSuccess(true);
        }}
      >
        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Инвайт-код</div>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            required
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Имя (необязательно)</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            required
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Пароль</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
            required
          />
        </label>

        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Ошибка: {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Аккаунт создан. Теперь можно <a href="/login">войти</a>.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
        >
          {loading ? "Создаём..." : "Создать аккаунт"}
        </button>
      </form>
      </div>
    </main>
  );
}
