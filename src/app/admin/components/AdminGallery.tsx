"use client";

import React from "react";
import Image from "next/image";
import {
  Search,
  ImageIcon,
  Video,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Folder,
  ChevronRight,
  Plus,
} from "lucide-react";

interface MediaFile {
  name: string;
  url: string;
  type: "image" | "video" | "other" | "directory";
  isUsed?: boolean;
  size?: number;
  isDirectory?: boolean;
}

interface AdminGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  mediaGallery: MediaFile[];
  isGalleryLoading: boolean;
  fetchMedia: (folderPath: string) => void;
  gallerySearchQuery: string;
  setGallerySearchQuery: (v: string) => void;
  insertMediaLink: (url: string, type: "image" | "video" | "other") => void;
  handleDeleteMedia: (url: string, e: React.MouseEvent) => Promise<void>;
  handleDeleteMultipleMedia: (urls: string[]) => Promise<void>;
  handleMoveMultipleMedia: (urls: string[], targetFolder: string) => Promise<void>;
  handleRenameMedia: (url: string, name: string) => void;
  handleUpload: (file: File, customName?: string, folderPath?: string) => Promise<void>;
  handleCreateFolder: (name: string, folderPath?: string) => Promise<void>;
  isPicking?: boolean;
  activeContentTitle?: string;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  setConfirmModal: (modal: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "info";
  }) => void;
}

export function AdminGallery({
  isOpen,
  onClose,
  mediaGallery,
  isGalleryLoading,
  fetchMedia,
  gallerySearchQuery,
  setGallerySearchQuery,
  insertMediaLink,
  handleDeleteMedia,
  handleDeleteMultipleMedia,
  handleMoveMultipleMedia,
  handleRenameMedia,
  handleUpload,
  handleCreateFolder,
  isPicking,
  activeContentTitle,
  addToast,
  setConfirmModal,
}: AdminGalleryProps) {
  const [renamingMediaUrl, setRenamingMediaUrl] = React.useState<string | null>(null);
  const [newMediaName, setNewMediaName] = React.useState("");
  const [selectedUrls, setSelectedUrls] = React.useState<string[]>([]);
  const [currentPath, setCurrentPath] = React.useState("/uploads");
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [isMovingFiles, setIsMovingFiles] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "image" | "video" | "unused">("all");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    fetchMedia(currentPath);
  }, [isOpen, currentPath, fetchMedia]);

  const filteredGallery = React.useMemo(() => {
    let items = mediaGallery;

    // 1. Filter by current path (direct children only) if not searching
    if (!gallerySearchQuery.trim()) {
      const normalizedCurrentPath = decodeURIComponent(currentPath)
        .toLowerCase()
        .replace(/\/$/, "");

      items = items.filter((item) => {
        // Decode and normalize item URL
        const itemUrl = decodeURIComponent(item.url).toLowerCase();

        // Find the index of the last slash
        const lastSlashIndex = itemUrl.lastIndexOf("/");
        if (lastSlashIndex === -1) return false;

        // Parent folder is everything before the last slash
        let parentPath = itemUrl.substring(0, lastSlashIndex);
        if (parentPath === "") parentPath = "/";

        const normalizedParentPath = parentPath === "/" ? "/" : parentPath.replace(/\/$/, "");

        // Final comparison of standardized paths
        return normalizedParentPath === (normalizedCurrentPath || "/");
      });
    }

    // 2. Filter by search query if present
    if (gallerySearchQuery.trim()) {
      const query = gallerySearchQuery.toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(query));
    }

    // 3. Filter by type
    if (filterType !== "all") {
      if (filterType === "unused") {
        items = items.filter((item) => !item.isUsed && item.type !== "directory");
      } else {
        items = items.filter((item) => item.type === filterType || item.type === "directory");
      }
    }

    // 4. Sort: directories first
    return [...items].sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [mediaGallery, currentPath, gallerySearchQuery, filterType]);

  const toggleSelect = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedUrls.includes(url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== url));
    } else {
      setSelectedUrls([...selectedUrls, url]);
    }
  };

  const selectAll = () => {
    const allUrls = filteredGallery.filter((f) => f.type !== "directory").map((f) => f.url);
    setSelectedUrls(allUrls);
    addToast(`Выбрано файлов: ${allUrls.length}`, "info");
  };

  const deselectAll = () => {
    setSelectedUrls([]);
    addToast("Выделение снято", "info");
  };

  const isAllSelected =
    filteredGallery.length > 0 &&
    filteredGallery
      .filter((f) => f.type !== "directory")
      .every((f) => selectedUrls.includes(f.url));

  const allFolders = React.useMemo(() => {
    return mediaGallery
      .filter((f) => f.type === "directory")
      .map((f) => f.url)
      .sort();
  }, [mediaGallery]);

  const handleMoveFiles = async (targetFolder: string) => {
    if (selectedUrls.length === 0) return;
    await handleMoveMultipleMedia(selectedUrls, targetFolder);
    setSelectedUrls([]);
    setIsMovingFiles(false);
  };

  const handleDeleteMediaWithConfirm = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: "Удалить файл?",
      message: "Это действие нельзя отменить.",
      type: "danger",
      onConfirm: async () => {
        await handleDeleteMedia(url, e);
        fetchMedia(currentPath);
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      },
    });
  };

  const handleBulkDeleteWithConfirm = () => {
    if (selectedUrls.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: `Удалить файлы (${selectedUrls.length})?`,
      message: "Все выбранные медиафайлы будут удалены навсегда.",
      type: "danger",
      onConfirm: async () => {
        await handleDeleteMultipleMedia(selectedUrls);
        fetchMedia(currentPath);
        setSelectedUrls([]);
        setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: () => {} });
      },
    });
  };

  const breadcrumbs = React.useMemo(() => {
    const parts = currentPath.split("/").filter(Boolean);
    const crumbs = [];
    let pathAcc = "";
    for (const part of parts) {
      pathAcc += "/" + part;
      crumbs.push({ name: part, path: pathAcc });
    }
    return crumbs;
  }, [currentPath]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[500] flex items-center justify-center p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-neutral-800 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-neutral-800 gap-4">
          <h2 className="text-sm font-black text-neutral-300 flex items-center gap-2 shrink-0">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            {isPicking ? "Выберите файл" : "Медиатека"}
          </h2>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="flex bg-neutral-900 rounded-xl p-1 border border-white/5 shrink-0">
              {(["all", "image", "video", "unused"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2 md:px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${
                    filterType === t
                      ? "bg-amber-500 text-black shadow-lg"
                      : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {t === "all"
                    ? "Все"
                    : t === "image"
                      ? "Фото"
                      : t === "video"
                        ? "Видео"
                        : "Лишние"}
                </button>
              ))}
            </div>
            <div className="relative group flex-1 md:flex-none min-w-[120px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Поиск..."
                value={gallerySearchQuery}
                onChange={(e) => setGallerySearchQuery(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 focus:border-amber-500/50 text-[11px] text-neutral-200 outline-none pl-9 pr-3 py-1.5 rounded-xl transition-all w-full"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("Gallery: Starting upload for", file.name, "type:", file.type);
                    handleUpload(file, activeContentTitle, currentPath);
                  }
                }}
                accept="image/*,video/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-700 transition-all active:scale-95 border border-white/5"
                title="Загрузить файл"
              >
                <Upload size={14} />
                <span className="hidden sm:inline">Загрузить</span>
              </button>
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-700 transition-all active:scale-95 border border-white/5"
                title="Создать папку"
              >
                <Plus size={14} />
                <span>Папка</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-neutral-600 hover:text-white transition-colors bg-neutral-900 rounded-xl border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs & Navigation */}
        <div className="bg-neutral-900/30 border-b border-neutral-800 px-4 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentPath("/uploads")}
            className={`text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${currentPath === "/uploads" ? "text-amber-500" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            Root
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight size={10} className="text-neutral-700 shrink-0" />
              <button
                onClick={() => setCurrentPath(crumb.path)}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${idx === breadcrumbs.length - 1 ? "text-amber-500" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Create Folder Popup (Inline) */}
        {isCreatingFolder && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
              Новая папка:
            </span>
            <input
              autoFocus
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateFolder(folderName, currentPath);
                  setFolderName("");
                  setIsCreatingFolder(false);
                }
                if (e.key === "Escape") setIsCreatingFolder(false);
              }}
              className="flex-1 bg-black/40 border border-amber-500/30 text-xs text-white px-3 py-1.5 rounded-lg outline-none"
              placeholder="Введите название..."
              spellCheck={false}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleCreateFolder(folderName, currentPath);
                  setFolderName("");
                  setIsCreatingFolder(false);
                }}
                className="bg-amber-500 text-black p-1.5 rounded-lg hover:bg-amber-400 transition-all"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setIsCreatingFolder(false)}
                className="bg-white/5 text-neutral-400 p-1.5 rounded-lg hover:bg-white/10 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        <div className="bg-neutral-900/50 border-b border-neutral-800 px-4 py-2 flex items-center justify-between min-h-[44px]">
          <div className="flex items-center gap-3">
            <button
              onClick={isAllSelected ? deselectAll : selectAll}
              className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-amber-500 transition-colors flex items-center gap-2"
            >
              <div
                className={`w-3.5 h-3.5 rounded border transition-all flex items-center justify-center ${isAllSelected ? "bg-amber-500 border-amber-500" : "border-neutral-700"}`}
              >
                {isAllSelected && <Check size={10} className="text-black" />}
              </div>
              {isAllSelected ? "Снять выделение" : "Выбрать все"}
            </button>
            {selectedUrls.length > 0 && (
              <span className="text-[10px] font-bold text-neutral-600">
                Выбрано: {selectedUrls.length}
              </span>
            )}
          </div>

          {selectedUrls.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsMovingFiles(!isMovingFiles)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
                >
                  <Folder size={12} />
                  Переместить ({selectedUrls.length})
                </button>

                {isMovingFiles && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                      <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">
                        Выберите папку
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar py-1">
                      <button
                        onClick={() => handleMoveFiles("/uploads")}
                        className="w-full px-4 py-2 text-left text-[10px] font-bold text-neutral-300 hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-2"
                      >
                        <Folder size={10} className="opacity-50" />
                        Root (/uploads)
                      </button>
                      {allFolders
                        .filter((f) => f !== currentPath)
                        .map((folder) => (
                          <button
                            key={folder}
                            onClick={() => handleMoveFiles(folder)}
                            className="w-full px-4 py-2 text-left text-[10px] font-bold text-neutral-300 hover:bg-amber-500 hover:text-black transition-colors flex items-center gap-2"
                          >
                            <Folder size={10} className="opacity-50" />
                            {folder.replace("/uploads", "") || "/"}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleBulkDeleteWithConfirm}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
                Удалить
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {isGalleryLoading ? (
            <div className="text-center text-neutral-600 py-12 animate-pulse font-black uppercase text-[10px] tracking-[0.2em]">
              Loading...
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-700 bg-white/[0.02] border border-dashed border-white/5 rounded-[32px]">
              <ImageIcon size={48} className="opacity-10 mb-4" />
              <p className="text-[11px] font-black uppercase tracking-widest">Пусто в этой папке</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((file) => (
                <div
                  key={file.url}
                  className={`group relative aspect-square bg-neutral-900 rounded-[24px] overflow-hidden border transition-all duration-300
                      ${selectedUrls.includes(file.url) ? "border-amber-500 ring-2 ring-amber-500/20" : "border-white/5 hover:border-white/20 hover:shadow-2xl"}`}
                >
                  <div
                    className="w-full h-full cursor-pointer flex items-center justify-center"
                    onClick={() => {
                      if (file.type === "directory") {
                        setCurrentPath(file.url);
                      } else {
                        insertMediaLink(file.url, file.type);
                      }
                    }}
                  >
                    {file.type === "image" ? (
                      <Image
                        src={file.url}
                        alt={file.name || "Медиафайл"}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : file.type === "directory" ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500 group-hover:text-amber-500 transition-colors">
                        <Folder className="w-12 h-12 fill-current opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 text-center">
                          {file.name}
                        </span>
                      </div>
                    ) : file.type === "video" ? (
                      <div className="relative w-full h-full group/v">
                        <video
                          src={file.url}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                          onMouseOver={(e) => e.currentTarget.play()}
                          onMouseOut={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover/v:bg-transparent transition-colors" />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 group-hover/v:scale-0 transition-transform">
                          <Video className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-500">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] truncate max-w-[80%]">{file.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Checkbox Overlay */}
                  <div
                    onClick={(e) => toggleSelect(file.url, e)}
                    className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer backdrop-blur-md
                        ${
                          selectedUrls.includes(file.url)
                            ? "bg-amber-500 border-amber-500 text-black scale-100 opacity-100 shadow-lg"
                            : "bg-black/40 border-white/20 text-white opacity-0 group-hover:opacity-100 scale-90 hover:scale-100 hover:border-amber-500/50"
                        }`}
                  >
                    <Check
                      size={12}
                      className={selectedUrls.includes(file.url) ? "" : "opacity-50"}
                    />
                  </div>

                  {/* Usage Indicator */}
                  {file.isUsed && file.type !== "directory" && (
                    <div
                      className="absolute top-2 left-9 z-10 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                      title="Файл используется в контенте"
                    />
                  )}

                  {/* Управление файлом (Overlay) */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingMediaUrl(file.url);
                        setNewMediaName(file.name.split(".").shift() || "");
                      }}
                      className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors border border-white/10"
                      title="Переименовать"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteMediaWithConfirm(file.url, e)}
                      className="p-1.5 bg-black/60 hover:bg-neutral-900 text-red-400 rounded-lg transition-colors border border-white/10"
                      title="Удалить"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Инфо и Переименование */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2">
                    {renamingMediaUrl === file.url ? (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          value={newMediaName}
                          onChange={(e) => setNewMediaName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRenameMedia(file.url, newMediaName);
                              setRenamingMediaUrl(null);
                            }
                            if (e.key === "Escape") setRenamingMediaUrl(null);
                          }}
                          className="flex-1 bg-black/60 border border-amber-500/50 text-[10px] text-white px-2 py-1 rounded outline-none"
                        />
                        <button
                          onClick={() => {
                            handleRenameMedia(file.url, newMediaName);
                            setRenamingMediaUrl(null);
                          }}
                          className="p-1 bg-amber-500 text-black rounded hover:bg-amber-400"
                        >
                          <Check size={10} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-white text-[10px] font-bold block truncate drop-shadow-md">
                        {file.name}
                      </span>
                    )}
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
