"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const LINKS = [
  { href: "/", label: "Главная" },
  { href: "/recipes", label: "Рецепты" },
  { href: "/exercises", label: "Упражнения" },
  { href: "/theory", label: "Теория" },
  { href: "/calculators", label: "Калькуляторы" },
];

export default function TopNavClient() {
  const { data, status } = useSession();
  const pathname = usePathname();

  const isAuthed = status === "authenticated";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <nav className="flex flex-wrap items-center justify-end gap-1.5" aria-label="Навигация">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 text-[15px] transition-all rounded-xl ${
            isActive(link.href)
              ? "bg-gradient-to-br from-zinc-900/10 to-zinc-900/5 border border-zinc-900/15 shadow-sm font-bold"
              : "hover:bg-zinc-900/5 font-medium"
          }`}
        >
          {link.label}
        </Link>
      ))}

      {isAuthed ? (
        <button
          type="button"
          className="btn btn--secondary btn--ghost ml-2 px-3 py-1.5 text-sm"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Выйти
        </button>
      ) : (
        <Link
          className="btn btn--secondary ml-2 px-3 py-1.5 text-sm"
          href="/login"
        >
          Войти
        </Link>
      )}
    </nav>
  );
}
