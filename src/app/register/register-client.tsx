"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, User, Lock, Loader2, Sparkles, AtSign, Phone } from "lucide-react";

type RegisterMethod = "telegram" | "phone";

const METHOD_CONFIG: Record<
  RegisterMethod,
  { label: string; placeholder: string; icon: typeof AtSign }
> = {
  telegram: { label: "Телега", placeholder: "@username", icon: AtSign },
  phone: { label: "Телефон", placeholder: "+7 (999) 123-45-67", icon: Phone },
};

export default function RegisterClient() {
  const [method, setMethod] = useState<RegisterMethod>("telegram");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const methodConfig = useMemo(() => METHOD_CONFIG[method], [method]);
  const IdentifierIcon = methodConfig.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        method,
        identifier,
        password,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Произошла ошибка при регистрации");
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-[#f95700]/10 blur-[120px] rounded-full -z-10" />

      <section className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500 px-4">
        <div className="bg-[#13151a]/60 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f95700] to-transparent opacity-50" />

          <div className="space-y-8">
            <div className="space-y-2">
              <Link href="/login" className="inline-flex items-center gap-2 group mb-4">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-[#f95700]/30 transition-all">
                  <ChevronRight className="w-3 h-3 rotate-180 text-[#f95700]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
                  К авторизации
                </span>
              </Link>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-[#f95700]/10 border border-[#f95700]/20">
                  <Sparkles className="w-6 h-6 text-[#f95700]" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Регистрация
                  </h1>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                    Выберите способ регистрации
                  </p>
                </div>
              </div>
            </div>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                    Ваше имя
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#f95700] transition-colors" />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Александр"
                      className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-[#f95700]/30 focus:ring-4 focus:ring-[#f95700]/5 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                    Способ регистрации
                  </label>
                  <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-[#0c0d10]/50 border border-white/5 p-2">
                    {(Object.keys(METHOD_CONFIG) as RegisterMethod[]).map((option) => {
                      const active = method === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setMethod(option);
                            setIdentifier("");
                            setError(null);
                          }}
                          className={`rounded-2xl px-3 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                            active
                              ? "bg-[#f95700] text-black shadow-[0_10px_20px_rgba(249,87,0,0.25)]"
                              : "text-zinc-500 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {METHOD_CONFIG[option].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                    {methodConfig.label}
                  </label>
                  <div className="relative group">
                    <IdentifierIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#f95700] transition-colors" />
                    <input
                      required
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={methodConfig.placeholder}
                      className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-[#f95700]/30 focus:ring-4 focus:ring-[#f95700]/5 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                    Пароль
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#f95700] transition-colors" />
                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-[#f95700]/30 focus:ring-4 focus:ring-[#f95700]/5 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-500 text-xs font-bold text-center animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-[#f95700] hover:bg-orange-400 disabled:opacity-50 disabled:hover:bg-[#f95700] text-black font-black uppercase tracking-widest text-xs py-5 rounded-[24px] transition-all shadow-[0_20px_40px_rgba(249,87,0,0.2)] active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Создаём...</span>
                    </>
                  ) : (
                    <>
                      <span>Создать аккаунт</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-[#f95700]/10 rounded-full flex items-center justify-center mx-auto border border-[#f95700]/20">
                  <Sparkles className="w-10 h-10 text-[#f95700]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    Успешно!
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium">
                    Аккаунт создан. Теперь вы можете войти, используя свои данные.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#f95700] font-black uppercase tracking-widest text-xs hover:text-orange-400 transition-colors"
                >
                  Перейти ко входу
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            <div className="pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Dr.Welnes — регистрация через Telegram или телефон
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
