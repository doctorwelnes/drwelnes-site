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

  const isNextAuthAdmin = session?.user?.role === "ADMIN";
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
      // Silent fail for CMS user parse
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
        // Silent fail for fetching videos
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
    <div className="min-h-screen bg-[#f3f5f8] text-[#0f172a] font-sans p-4 pb-20">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 mt-10">
        {/* Левая колонка - Форма загрузки */}
        <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm h-fit flex flex-col transition-all hover:shadow-md">
          <h1 className="text-2xl font-extrabold mb-2 text-[#0f172a] tracking-tight">
            Загрузка видео
          </h1>

          {isLoading ? (
            <p className="text-xs text-[#64748b] mb-6 font-mono">Проверка прав...</p>
          ) : isAdmin ? (
            <div className="flex items-center gap-2 mb-6 p-2 px-3 bg-[#f3f5f8] rounded-full border border-[#e2e8f0] w-fit shadow-inner">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
              <span className="text-xs font-medium text-[#64748b]">
                {isCmsAuth ? "CMS Доступ" : `${session?.user?.email}`}
              </span>
            </div>
          ) : (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️ Нужны права администратора.</span>
              <button onClick={() => router.push("/login")} className="ml-auto underline font-bold">
                Войти
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#64748b] tracking-wide">
                Выберите файл (MP4)
              </label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full bg-[#f3f5f8] border border-[#e2e8f0] rounded-xl p-3 text-sm text-[#0f172a] file:bg-white file:border file:border-[#e2e8f0] file:shadow-sm file:rounded-lg file:px-4 file:py-1 file:text-[#0f172a] file:font-semibold file:mr-4 hover:file:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={!file || uploading || !isAdmin}
              className="w-full bg-[#f59e0b] text-white font-bold py-3 rounded-full hover:bg-[#d97706] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_16px_rgba(245,158,11,0.4)] hover:-translate-y-0.5"
            >
              {uploading ? "Идет загрузка..." : "Загрузить видео"}
            </button>
          </form>

          {url && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium text-sm rounded-xl">
                Видео успешно загружено! 🎉
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                  Ссылка на файл:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`https://drwelnes.ru${url}`}
                    className="flex-1 bg-[#f3f5f8] border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#64748b] font-mono outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(`https://drwelnes.ru${url}`)}
                    className="bg-white hover:bg-gray-50 border border-[#e2e8f0] p-3 rounded-xl transition-all shadow-sm text-lg flex items-center justify-center"
                    title="Копировать"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-[#e2e8f0] text-center">
            <button
              onClick={() => router.back()}
              className="text-sm text-[#64748b] hover:text-[#0f172a] transition-all font-semibold flex justify-center items-center w-full gap-2 py-2"
            >
              ← Вернуться в CMS
            </button>
          </div>
        </div>

        {/* Правая колонка - Галерея */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-[#0f172a] mb-6 px-2">Галерея видео</h2>

          {!isAdmin ? (
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center text-[#64748b] font-medium shadow-sm">
              Галерея доступна только администраторам.
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#e2e8f0] text-center text-[#64748b] font-medium shadow-sm">
              Видео пока не загружены.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {videos.map((v) => (
                <div
                  key={v.url}
                  className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-sm flex flex-col gap-4 group hover:border-[#f59e0b] hover:shadow-md transition-all"
                >
                  <div className="bg-[#f3f5f8] rounded-xl aspect-video relative flex items-center justify-center overflow-hidden border border-[#e2e8f0] group-hover:border-[#f59e0b]/30">
                    <span className="text-4xl opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-transform duration-500">
                      🎥
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 to-transparent flex items-end p-3 opacity-90">
                      <span className="text-[11px] font-mono text-white/90 truncate w-full shadow-sm">
                        {v.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[#0f172a]">
                        {(v.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span className="text-[10px] text-[#64748b]">
                        {new Date(v.mtime).toLocaleDateString("ru-RU")}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`https://drwelnes.ru${v.url}`)}
                      className="text-xs font-semibold bg-[#f3f5f8] hover:bg-[#e2e8f0] text-[#0f172a] px-3 py-2 rounded-lg transition-all"
                    >
                      Скопировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
