"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  ChevronRight,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    } catch (err) {
      // Silent fail for clipboard error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      window.location.href = "/admin";
      return;
    }

    window.location.href = next || "/dashboard";
  };

  return (
    <div className="flex items-center justify-center py-10">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-orange-500/10 blur-[120px] rounded-full -z-10" />

      <section className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-[#13151a]/60 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
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
                    Авторизация в системе
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="example@mail.com"
                    className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-inner"
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
                  {/* Email row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                      <Mail className="w-3 h-3 text-zinc-600" />
                      <span>test@test.com</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("test@test.com", "email")}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-orange-500/20 text-zinc-500 hover:text-orange-500 transition-all"
                      title="Копировать email"
                    >
                      {copiedField === "email" ? (
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
                  href="/invite"
                  className="text-orange-500 hover:text-orange-400 underline underline-offset-4 transition-colors"
                >
                  Регистрация по инвайту
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
