"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="mx-auto max-w-md">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Вход</h1>
        <p className="mt-1 text-sm text-zinc-600">Войти по email и паролю</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setLoading(true);
            const res = await signIn("credentials", {
              email,
              password,
              redirect: false,
            });
            setLoading(false);
            if (!res || res.error) {
              setError("Неверный логин или пароль");
              return;
            }

            const next = new URLSearchParams(window.location.search).get("next");
            const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
            const sessionJson = await sessionRes.json().catch(() => null);
            const role = sessionJson?.role;

            if (role === "ADMIN") {
              window.location.href = "/admin/invites";
              return;
            }

            window.location.href = next || "/dashboard";
          }}
        >
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
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
          >
            {loading ? "Входим..." : "Войти"}
          </button>

          <div className="text-center text-sm text-zinc-600">
            Нет аккаунта? <a href="/invite">Регистрация по инвайту</a>
          </div>
        </form>
      </div>
    </main>
  );
}
