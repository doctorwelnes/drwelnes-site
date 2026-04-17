"use client";

import Link from "next/link";
import { Lock, UserPlus } from "lucide-react";

interface ContentGateProps {
  /** Total items available */
  total: number;
  /** How many free items to show (default 3) */
  freeLimit?: number;
  /** Label for the section, e.g. "рецептов", "калькуляторов" */
  sectionLabel: string;
}

export default function ContentGate({ total, freeLimit = 3, sectionLabel }: ContentGateProps) {
  const locked = total - freeLimit;
  if (locked <= 0) return null;

  return (
    <div className="relative mt-4 rounded-2xl border border-orange-500/20 bg-linear-to-b from-orange-500/10 to-transparent p-6 sm:p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-orange-500" />
        </div>
      </div>
      <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
        Ещё {locked} {sectionLabel}
      </h3>
      <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
        Войдите или зарегистрируйтесь, чтобы получить полный доступ ко всему контенту.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/login?next=/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-orange-400"
        >
          <UserPlus className="h-4 w-4" />
          Войти
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10"
        >
          Регистрация
        </Link>
      </div>
    </div>
  );
}
