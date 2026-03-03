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
  const [videos, setVideos] = useState<
    { name: string; url: string; size: number; mtime: string }[]
  >([]);
  const router = useRouter();

  const isNextAuthAdmin = (session?.user as any)?.role === "ADMIN";
  const isCmsAuth = !!cmsUser?.token;
  const isAdmin = isNextAuthAdmin || isCmsAuth;
  const isLoading = status === "loading";

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

  // Загружаем список видеороликов при получении прав админа
  useEffect(() => {
    if (!isAdmin) return;

    async function fetchVideos() {
      try {
        const headers: HeadersInit = {};
        if (isCmsAuth && cmsUser?.token) {
          headers["Authorization"] = `Bearer ${cmsUser.token}`;
        }

        const res = await fetch("/api/upload", { headers });
        if (res.ok) {
          const data = await res.json();
          setVideos(data.files || []);
        }
      } catch (e) {
        console.error("Failed to fetch videos", e);
      }
    }

    fetchVideos();
  }, [isAdmin, isCmsAuth, cmsUser]);

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

      // Добавляем новое видео в начало списка (галереи)
      setVideos((prev) => [
        { name: file.name, url: data.url, size: file.size, mtime: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload file";
      console.error("Upload error:", err);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (textToCopy: string) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      alert("Ссылка скопирована!");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-20">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 mt-10">
        {/* Левая колонка - Загрузка */}
        <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl h-fit">
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

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Выберите файл (MP4)</label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm file:bg-white/10 file:border-0 file:rounded-lg file:px-4 file:py-1 file:text-white file:mr-4 hover:file:bg-white/20 transition-all cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!file || uploading || !isAdmin}
              className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            >
              {uploading ? "Загрузка..." : "Загрузить видео"}
            </button>
          </form>

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
                    onClick={() => copyToClipboard(`https://drwelnes.ru${url}`)}
                    className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-all"
                    title="Копировать"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-gray-500 hover:text-gray-300 transition-all font-medium flex justify-center items-center w-full gap-2"
            >
              ← Вернуться назад
            </button>
          </div>
        </div>

        {/* Правая колонка - Галерея */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-200 px-2">Загруженные видео</h2>

          {!isAdmin ? (
            <div className="glass-card p-8 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
              Галерея доступна только администраторам.
            </div>
          ) : videos.length === 0 ? (
            <div className="glass-card p-8 rounded-3xl border border-white/5 text-center text-gray-500 text-sm">
              Видео пока не загружены.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos.map((v) => (
                <div
                  key={v.url}
                  className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-white/20 transition-all"
                >
                  <div className="bg-black/40 rounded-xl aspect-video relative flex items-center justify-center overflow-hidden border border-white/5">
                    <span className="text-4xl opacity-50">🎥</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                      <span className="text-xs font-mono text-gray-300 truncate w-full">
                        {v.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">
                        {(v.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(v.mtime).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`https://drwelnes.ru${v.url}`)}
                      className="text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all text-white font-medium"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
      `}</style>
    </div>
  );
}
