"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ChevronRight, Lock, Loader2, ShieldCheck, Eye, EyeOff, Copy, Check } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) return "";

    let cleanDigits = digits;
    if (!cleanDigits.startsWith("7")) {
      cleanDigits = `7${cleanDigits}`;
    }

    cleanDigits = cleanDigits.slice(0, 11);

    if (cleanDigits.length === 1) {
      return `+${cleanDigits}`;
    }

    if (cleanDigits.length <= 4) {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1)}`;
    }

    if (cleanDigits.length <= 7) {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4)}`;
    }

    if (cleanDigits.length <= 9) {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7)}`;
    }

    return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7, 9)}-${cleanDigits.slice(9, 11)}`;
  };

  const formatIdentifier = (value: string) => {
    const cleanValue = value.replace(/[^\d+a-zA-Z_@+]/g, "");

    if (/^[a-zA-Z_@]/.test(cleanValue) && !/^\+?\d/.test(cleanValue)) {
      return cleanValue.startsWith("@") ? cleanValue : `@${cleanValue}`;
    }

    if (/^\+?\d/.test(cleanValue)) {
      return formatPhoneNumber(value);
    }

    return value;
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(formatIdentifier(e.target.value));
  };

  const identifierMaxLength = identifier.startsWith("@") ? 32 : 18;

  const handleCopy = async (text: string, field: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
        return;
      }

      // Fallback for older browsers and mobile
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }
    } catch {
      // Silent fail for clipboard error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("Неверный логин или пароль");
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    let sessionJson: { user?: { role?: string } } | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        sessionJson = await sessionRes.json().catch(() => null);
        if (sessionJson?.user?.role) break;
      } catch {
        // Retry after a short pause so cookies can settle on slower mobile browsers.
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    const role = sessionJson?.user?.role;

    if (role === "ADMIN") {
      window.location.href = "/admin";
      return;
    }

    window.location.href = next || "/dashboard";
  };

  return (
    <div className="flex min-h-dvh items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-10">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-orange-500/10 blur-[120px] rounded-full -z-10" />

      <section className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500 pt-4 sm:pt-0">
        <div className="bg-[#13151a]/60 backdrop-blur-2xl p-6 sm:p-8 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />

          <div className="space-y-8">
            <div className="space-y-2">
              <Link href="/" className="inline-flex items-center gap-2 group mb-4">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-orange-500/30 transition-all">
                  <ChevronRight className="w-3 h-3 rotate-180 text-orange-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
                  Назад
                </span>
              </Link>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <ShieldCheck className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                    Вход
                  </h1>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                    Авторизация по Telegram или телефону
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-black/20 text-orange-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-orange-300">
                    Для записи на тренировки и полного функционала приложения нужен аккаунт
                  </p>
                  <p className="mt-1 text-sm text-zinc-200 leading-snug">
                    Войдите или зарегистрируйтесь, чтобы записываться на тренировки, видеть свои
                    слоты и пользоваться всем функционалом приложения.
                  </p>
                  <Link
                    href="/register"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10 sm:w-auto"
                  >
                    Зарегистрироваться / войти
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                  Telegram / Телефон
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    maxLength={identifierMaxLength}
                    required
                    placeholder="@username или +7 999 123-45-67"
                    className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 px-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                  Пароль
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-12 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10 transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                className="w-full relative group overflow-hidden bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:hover:bg-orange-500 text-black font-black uppercase tracking-widest text-xs py-5 rounded-[24px] transition-all shadow-[0_20px_40px_rgba(249,115,22,0.2)] active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Входим...</span>
                  </>
                ) : (
                  <>
                    <span>Войти в Dr.Welnes</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-white/5 text-center space-y-4">
              {/* Test Account Info — only visible in development */}
              {process.env.NODE_ENV !== "production" && (
                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                    Тестовый аккаунт
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                        <ShieldCheck className="w-3 h-3 text-zinc-600" />
                        <span>@testuser</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("@testuser", "identifier")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-zinc-500 hover:text-orange-500 transition-all"
                        title="Копировать Telegram"
                      >
                        {copiedField === "identifier" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    {/* Password row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                        <Lock className="w-3 h-3 text-zinc-600" />
                        <span>test123</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("test123", "password")}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-zinc-500 hover:text-orange-500 transition-all"
                        title="Копировать пароль"
                      >
                        {copiedField === "password" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                Нет аккаунта?{" "}
                <Link
                  href="/register"
                  className="text-orange-500 hover:text-orange-400 underline underline-offset-4 transition-colors"
                >
                  Регистрация
                </Link>
              </p>

              <div className="flex items-center justify-center gap-1.5 opacity-20 hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">
                  Secure Environment
                </span>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
