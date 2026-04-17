"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Dumbbell,
  Activity,
  Shield,
  Info,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Heart,
} from "lucide-react";
import { Exercise } from "@/lib/content";
import { useExerciseFavoritesSWR } from "@/hooks/useExerciseFavoritesSWR";

export default function ExerciseDetailClient({ exercise }: { exercise: Exercise }) {
  const { toggleFavorite, isFavorite } = useExerciseFavoritesSWR();
  const [isVideoVertical, setIsVideoVertical] = React.useState(false);
  const fav = isFavorite(exercise.slug);

  return (
    <main className="max-w-7xl mx-auto animate-in fade-in duration-700 relative px-0 md:px-0">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[400px] -z-10 opacity-10 blur-[100px] pointer-events-none bg-orange-500/20" />

      <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[1fr_320px]">
        {/* Left Column */}
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Header Card */}
          <section className="bg-[#13151a]/60 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden p-5 md:p-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent opacity-50" />

            <Link href="/exercises" className="inline-flex items-center gap-2 group mb-6">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-orange-500/30 transition-all">
                <ChevronRight className="w-3 h-3 rotate-180 text-orange-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
                К упражнениям
              </span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {exercise.categories?.map((cat) => (
                <div
                  key={cat}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 text-orange-500 text-[9px] font-black uppercase tracking-widest rounded-lg"
                >
                  {cat}
                </div>
              ))}
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="font-black text-white uppercase tracking-tighter leading-tight italic text-2xl md:text-3xl lg:text-4xl">
                {exercise.title}
              </h1>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(exercise.slug)}
                className={`flex items-center justify-center rounded-2xl border transition-all shadow-2xl active:scale-90 shrink-0 w-12 h-12 md:w-14 md:h-14 ${
                  fav
                    ? "bg-orange-500/20 border-orange-500 text-orange-500 shadow-orange-500/20"
                    : "bg-white/5 border-white/10 text-zinc-500 hover:border-orange-500/50 hover:text-white"
                }`}
              >
                <Heart className={`w-6 h-6 md:w-7 md:h-7 ${fav ? "fill-orange-500" : ""}`} />
              </button>
            </div>

            {exercise.description && (
              <p className="mt-4 text-zinc-500 leading-relaxed font-medium max-w-[60ch]">
                {exercise.description}
              </p>
            )}
          </section>

          {/* Video Section with Smart Detection - Moved up */}
          {(() => {
            const vFile = exercise.videoFile?.trim();
            const vUrl = exercise.videoUrl?.trim();

            const isLocalVideo =
              (vFile &&
                (vFile.toLowerCase().endsWith(".mp4") ||
                  vFile.toLowerCase().endsWith(".webm") ||
                  vFile.toLowerCase().endsWith(".mov") ||
                  vFile.startsWith("/uploads"))) ||
              (vUrl &&
                (vUrl.toLowerCase().endsWith(".mp4") ||
                  vUrl.toLowerCase().endsWith(".webm") ||
                  vUrl.toLowerCase().endsWith(".mov")));

            const finalVideoSrc = isLocalVideo ? vFile || vUrl : null;

            if (finalVideoSrc) {
              let cleanedSrc = finalVideoSrc.trim();
              if (!cleanedSrc.startsWith("http") && !cleanedSrc.startsWith("/")) {
                cleanedSrc = `/${cleanedSrc}`;
              }

              return (
                <div
                  className={`relative rounded-[40px] overflow-hidden bg-black shadow-2xl flex items-center justify-center border border-white/5 w-full transition-all duration-500 touch-manipulation ${isVideoVertical ? "aspect-[9/16] max-w-[320px] sm:max-w-[400px] mx-auto" : "aspect-video"}`}
                >
                  <video
                    key={cleanedSrc}
                    controls
                    playsInline
                    preload="metadata"
                    controlsList="nodownload noplaybackrate noremoteplayback"
                    disablePictureInPicture
                    className="w-full h-full object-contain"
                    poster={exercise.videoPoster}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      if (video.videoHeight > video.videoWidth) {
                        setIsVideoVertical(true);
                      }
                    }}
                  >
                    <source src={cleanedSrc} />
                    Ваш браузер не поддерживает встроенные видео.
                  </video>

                  <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:hidden">
                    <div className="mx-auto w-fit rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md">
                      Откройте на весь экран для удобного просмотра
                    </div>
                  </div>
                </div>
              );
            }

            if (vUrl || vFile) {
              const toEmbedUrl = (url: string) => {
                try {
                  const u = new URL(url);
                  if (u.hostname.includes("youtube.com") && u.searchParams.has("v"))
                    return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
                  if (u.hostname === "youtu.be")
                    return `https://www.youtube.com/embed${u.pathname}`;
                  if (u.hostname.includes("rutube.ru") && u.pathname.includes("/video/")) {
                    const id = u.pathname.split("/video/")[1]?.replace(/\/$/, "");
                    if (id) return `https://rutube.ru/play/embed/${id}`;
                  }
                } catch {}
                return url;
              };

              const embedUrl = toEmbedUrl(vUrl || vFile || "");
              return (
                <div className="relative rounded-[40px] overflow-hidden shadow-2xl aspect-video border border-white/5 w-full bg-black touch-manipulation">
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title={exercise.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="border-0"
                  />

                  <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:hidden">
                    <div className="mx-auto w-fit rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md">
                      Нажмите полноэкранный режим для лучшего просмотра
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })()}

          {/* Technique / Content Section */}
          <section className="bg-[#13151a]/40 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-xl p-5 md:p-10">
            <h2 className="text-xl font-black text-white uppercase tracking-tight italic mb-6 flex items-center gap-3">
              <Shield className="w-6 h-6 text-orange-500" />
              Техника выполнения
            </h2>

            <div
              className="prose prose-invert prose-zinc max-w-none prose-sm md:prose-base prose-h1:text-white prose-h2:text-white prose-h3:text-white prose-p:text-zinc-400 prose-li:text-zinc-400 prose-strong:text-orange-500 prose-strong:font-black"
              dangerouslySetInnerHTML={{
                __html: exercise.body.split("\n").join("<br />"),
              }}
            />
          </section>

          {/* Parameters Section - Moved from sidebar to main column */}
          <section className="bg-[#13151a]/60 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-xl p-5 md:p-10">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-orange-500 mb-6 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Параметры
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercise.equipment && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">
                    Инвентарь
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-tight italic">
                      {exercise.equipment}
                    </span>
                  </div>
                </div>
              )}

              {exercise.difficulty && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">
                    Сложность
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-sm font-black text-white uppercase tracking-tight italic">
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {exercise.muscles && exercise.muscles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">
                  Целевые группы мышц
                </div>
                <div className="flex flex-wrap gap-2">
                  {exercise.muscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {exercise.tags && exercise.tags.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">
                  Теги
                </div>
                <div className="flex flex-wrap gap-2">
                  {exercise.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-500 shadow-[0_0_15px_rgba(249,87,0,0.05)]"
                    >
                      <Tag className="w-3 h-3 opacity-80" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Common Mistakes Section */}
          {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
            <section className="bg-[#13151a]/40 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-xl p-5 md:p-10 mt-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tight italic mb-6 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
                Частые ошибки
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercise.commonMistakes.map((err, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      {idx % 2 === 0 ? (
                        <Activity className="w-4 h-4" />
                      ) : (
                        <Dumbbell className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-tight italic">
                      {err}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Info Sidebar */}
        <aside className="space-y-6">
          {exercise.proTip && (
            <div className="bg-gradient-to-br from-orange-500/20 to-transparent p-6 rounded-[32px] border border-orange-500/10">
              <h4 className="text-white font-black italic uppercase tracking-tight mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" /> Совет
              </h4>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">{exercise.proTip}</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
