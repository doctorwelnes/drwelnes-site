"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function HomeClient() {
  const { data, status } = useSession();

  return (
    <div className="space-y-4">
      <section className="card p-6 border-zinc-200/90 shadow-lg">
        <h1 className="m-0 text-[34px] leading-[1.15] tracking-[-0.03em] font-bold">
          Врач по реабилитации и спортивной медицине: безопасный путь к сильному и здоровому телу
        </h1>
        <p className="mt-2.5 text-muted text-base leading-[1.55] max-w-[64ch]">
          Медицина + спорт + нутрициология: персональные программы тренировок, правильная кухня и восстановление для всех
        </p>
        <div className="flex flex-wrap gap-2.5 mt-4">
          <Link href="/recipes" className="btn">
            Открыть рецепты
          </Link>
          <span className="btn btn--secondary opacity-55 cursor-not-allowed select-none">
            Открыть упражнения (в разработке)
          </span>
          <Link href="/theory" className="btn btn--secondary">
            Открыть теорию
          </Link>
          <Link href="/calculators" className="btn btn--secondary">
            Открыть калькуляторы
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/recipes" className="card p-4 hover:translate-y-[-1px] transition-transform">
          <div className="w-10 h-10 rounded-[14px] bg-ink/5 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mt-2.5 font-extrabold tracking-tight">Рецепты</div>
          <div className="mt-1.5 text-muted text-sm">Пошаговое описание и видео</div>
        </Link>

        <div className="card p-4 opacity-80">
          <div className="w-10 h-10 rounded-[14px] bg-ink/5 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 10h14l-1 10H6L5 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 14v3M15 14v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mt-2.5 font-extrabold tracking-tight">Упражнения</div>
          <div className="mt-1.5 text-muted text-sm">В разработке</div>
        </div>

        <Link href="/theory" className="card p-4 hover:translate-y-[-1px] transition-transform">
          <div className="w-10 h-10 rounded-[14px] bg-ink/5 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 8h8M8 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mt-2.5 font-extrabold tracking-tight">Теория</div>
          <div className="mt-1.5 text-muted text-sm">Сложное простым языком</div>
        </Link>

        <Link href="/calculators" className="card p-4 hover:translate-y-[-1px] transition-transform">
          <div className="w-10 h-10 rounded-[14px] bg-ink/5 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4h10a2 2 0 0 1 2-2v14H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="mt-2.5 font-extrabold tracking-tight">Калькуляторы</div>
          <div className="mt-1.5 text-muted text-sm">Расчет точного каллоража, разового максимума и т.д.</div>
        </Link>
      </section>

      <section className="card p-5 border-zinc-200/90 shadow-md">
        <h2 className="m-0 text-xl tracking-tight font-bold text-ink">О проекте</h2>
        <p className="mt-2 text-muted leading-relaxed">
          Dr.Welnes — это библиотека практичных материалов для здоровья: рецепты, упражнения и база знаний. Идея проста: меньше шума, больше пользы — и всё в одном месте.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3.5">
          <div className="border border-zinc-200/90 rounded-[16px] p-3.5 bg-white/85">
            <div className="font-bold">Миссия</div>
            <div className="mt-1.5 text-muted leading-relaxed text-[15px]">
              Сделать профессиональный подход к тренировкам, питанию и восстановлению доступным и удобным.
            </div>
          </div>
          <div className="border border-zinc-200/90 rounded-[16px] p-3.5 bg-white/85">
            <div className="font-bold">Принципы</div>
            <ul className="mt-1.5 pl-4.5 space-y-1 text-muted leading-relaxed text-[15px] list-disc">
              <li>Доказательная медицина: научно обосновано, без «чудо-методик».</li>
              <li>Чёткая структура: пошаговые планы согласно Вашим целям.</li>
              <li>Без лишней воды: только рабочие упражнения, рецепты и калькуляторы.</li>
            </ul>
          </div>
        </div>
      </section>

      {status === "authenticated" && (
        <section className="flex items-center justify-between p-4 card bg-zinc-900/5 border-zinc-900/10">
          <div className="text-sm">
            Вы вошли как <span className="font-semibold">{data.user?.email}</span>
          </div>
          <button onClick={() => signOut()} className="btn btn--secondary btn--ghost text-xs py-1.5">
            Выйти
          </button>
        </section>
      )}
    </div>
  );
}
