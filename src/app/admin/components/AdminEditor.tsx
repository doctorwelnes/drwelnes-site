"use client";

import React from "react";
import {
  Type,
  Image as ImageIcon,
  Video,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  List as ListIcon,
  Quote as QuoteIcon,
  Table,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  Dna,
  Droplets,
  Wheat,
  MoveHorizontal,
  MoveVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { EditorMetadata } from "./EditorMetadata";
import { IngredientsList } from "./IngredientsList";
import { StepsList } from "./StepsList";

interface AdminEditorProps {
  activeFile: string | null;
  frontmatter: any;
  setFrontmatter: (fm: any) => void;
  fileContent: string;
  setFileContent: (content: string) => void;
  isAIGenerating: boolean;
  handleAICommand: (
    cmd:
      | "generate-tags"
      | "seo-description"
      | "refactor"
      | "exercise-mistakes"
      | "exercise-advice"
      | { type: string; field?: string },
  ) => void;
  applyMarkdown: (
    type: "bold" | "italic" | "link" | "list" | "quote" | "h2" | "h3" | "table",
  ) => void;
  openGallery: (field?: string | null, folderPath?: string) => void;
  handleUploadMedia: (file: File, customName?: string, folderPath?: string) => Promise<void>;
  moveItem: (type: "ingredients" | "steps", index: number, direction: "up" | "down") => void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

function toEmbedUrl(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes("rutube.ru") && u.pathname.includes("/video/")) {
      const id = u.pathname.split("/video/")[1]?.replace(/\/$/, "");
      if (id) return `https://rutube.ru/play/embed/${id}`;
    }
  } catch {}
  return url;
}

function normalizeMediaUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;

  try {
    const url = new URL(trimmed);
    if (url.pathname.startsWith("/uploads/")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {}

  return trimmed;
}

export function AdminEditor({
  activeFile,
  frontmatter,
  setFrontmatter,
  fileContent,
  setFileContent,
  isAIGenerating,
  handleAICommand,
  applyMarkdown,
  openGallery,
  handleUploadMedia,
  moveItem,
  editorRef,
}: AdminEditorProps) {
  const [activeTab, setActiveTab] = React.useState<"metadata" | "content">("metadata");
  const [videoAspectRatio, setVideoAspectRatio] = React.useState<number>(16 / 9);
  const isRecipe = activeFile?.includes("recipes/");
  const isExercise = activeFile?.includes("exercises/");
  const isTheory = activeFile?.includes("theory/");
  const defaultGalleryFolder = isRecipe || isExercise ? "/uploads/кадры-видео" : undefined;

  const handleVideoMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      setVideoAspectRatio(video.videoWidth / video.videoHeight);
    }
  };

  return (
    <div className="flex flex-1 min-w-0 bg-[#080808] h-full">
      <div className="flex-1 flex flex-col min-w-0 border-r border-white/5 bg-[#0a0a0a] h-full">
        {/* Editor Tabs */}
        <div className="h-14 border-b border-white/5 flex items-center px-4 bg-[#0d0d0d] gap-2">
          <button
            onClick={() => setActiveTab("metadata")}
            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "metadata" ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "text-neutral-500 hover:text-white"}`}
          >
            Метаданные
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "content" ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "text-neutral-500 hover:text-white"}`}
          >
            Контент
          </button>

          <div className="flex-1" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="max-w-4xl mx-auto space-y-10 pb-20">
            {activeTab === "metadata" ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                <EditorMetadata
                  frontmatter={frontmatter}
                  setFrontmatter={setFrontmatter}
                  activeFile={activeFile}
                  moveItem={moveItem}
                  handleAICommand={handleAICommand}
                  openGallery={openGallery}
                />

                {isRecipe && (
                  <>
                    <IngredientsList
                      ingredients={frontmatter.ingredients || []}
                      onChange={(val) => setFrontmatter({ ...frontmatter, ingredients: val })}
                      moveItem={(idx, dir) => moveItem("ingredients", idx, dir)}
                    />
                    <StepsList
                      steps={frontmatter.steps || []}
                      onChange={(val) => setFrontmatter({ ...frontmatter, steps: val })}
                      moveItem={(idx, dir) => moveItem("steps", idx, dir)}
                    />
                  </>
                )}

                {/* Markdown Editor - Moved to Metadata */}
                <div className="bg-[#0d0d0d] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                        {isExercise ? "Техника упражнения" : "Текст статьи"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAICommand({ type: "refactor" })}
                        disabled={isAIGenerating}
                        className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-500/80 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                      >
                        <Sparkles size={14} />
                        {isAIGenerating ? "Генерация..." : "AI Редактор"}
                      </button>
                    </div>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#0d0d0d] border border-white/5 rounded-2xl shadow-inner">
                    <button
                      onClick={() => applyMarkdown("h2")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-amber-500 font-bold text-xs transition-all"
                    >
                      H2
                    </button>
                    <button
                      onClick={() => applyMarkdown("h3")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-amber-500 font-bold text-xs transition-all"
                    >
                      H3
                    </button>
                    <div className="w-px h-4 bg-white/5 mx-1" />
                    <button
                      onClick={() => applyMarkdown("bold")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                      <BoldIcon size={16} />
                    </button>
                    <button
                      onClick={() => applyMarkdown("italic")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                      <ItalicIcon size={16} />
                    </button>
                    <div className="w-px h-4 bg-white/5 mx-1" />
                    <button
                      onClick={() => applyMarkdown("link")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <button
                      onClick={() => applyMarkdown("list")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                      <ListIcon size={16} />
                    </button>
                    <button
                      onClick={() => applyMarkdown("quote")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                      <QuoteIcon size={16} />
                    </button>
                    <button
                      onClick={() => applyMarkdown("table")}
                      className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all"
                    >
                      <Table size={16} />
                    </button>
                  </div>

                  <textarea
                    ref={editorRef}
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    spellCheck="false"
                    className="w-full min-h-[500px] bg-[#0c0c0c] p-10 rounded-[32px] border border-white/5 shadow-2xl text-neutral-300 font-mono text-[15px] leading-relaxed resize-y outline-none focus:border-amber-500/20 transition-all placeholder-neutral-800"
                    placeholder={
                      isExercise
                        ? "Опишите технику выполнения по шагам..."
                        : "Опишите ваш протокол/рецепт здесь..."
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                {/* Media Section (Moved from Metadata) */}
                <div className="bg-[#0d0d0d] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-8">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                      Медиа-контент
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Field */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                            <ImageIcon className="w-3 h-3 text-amber-500/50" />
                            {isTheory ? "Изображение карточки в разделе" : "Изображение карточки"}
                          </label>
                          <button
                            onClick={() =>
                              openGallery(isTheory ? "cardImage" : "image", defaultGalleryFolder)
                            }
                            className="text-[9px] font-black uppercase tracking-widest text-amber-500/50 hover:text-amber-500 transition-all flex items-center gap-1.5"
                          >
                            <ImageIcon size={10} />
                            Библиотека
                          </button>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={
                                isTheory ? frontmatter.cardImage || "" : frontmatter.image || ""
                              }
                              onChange={(e) =>
                                setFrontmatter({
                                  ...frontmatter,
                                  [isTheory ? "cardImage" : "image"]: e.target.value,
                                })
                              }
                              className="w-full bg-[#0c0c0c] border border-neutral-800 p-4 rounded-2xl text-neutral-200 text-sm outline-none focus:border-amber-500/30 transition-all shadow-inner placeholder-neutral-800"
                              placeholder="https://images..."
                            />
                          </div>
                          {(isTheory ? frontmatter.cardImage : frontmatter.image) && (
                            <div className="w-40 h-24 rounded-xl border border-white/5 overflow-hidden bg-black shrink-0 animate-in fade-in zoom-in-95">
                              <img
                                src={isTheory ? frontmatter.cardImage : frontmatter.image}
                                className="w-full h-full object-cover"
                                alt="Preview"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Article Images for Theory */}
                    {isTheory && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                              <ImageIcon className="w-3 h-3 text-amber-500/50" />
                              Изображения в статье
                            </label>
                            <button
                              onClick={() => {
                                const currentImages = frontmatter.articleImages || [];
                                setFrontmatter({
                                  ...frontmatter,
                                  articleImages: [...currentImages, ""],
                                });
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-amber-500/50 hover:text-amber-500 transition-all flex items-center gap-1.5"
                            >
                              <Plus className="w-3 h-3" />
                              Добавить
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(frontmatter.articleImages || []).map((img: string, idx: number) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={img}
                                    onChange={(e) => {
                                      const newImages = [...(frontmatter.articleImages || [])];
                                      newImages[idx] = e.target.value;
                                      setFrontmatter({ ...frontmatter, articleImages: newImages });
                                    }}
                                    className="w-full bg-[#0c0c0c] border border-neutral-800 p-3 rounded-xl text-neutral-200 text-sm outline-none focus:border-amber-500/30 transition-all shadow-inner placeholder-neutral-800"
                                    placeholder={`https://images... (${idx + 1})`}
                                  />
                                </div>
                                <button
                                  onClick={() => openGallery(`articleImages[${idx}]`)}
                                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all text-neutral-500 hover:text-amber-500"
                                >
                                  <ImageIcon size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    const newImages = [...(frontmatter.articleImages || [])];
                                    newImages.splice(idx, 1);
                                    setFrontmatter({ ...frontmatter, articleImages: newImages });
                                  }}
                                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-500"
                                >
                                  <Trash2 size={14} />
                                </button>
                                {img && (
                                  <div className="w-16 h-12 rounded-lg border border-white/5 overflow-hidden bg-black shrink-0">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {(frontmatter.articleImages || []).length === 0 && (
                              <div className="text-[11px] text-neutral-600 italic">
                                Нет изображений. Нажмите «Добавить» чтобы добавить.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Field */}
                    {!activeFile?.includes("theory/") && (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                              <Video className="w-3 h-3 text-amber-500/50" />
                              Видео
                            </label>
                            <button
                              onClick={() => openGallery("videoFile")}
                              className="text-[9px] font-black uppercase tracking-widest text-amber-500/50 hover:text-amber-500 transition-all flex items-center gap-1.5"
                            >
                              <ImageIcon size={10} />
                              Библиотека
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={normalizeMediaUrl(
                                frontmatter.videoFile || frontmatter.videoUrl || "",
                              )}
                              onChange={(e) =>
                                setFrontmatter({
                                  ...frontmatter,
                                  videoFile: normalizeMediaUrl(e.target.value),
                                  videoUrl: "",
                                })
                              }
                              className="w-full bg-[#0c0c0c] border border-neutral-800 p-4 rounded-2xl text-neutral-200 text-sm outline-none focus:border-amber-500/30 transition-all shadow-inner placeholder-neutral-800 pr-24"
                              placeholder="https://... или путь к файлу"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Preview & Poster */}
                  {!activeFile?.includes("theory/") && frontmatter.videoFile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                      <div
                        className="rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl relative w-full"
                        style={{ aspectRatio: videoAspectRatio }}
                      >
                        {(() => {
                          const v = normalizeMediaUrl(frontmatter.videoFile || "");
                          if (
                            v.endsWith(".mp4") ||
                            v.startsWith("/uploads/") ||
                            v.startsWith("/")
                          ) {
                            return (
                              <video
                                id="preview-video"
                                controls
                                className="w-full h-full object-contain"
                                poster={
                                  normalizeMediaUrl(frontmatter.videoPoster || "") || undefined
                                }
                                crossOrigin="anonymous"
                                onLoadedMetadata={handleVideoMetadata}
                              >
                                <source src={v.startsWith("/") ? v : `/${v}`} type="video/mp4" />
                              </video>
                            );
                          }
                          return (
                            <iframe
                              src={toEmbedUrl(v)}
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          );
                        })()}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
                            <ImageIcon className="w-3 h-3 text-amber-500/50" />
                            Обложка видео
                          </label>
                          <button
                            onClick={() => openGallery("videoPoster")}
                            className="text-[9px] font-black uppercase tracking-widest text-amber-500/50 hover:text-amber-500 transition-all flex items-center gap-1.5"
                          >
                            <ImageIcon size={10} />
                            Библиотека
                          </button>
                        </div>
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={normalizeMediaUrl(frontmatter.videoPoster || "")}
                              onChange={(e) =>
                                setFrontmatter({
                                  ...frontmatter,
                                  videoPoster: normalizeMediaUrl(e.target.value),
                                })
                              }
                              className="w-full bg-[#0c0c0c] border border-neutral-800 p-4 rounded-2xl text-neutral-200 text-sm outline-none focus:border-amber-500/30 transition-all shadow-inner"
                              placeholder="Ссылка на обложку..."
                            />
                          </div>
                          {frontmatter.videoPoster && (
                            <div className="w-40 h-24 rounded-xl border border-white/5 overflow-hidden bg-black flex-shrink-0">
                              <img
                                src={normalizeMediaUrl(frontmatter.videoPoster || "")}
                                className="w-full h-full object-cover"
                                alt="Poster"
                              />
                            </div>
                          )}
                        </div>

                        {(frontmatter.videoFile?.endsWith(".mp4") ||
                          frontmatter.videoFile?.startsWith("/")) && (
                          <button
                            onClick={() => {
                              const video = document.getElementById(
                                "preview-video",
                              ) as HTMLVideoElement;
                              if (!video) return;
                              const canvas = document.createElement("canvas");
                              canvas.width = video.videoWidth;
                              canvas.height = video.videoHeight;
                              const ctx = canvas.getContext("2d");
                              ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                              canvas.toBlob(
                                async (blob) => {
                                  if (!blob) return;
                                  const file = new File([blob], `poster-${Date.now()}.jpg`, {
                                    type: "image/jpeg",
                                  });
                                  const formData = new FormData();
                                  formData.append("file", file);
                                  formData.append("folderPath", "/uploads/кадры-видео");
                                  try {
                                    const res = await fetch("/api/admin/media", {
                                      method: "POST",
                                      body: formData,
                                    });
                                    if (res.ok) {
                                      const data = await res.json();
                                      setFrontmatter({
                                        ...frontmatter,
                                        videoPoster: data.path || data.url,
                                      });
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                },
                                "image/jpeg",
                                0.8,
                              );
                            }}
                            className="w-full py-3 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all border border-amber-500/20 flex items-center justify-center gap-2"
                          >
                            <ImageIcon size={12} /> Сделать кадр из видео
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Positioning for Recipe, Exercise and Theory Cards */}
                {(isRecipe || isExercise || isTheory) &&
                  (isExercise || isRecipe
                    ? frontmatter.image
                    : isTheory
                      ? frontmatter.cardImage
                      : null) && (
                    <div className="bg-[#0d0d0d] p-8 rounded-3xl border border-white/5 shadow-2xl space-y-6">
                      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                          Позиция картинки в карточке
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <MoveHorizontal className="w-3 h-3 text-amber-500/50" />
                            Горизонтально (X)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={
                              isTheory
                                ? frontmatter.cardImagePositionX
                                : (frontmatter.imagePositionX ?? 50)
                            }
                            onChange={(e) =>
                              setFrontmatter({
                                ...frontmatter,
                                [isTheory ? "cardImagePositionX" : "imagePositionX"]: parseInt(
                                  e.target.value,
                                ),
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                          <div className="flex items-center justify-between text-[9px] text-neutral-500">
                            <span>Лево</span>
                            <span className="text-amber-500 font-black">
                              {(isTheory
                                ? frontmatter.cardImagePositionX
                                : frontmatter.imagePositionX) ?? 50}
                              %
                            </span>
                            <span>Право</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] flex items-center gap-1.5">
                            <MoveVertical className="w-3 h-3 text-amber-500/50" />
                            Вертикально (Y)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={
                              isTheory
                                ? frontmatter.cardImagePositionY
                                : (frontmatter.imagePositionY ?? 50)
                            }
                            onChange={(e) =>
                              setFrontmatter({
                                ...frontmatter,
                                [isTheory ? "cardImagePositionY" : "imagePositionY"]: parseInt(
                                  e.target.value,
                                ),
                              })
                            }
                            className="w-full accent-amber-500"
                          />
                          <div className="flex items-center justify-between text-[9px] text-neutral-500">
                            <span>Верх</span>
                            <span className="text-amber-500 font-black">
                              {isTheory
                                ? frontmatter.cardImagePositionY
                                : (frontmatter.imagePositionY ?? 50)}
                              %
                            </span>
                            <span>Низ</span>
                          </div>
                        </div>
                      </div>
                      {/* Preview */}
                      <div className="mt-4">
                        <div className="text-[9px] font-black text-neutral-600 uppercase tracking-wider mb-2">
                          Превью карточки
                        </div>
                        <div className="relative h-56 w-full max-w-xs bg-[#0c0c0c] rounded-xl overflow-hidden border border-neutral-800">
                          <img
                            src={isTheory ? frontmatter.cardImage : frontmatter.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            style={{
                              objectPosition: `${(isTheory ? frontmatter.cardImagePositionX : frontmatter.imagePositionX) ?? 50}% ${(isTheory ? frontmatter.cardImagePositionY : frontmatter.imagePositionY) ?? 50}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
