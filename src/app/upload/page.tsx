"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const [cmsUser, setCmsUser] = useState<{ token: string; backendName: string } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Ищем токен от админки (Decap CMS) при загрузке страницы
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("decap-cms-user");
      if (userStr) {
        setCmsUser(JSON.parse(userStr));
      }
    } catch (e) {
      console.error("Failed to parse CMS user", e);
    }
  }, []);

  const isNextAuthAdmin = (session?.user as any)?.role === "ADMIN";
  const isCmsAuth = !!cmsUser?.token;
  const isAdmin = isNextAuthAdmin || isCmsAuth;
  const isLoading = status === "loading";

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const headers: HeadersInit = {};
    if (isCmsAuth && cmsUser?.token) {
      headers["Authorization"] = `Bearer ${cmsUser.token}`;
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ошибка при загрузке");
      }

      setUrl(data.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload file";
      console.error("Upload error:", error);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(`https://drwelnes.ru${url}`);
      alert("Ссылка скопирована!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Загрузка видео
        </h1>

        {isLoading ? (
          <p className="text-xs text-gray-500 mb-6 font-mono">Проверка авторизации...</p>
        ) : isAdmin ? (
          <div className="flex items-center gap-2 mb-6 p-2 px-3 bg-white/5 rounded-full border border-white/5 w-fit">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-xs font-medium text-gray-300">
              {isCmsAuth ? "Авторизован через CMS" : `${session?.user?.email} (ADMIN)`}
            </span>
          </div>
        ) : (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️ Вы не вошли в систему (нужны права ADMIN или вход в CMS)</span>
            <button onClick={() => router.push("/login")} className="ml-auto underline font-bold">
              Войти
            </button>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Выберите файл (MP4)</label>
            <input
              type="file"
              accept="video/mp4"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm file:bg-white/10 file:border-0 file:rounded-lg file:px-4 file:py-1 file:text-white file:mr-4 hover:file:bg-white/20 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!file || uploading || !isAdmin}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {uploading ? "Загрузка..." : "Загрузить"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {error}
          </div>
        )}

        {url && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl">
              Видео успешно загружено!
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-400">Ссылка для рецепта:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://drwelnes.ru${url}`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-gray-300"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all"
                  title="Копировать"
                >
                  📋
                </button>
              </div>
            </div>

            <button
              onClick={() => window.close()}
              className="w-full text-sm text-gray-400 hover:text-white transition-all py-2"
            >
              Закрыть окно
            </button>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-300 transition-all font-medium"
          >
            ← Вернуться в админку
          </button>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
