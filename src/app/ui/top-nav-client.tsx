"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, User } from "lucide-react";
import { useState, useEffect } from "react";

const LINKS = [
  { href: "/", label: "Главная" },
  { href: "/about", label: "О проекте" },
  { href: "/recipes", label: "Рецепты" },
  { href: "/exercises", label: "Упражнения" },
  { href: "/theory", label: "Теория" },
  { href: "/calculators", label: "Калькуляторы" },
];

export default function TopNavClient({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const isAuthed = !!session?.user;
  const isDashboard = pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
  const showCabinet = isAuthed || isDashboard; // Fallback для кабинета

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  // Показываем плейсхолдер до монтирования
  if (!mounted) {
    return (
      <nav className="flex items-center justify-end gap-2 min-h-[40px]" aria-label="Навигация">
        {LINKS.map((link) => (
          <div
            key={link.href}
            className="px-4 py-2 text-[14px] rounded-xl min-h-[36px] flex items-center justify-center text-zinc-400 font-bold"
          >
            {link.label}
          </div>
        ))}
        <div className="w-px h-6 bg-white/10 mx-3 hidden sm:block" />
        <div className="p-2.5 rounded-xl bg-white/5 min-w-[40px] min-h-[40px]" />
        <div className="px-4 py-2 rounded-xl min-w-[100px] min-h-[36px] bg-white/5" />
      </nav>
    );
  }

  return (
    <nav
      className="flex items-center justify-end gap-2 min-h-[40px]"
      style={{ contain: "layout" }}
      aria-label="Навигация"
      suppressHydrationWarning
    >
      {LINKS.map((link) => {
        const active = isActive(link.href);
        const isAbout = link.href === "/about";

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`px-4 py-2 text-[14px] rounded-xl relative min-h-[36px] flex items-center justify-center shrink-0 ${
              active
                ? isAbout
                  ? "bg-[#f95700] text-black font-extrabold shadow-[0_0_25px_rgba(249,87,0,0.5)]"
                  : "bg-white text-black font-black shadow-xl"
                : isAbout
                  ? "text-[#f95700] font-black border border-[#f95700]/20"
                  : "text-zinc-400 font-bold"
            }`}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="w-px h-6 bg-white/10 mx-3 hidden sm:block" />

      <button
        type="button"
        onClick={() => {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
        }}
        className="p-2.5 rounded-xl bg-white/5 text-zinc-400 flex items-center justify-center mr-2 ring-1 ring-white/10 shrink-0"
        title="Поиск (Cmd+K)"
      >
        <Search className="w-4 h-4" />
      </button>

      {showCabinet ? (
        <Link
          href="/dashboard"
          onClick={onLinkClick}
          className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center gap-2 min-w-[100px] min-h-[36px] shrink-0"
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Кабинет</span>
        </Link>
      ) : (
        <Link
          className="px-4 py-2 rounded-xl bg-white text-black text-sm font-black tracking-widest min-w-[100px] min-h-[36px] flex items-center justify-center shrink-0"
          href="/login"
          onClick={onLinkClick}
        >
          <span>войти</span>
        </Link>
      )}
    </nav>
  );
}
