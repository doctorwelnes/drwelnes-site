"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function TopNavClient() {
  const { data, status } = useSession();
  const role = (data as any)?.role as string | undefined;

  const isAuthed = status === "authenticated";

  return (
    <nav className="flex flex-wrap items-center gap-2">
      <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/">
        Главная
      </Link>

      {isAuthed ? (
        <>
          {role === "ADMIN" ? (
            <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/admin/invites">
              Инвайты
            </Link>
          ) : (
            <>
              <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/dashboard">
                Кабинет
              </Link>
              <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/workouts">
                Тренировки
              </Link>
              <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/templates">
                Шаблоны
              </Link>
              <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/measurements">
                Замеры
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Выйти
          </button>
        </>
      ) : (
        <>
          <Link className="rounded-md px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100" href="/invite">
            Регистрация
          </Link>
          <Link className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50" href="/login">
            Войти
          </Link>
        </>
      )}
    </nav>
  );
}
