"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, User, Mail, Lock, Key, Loader2, Sparkles } from "lucide-react";

export default function InviteClient() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setCode(codeFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code, name, email, password }),
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
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-[#f95700]/10 blur-[120px] rounded-full -z-10" />

      <section className="w-full max-w-[480px] animate-in fade-in zoom-in-95 duration-500 px-4">
        <div className="bg-[#13151a]/60 backdrop-blur-2xl p-8 md:p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Top accent line */}
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
                    Доступ по инвайт-коду
                  </p>
                </div>
              </div>
            </div>

            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                    Инвайт-код
                  </label>
                  <div className="relative group">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#f95700] transition-colors" />
                    <input
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="XXXX-XXXX"
                      className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-[#f95700]/30 focus:ring-4 focus:ring-[#f95700]/5 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                      Ваше имя
                    </label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#f95700] transition-colors" />
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Александр"
                        className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-[#f95700]/30 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-4">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#f95700] transition-colors" />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mail@site.ru"
                        className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-[#f95700]/30 transition-all shadow-inner"
                      />
                    </div>
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
                      <span>Обработка...</span>
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
                Dr.Welnes — Science based transformation
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
