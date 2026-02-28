"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function TopNavClient() {
  const { data, status } = useSession();
  const role = (data as { role?: string } | null)?.role;
  const pathname = usePathname();

  const isAuthed = status === "authenticated";

  const linkBase = "rounded-md px-2 py-1 text-sm transition-colors";
  const linkInactive = "text-zinc-700 hover:bg-zinc-100";
  const linkActive = "bg-zinc-900 text-white";

  const navLinkClassName = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return `${linkBase} ${isActive ? linkActive : linkInactive}`;
  };

  return (
    <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2" aria-label="Навигация">
      <Link className={navLinkClassName("/")} href="/" aria-current={pathname === "/" ? "page" : undefined}>
        Главная
      </Link>

      {isAuthed ? (
        <>
          {role === "ADMIN" ? (
            <Link
              className={navLinkClassName("/admin/invites")}
              href="/admin/invites"
              aria-current={pathname?.startsWith("/admin/invites") ? "page" : undefined}
            >
              Инвайты
            </Link>
          ) : (
            <>
              <Link
                className={navLinkClassName("/dashboard")}
                href="/dashboard"
                aria-current={pathname?.startsWith("/dashboard") ? "page" : undefined}
              >
                Кабинет
              </Link>
              <Link
                className={navLinkClassName("/workouts")}
                href="/workouts"
                aria-current={pathname?.startsWith("/workouts") ? "page" : undefined}
              >
                Тренировки
              </Link>
              <Link
                className={navLinkClassName("/templates")}
                href="/templates"
                aria-current={pathname?.startsWith("/templates") ? "page" : undefined}
              >
                Шаблоны
              </Link>
              <Link
                className={navLinkClassName("/measurements")}
                href="/measurements"
                aria-current={pathname?.startsWith("/measurements") ? "page" : undefined}
              >
                Замеры
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Выйти
          </button>
        </>
      ) : (
        <>
          <Link className={navLinkClassName("/invite")} href="/invite" aria-current={pathname?.startsWith("/invite") ? "page" : undefined}>
            Регистрация
          </Link>
          <Link
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50"
            href="/login"
            aria-current={pathname?.startsWith("/login") ? "page" : undefined}
          >
            Войти
          </Link>
        </>
      )}
    </nav>
  );
}
