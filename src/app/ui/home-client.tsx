"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function HomeClient() {
  const { data, status } = useSession();

  const email = data?.user?.email ?? null;
  const role = (data as any)?.role ?? null;

  return (
    <div>
      <div className="mb-4 rounded-md bg-zinc-50 p-4">
        <div className="text-sm text-zinc-600">Статус сессии</div>
        <div className="mt-1 font-medium">
          {status === "loading" ? "Загрузка..." : status}
        </div>
        <div className="mt-2 text-sm">
          <div>
            <span className="text-zinc-600">Email:</span> {email ?? "—"}
          </div>
          <div>
            <span className="text-zinc-600">Role:</span> {role ?? "—"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
          href="/invite"
        >
          Регистрация по инвайту
        </a>
        <a
          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
          href="/login"
        >
          Вход
        </a>
        <button
          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={() => signIn(undefined, { callbackUrl: "/" })}
        >
          signIn()
        </button>
        <button
          className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          signOut()
        </button>
      </div>

      <div className="mt-6 text-sm text-zinc-600">
        Чтобы протестировать регистрацию: создай инвайт в БД и перейди на /invite.
      </div>
    </div>
  );
}
