"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  PanelLeftClose,
  PanelLeft,
  Activity,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  UploadCloud,
  ExternalLink,
} from "lucide-react";
import { AdminSidebar, type FileNode } from "./components/AdminSidebar";
import { AdminStats } from "./components/AdminStats";
import { CreateContentModal } from "./components/CreateContentModal";
import { AdminEditor } from "./components/AdminEditor";
import { AdminGallery } from "./components/AdminGallery";
import { PremiumConfirmModal } from "./components/PremiumConfirmModal";

export interface RecipeKbru {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface ContentSearchResult {
  path: string;
  title: string;
  excerpt: string;
  type: "file";
}

export interface Frontmatter {
  [key: string]: unknown;
  title?: string;
  slug?: string;
  categories?: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  tags?: string[];
  videoFile?: string;
  kbru?: RecipeKbru;
  kbruBasal?: RecipeKbru;
  description?: string;
  draft?: boolean;
  ingredients?: { name: string; amount: string; isGroup?: boolean }[];
  steps?: { text: string }[];
}

export default function AdminDashboard({ username = "Admin" }: { username?: string }) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [frontmatter, setFrontmatter] = useState<Frontmatter>({});
  const [isLoading, setIsLoading] = useState(true);
  const [contentSearchResults, setContentSearchResults] = useState<ContentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [explorerWidth, setExplorerWidth] = useState(240);
  const [isResizingExplorer, setIsResizingExplorer] = useState(false);
  const [isExplorerVisible, setIsExplorerVisible] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([]));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [gallerySearchQuery, setGallerySearchQuery] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [mediaGallery, setMediaGallery] = useState<
    { name: string; url: string; type: "image" | "video" | "other" }[]
  >([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryInitialFolderPath, setGalleryInitialFolderPath] = useState("/uploads");
  const [gallerySessionKey, setGallerySessionKey] = useState(0);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" | "info" }[]
  >([]);
  const [isHotkeysHelpOpen, setIsHotkeysHelpOpen] = useState(false);
  // Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: "danger" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [searchMode, setSearchMode] = useState<"filename" | "content">("filename");
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Selection/Target for Media Gallery
  const [galleryTargetField, setGalleryTargetField] = useState<string | null>(null);

  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [hasLocalBackup, setHasLocalBackup] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingExplorer) {
        setExplorerWidth(Math.max(160, Math.min(800, e.clientX)));
      }
    };

    const handleMouseUp = () => {
      setIsResizingExplorer(false);
      document.body.style.cursor = "default";
    };

    if (isResizingExplorer) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "auto";
    };
  }, [isResizingExplorer]);

  useEffect(() => {
    fetchFileTree();
  }, [activeFile]);

  useEffect(() => {
    const handleContentSearch = async () => {
      if (searchMode !== "content" || !searchQuery.trim()) {
        setContentSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch("/api/admin/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
        });
        if (res.ok) {
          const data = await res.json();
          setContentSearchResults(data.results || []);
        }
      } catch (err) {
        // Silent fail for search
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(handleContentSearch, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  useEffect(() => {
    const handleAutosave = () => {
      if (!activeFile || !isDirty) return;
      const backup = {
        content: fileContent,
        frontmatter,
        timestamp: Date.now(),
      };
      localStorage.setItem(`backup_${activeFile}`, JSON.stringify(backup));
    };

    const timer = setTimeout(handleAutosave, 2000);
    return () => clearTimeout(timer);
  }, [fileContent, frontmatter, activeFile, isDirty]);

  // Ctrl+S hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeFile) saveFile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, frontmatter, fileContent]);

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchFileTree = async () => {
    try {
      const res = await fetch("/api/admin/files");
      if (res.ok) {
        const data = await res.json();
        setFileTree(data.tree);
      } else {
        const errorText = await res.text();
        console.error("Admin API error:", res.status, errorText);
        addToast(`Ошибка загрузки: ${res.status} - ${errorText}`, "error");
      }
    } catch (err) {
      console.error("fetchFileTree error:", err);
      addToast("Ошибка сети при загрузке файлов", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFile = async (path: string) => {
    if (isDirty) {
      setConfirmDialog({
        isOpen: true,
        title: "Несохраненные изменения",
        message:
          "У вас есть несохраненные изменения. Вы хотите переключиться на другой файл без сохранения?",
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          setIsDirty(false);
          loadFileInternal(path);
        },
        onCancel: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }
    loadFileInternal(path);
  };

  const loadFileInternal = async (path: string) => {
    try {
      const res = await fetch(`/api/admin/file?path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setActiveFile(data.path);
        setGalleryTargetField(null); // Reset target field on load

        const fm = { ...data.frontmatter };
        if (Array.isArray(fm.steps)) {
          fm.steps = fm.steps.map((s: string | { text: string }) =>
            typeof s === "string" ? { text: s } : s,
          );
        }
        setFrontmatter(fm as Frontmatter);
        setFileContent(data.content);

        const localBackup = localStorage.getItem(`backup_${path}`);
        if (localBackup) {
          try {
            const backup = JSON.parse(localBackup);
            if (backup.content !== data.content) {
              setHasLocalBackup(true);
            } else {
              setHasLocalBackup(false);
              localStorage.removeItem(`backup_${path}`);
            }
          } catch (e) {
            // Silent fail for backup parse
          }
        } else {
          setHasLocalBackup(false);
        }

        setTimeout(() => setIsDirty(false), 50);
      }
    } catch (err) {
      addToast("Ошибка загрузки файла", "error");
    }
  };

  useEffect(() => {
    if (activeFile) {
      setIsDirty(true);
    }
  }, [frontmatter, fileContent]);

  // Helper functions
  const translit = (text: string) => {
    const map: Record<string, string> = {
      а: "a",
      б: "b",
      в: "v",
      г: "g",
      д: "d",
      е: "e",
      ё: "yo",
      ж: "zh",
      з: "z",
      и: "i",
      й: "y",
      к: "k",
      л: "l",
      м: "m",
      н: "n",
      о: "o",
      р: "r",
      с: "s",
      т: "t",
      у: "u",
      ф: "f",
      х: "h",
      ц: "ts",
      ч: "ch",
      ш: "sh",
      щ: "shch",
      ъ: "",
      ы: "y",
      ь: "",
      э: "e",
      ю: "yu",
      я: "ya",
    };
    return text
      .toLowerCase()
      .split("")
      .map((char) => map[char] || char)
      .join("")
      .replace(/[^a-z0-9\-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const saveFile = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    setSaveStatus("saving");
    try {
      const fmToSave = { ...frontmatter };
      if (Array.isArray(fmToSave.steps)) {
        fmToSave.steps = fmToSave.steps.map((s: { text: string } | string) =>
          typeof s === "object" && s !== null ? s.text : s,
        ) as unknown as { text: string }[];
      }

      const res = await fetch("/api/admin/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: activeFile,
          frontmatter: fmToSave,
          content: fileContent,
        }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        setIsDirty(false);
        localStorage.removeItem(`backup_${activeFile}`);
        setHasLocalBackup(false);
        addToast("Изменения успешно сохранены локально!", "success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        addToast("Ошибка при сохранении файла", "error");
      }
    } catch (err) {
      addToast("Ошибка сети при сохранении", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Опубликовать на сервер?",
      message:
        "Код будет синхронизирован с основным сайтом. Это действие может повлиять на живых пользователей.",
      type: "info",
      onConfirm: async () => {
        setIsPublishing(true);
        try {
          const res = await fetch("/api/admin/publish", { method: "POST" });
          if (res.ok) {
            addToast("Сайт обновлен на сервере!", "success");
          } else {
            addToast("Ошибка при публикации", "error");
          }
        } catch (err) {
          addToast("Ошибка соединения", "error");
        } finally {
          setIsPublishing(false);
        }
      },
    });
  };

  const handleUploadMedia = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          const filePath = data.path || data.url;
          const isVideo = Boolean(filePath?.match(/\.(mp4|mov|webm)$/i));

          const markdownInsert = isVideo
            ? `\n<video src="${filePath}" controls preload="metadata"></video>\n`
            : `\n![${file.name}](${filePath})\n`;

          setFileContent((prev) => prev + markdownInsert);
        } else {
          addToast("Ошибка загрузки файла", "error");
        }
      } catch (err) {
        addToast("Ошибка загрузки файла", "error");
      }
    };
    input.click();
  };

  const handleCreateFile = () => {
    setIsCreateModalOpen(true);
  };

  const onConfirmCreate = async (data: { title: string; category: string; slug: string }) => {
    const { title, category, slug } = data;

    // Set default content based on category
    const defaultContent = `# ${title}\n\nНачните писать здесь...`;
    const fm: Frontmatter = {
      title,
      slug: slug.split("/").pop()?.replace(".md", ""),
      published: false,
      date: new Date().toISOString(),
      ...(category === "recipes"
        ? {
            image: "",
            category: "Завтрак",
            kcal: 0,
            time: 0,
            protein: 0,
            energy: 0,
            carbs: 0,
            fats: 0,
            ingredients: [],
            steps: [],
          }
        : {}),
      ...(category === "theory"
        ? {
            image: "",
            category: "Общее",
            description: "",
            tags: [],
            author: "",
            readingTime: "",
            references: [],
          }
        : {}),
    };

    try {
      const res = await fetch("/api/admin/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: slug,
          frontmatter: fm,
          content: defaultContent,
        }),
      });

      if (res.ok) {
        await fetchFileTree();
        setActiveFile(slug);
        setFrontmatter(fm);
        setFileContent(defaultContent);
        setIsCreateModalOpen(false);
        addToast("Документ создан и сохранен!", "success");
        setTimeout(() => setIsDirty(false), 100);
      } else {
        addToast("Ошибка при создании файла на диске", "error");
      }
    } catch (err) {
      addToast("Ошибка сети при создании", "error");
    }
  };

  const handleDuplicate = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: filePath }),
      });
      if (res.ok) {
        fetchFileTree();
      }
    } catch (err) {
      // Silent fail for duplicate
    }
  };

  const handleDeleteFile = async (filePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const fileName = filePath.split("/").pop();
    setConfirmModal({
      isOpen: true,
      title: "Удалить файл?",
      message: `Вы уверены, что хотите навсегда удалить ${fileName}? Это действие нельзя отменить.`,
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/file?path=${encodeURIComponent(filePath)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            addToast("Файл удален", "success");
            if (activeFile === filePath) {
              setActiveFile(null);
              setFrontmatter({});
              setFileContent("");
            }
            fetchFileTree();
          } else {
            addToast("Ошибка при удалении файла", "error");
          }
        } catch (err) {
          addToast("Ошибка сети при удалении", "error");
        }
      },
    });
  };

  const fetchMedia = useCallback(async (folderPath: string = "/uploads") => {
    setIsGalleryLoading(true);
    try {
      const res = await fetch(`/api/admin/media?folderPath=${encodeURIComponent(folderPath)}`);
      if (res.ok) {
        const data = await res.json();
        setMediaGallery(data.files || []);
      }
    } catch (err) {
      // Silent fail for media fetch
    } finally {
      setIsGalleryLoading(false);
    }
  }, []);

  const openGallery = async (targetField: string | null = null, folderPath?: string) => {
    setGalleryTargetField(targetField);
    setGalleryInitialFolderPath(folderPath || "/uploads");
    setGallerySessionKey((prev) => prev + 1);
    setIsGalleryOpen(true);
  };

  const handleDeleteMedia = async (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        addToast((data && data.error) || "Ошибка при удалении", "error");
        return;
      }

      if (data && data.success === false) {
        const firstError = data.results?.find?.((r: any) => !r.success)?.error;
        addToast(firstError || data.error || "Ошибка при удалении", "error");
        return;
      }

      setMediaGallery((prev) => prev.filter((m) => m.url !== url));
      addToast("Файл удален", "success");
    } catch (err) {
      console.error(err);
      addToast("Ошибка соединения", "error");
    }
  };

  const handleDeleteMultipleMedia = async (urls: string[]) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        addToast((data && data.error) || "Ошибка при массовом удалении", "error");
        return;
      }

      if (res.status === 207 && data && Array.isArray(data.results)) {
        const failed = data.results.filter((r: any) => !r.success);
        const succeeded = data.results.filter((r: any) => r.success).map((r: any) => r.url);
        if (succeeded.length) {
          setMediaGallery((prev) => prev.filter((m) => !succeeded.includes(m.url)));
        }
        const firstError = failed[0]?.error;
        addToast(firstError || "Некоторые файлы не удалились", "error");
        return;
      }

      if (data && data.success === false) {
        const firstError = data.results?.find?.((r: any) => !r.success)?.error;
        addToast(firstError || data.error || "Ошибка при массовом удалении", "error");
        return;
      }

      setMediaGallery((prev) => prev.filter((m) => !urls.includes(m.url)));
      addToast(`Удалено файлов: ${urls.length}`, "success");
    } catch (err) {
      console.error(err);
      addToast("Ошибка при массовом удалении", "error");
    }
  };

  const handleMoveMultipleMedia = async (urls: string[], targetFolder: string) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, targetFolder }),
      });

      if (res.ok) {
        addToast(`Перемещено файлов: ${urls.length}`, "success");
        fetchMedia(targetFolder); // Refresh to reflect changes
      } else {
        const data = await res.json();
        addToast(data.error || "Ошибка при перемещении", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Ошибка при перемещении", "error");
    }
  };

  const handleRenameMedia = async (url: string, newName: string) => {
    if (!newName.trim()) return;
    try {
      const res = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, newName }),
      });
      if (res.ok) {
        addToast("Файл переименован", "success");
        fetchMedia();
      } else {
        const data = await res.json();
        addToast(data.error || "Ошибка переименования", "error");
      }
    } catch (err) {
      // Silent fail for rename
    }
  };

  const handleGalleryUpload = async (file: File, customName?: string, folderPath?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (customName) formData.append("customName", customName);
    if (folderPath) formData.append("folderPath", folderPath);

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      if (res.ok) {
        addToast("Файл загружен", "success");
        fetchMedia(folderPath || "/uploads"); // Refresh
      } else {
        const data = await res.json();
        addToast(data.error || "Ошибка при загрузке", "error");
      }
    } catch (err) {
      addToast("Ошибка соединения", "error");
    }
  };

  const handleCreateFolder = async (name: string, folderPath?: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, folderPath }),
      });
      if (res.ok) {
        addToast("Папка создана", "success");
        fetchMedia(folderPath || "/uploads");
      } else {
        const data = await res.json();
        addToast(data.error || "Ошибка при создании папки", "error");
      }
    } catch (err) {
      addToast("Ошибка соединения", "error");
    }
  };

  const insertMediaLink = (url: string, type: "image" | "video" | "other" | any) => {
    if (galleryTargetField) {
      // Check if it's an array field like "articleImages[0]"
      const arrayMatch = galleryTargetField.match(/^(.+)\[(\d+)\]$/);
      if (arrayMatch) {
        const fieldName = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        setFrontmatter((prev) => {
          const currentArray = (prev[fieldName] as string[]) || [];
          const newArray = [...currentArray];
          newArray[index] = url;
          return { ...prev, [fieldName]: newArray };
        });
      } else {
        // Regular field (e.g. videoPoster or videoFile)
        setFrontmatter((prev) => ({ ...prev, [galleryTargetField]: url }));
      }
      setIsGalleryOpen(false);
      setGalleryTargetField(null);
      setIsDirty(true);
      return;
    }

    if (!editorRef.current) {
      const isVideo = type === "video" || url.match(/\.(mp4|mov|webm)$/i);
      const insert = isVideo
        ? `\n<video src="${url}" controls preload="metadata"></video>\n`
        : `\n![](${url})\n`;
      setFileContent((prev) => prev + insert);
      setIsGalleryOpen(false);
      return;
    }
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = editorRef.current.value;
    const isVideo = type === "video" || url.match(/\.(mp4|mov|webm|avi|mkv)$/i);
    const insertion = isVideo
      ? `<video src="${url}" controls preload="metadata" class="w-full aspect-video rounded-3xl"></video>`
      : `![description](${url})`;

    const nextText = text.substring(0, start) + insertion + text.substring(end);
    setFileContent(nextText);
    setIsDirty(true);
    setIsGalleryOpen(false);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(
          start + (isVideo ? 0 : 2),
          start + (isVideo ? insertion.length : 14),
        );
      }
    }, 50);
  };

  const applyMarkdown = (
    type: "bold" | "italic" | "link" | "list" | "quote" | "h2" | "h3" | "table",
  ) => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = editorRef.current.value;
    const selected = text.substring(start, end);

    let replacement = "";
    let cursorOffset = 0;
    let selectionLen = 0;

    switch (type) {
      case "bold":
        replacement = `**${selected || "text"}**`;
        cursorOffset = 2;
        selectionLen = selected.length || 4;
        break;
      case "italic":
        replacement = `*${selected || "text"}*`;
        cursorOffset = 1;
        selectionLen = selected.length || 4;
        break;
      case "link":
        replacement = `[${selected || "text"}](url)`;
        cursorOffset = (selected ? selected.length + 2 : 1) + 1;
        selectionLen = 3;
        break;
      case "list":
        replacement = `\n- ${selected || "item"}`;
        cursorOffset = 3;
        selectionLen = selected.length || 4;
        break;
      case "quote":
        replacement = `\n> ${selected || "quote"}`;
        cursorOffset = 3;
        selectionLen = selected.length || 5;
        break;
      case "h2":
        replacement = `\n## ${selected || "Heading"}`;
        cursorOffset = 4;
        selectionLen = selected.length || 7;
        break;
      case "h3":
        replacement = `\n### ${selected || "Subheading"}`;
        cursorOffset = 5;
        selectionLen = selected.length || 10;
        break;
      case "table":
        replacement = `\n| Col 1 | Col 2 |\n| :--- | :--- |\n| Val | Val |`;
        cursorOffset = 3;
        selectionLen = 5;
        break;
    }

    const nextText = text.substring(0, start) + replacement + text.substring(end);
    setFileContent(nextText);
    setIsDirty(true);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
        editorRef.current.setSelectionRange(
          start + cursorOffset,
          start + cursorOffset + selectionLen,
        );
      }
    }, 50);
  };

  const handleAICommand = async (
    cmd:
      | "generate-tags"
      | "seo-description"
      | "refactor"
      | "exercise-mistakes"
      | "exercise-advice"
      | { type: string; field?: string },
  ) => {
    if (typeof cmd === "object" && cmd.type === "open-gallery") {
      openGallery(cmd.field);
      return;
    }

    if (!fileContent && !activeFile && !frontmatter.title) return;
    setIsAIGenerating(true);

    // Default formulations for exercises if API is not needed/working
    if (cmd === "exercise-mistakes") {
      const defaultMistakes = [
        "Неправильное дыхание (задержка дыхания)",
        "Слишком высокая скорость выполнения",
        "Отсутствие контроля в негативной фазе",
        "Использование инерции вместо силы мышц",
      ];
      setFrontmatter({ ...frontmatter, commonMistakes: defaultMistakes });
      addToast("Ошибки сгенерированы (Template)", "success");
      setIsDirty(true);
      setIsAIGenerating(false);
      return;
    }

    if (cmd === "exercise-advice") {
      const defaultAdvice =
        "Всегда сохраняйте нейтральное положение позвоночника и фокусируйтесь на целевой мышечной группе. Качество каждого повторения важнее их общего количества.";
      setFrontmatter({ ...frontmatter, proTip: defaultAdvice });
      addToast("Совет сгенерирован (Template)", "success");
      setIsDirty(true);
      setIsAIGenerating(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd, content: fileContent, frontmatter }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (cmd === "generate-tags" && data.tags) {
      } else if (cmd === "seo-description" && data.description) {
        setFrontmatter({ ...frontmatter, description: data.description });
        addToast("Описание обновлено", "success");
      } else if (cmd === "refactor" && data.content) {
        setFileContent(data.content);
        addToast("Улучшено с помощью AI", "success");
      }
      setIsDirty(true);
    } catch (e: any) {
      addToast(e.message || "Ошибка AI", "error");
    } finally {
      setIsAIGenerating(false);
    }
  };

  const restoreFromBackup = () => {
    if (!activeFile) return;
    const localBackup = localStorage.getItem(`backup_${activeFile}`);
    if (localBackup) {
      try {
        const backup = JSON.parse(localBackup);
        setFileContent(backup.content);
        setFrontmatter(backup.frontmatter);
        setIsDirty(true);
        setHasLocalBackup(false);
        addToast("Восстановлено из бэкапа", "info");
      } catch (e) {
        // Silent fail for restore backup
      }
    }
  };

  const moveItem = (type: "ingredients" | "steps", index: number, direction: "up" | "down") => {
    if (!frontmatter[type]) return;
    const items = [...(frontmatter[type] as unknown[])];
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const [removed] = items.splice(index, 1);
    items.splice(newIdx, 0, removed);
    setFrontmatter({ ...frontmatter, [type]: items });
  };

  const countFiles = (node: FileNode): number => {
    if (node.type === "file") return 1;
    return (node.children || []).reduce(
      (acc: number, child: FileNode) => acc + countFiles(child),
      0,
    );
  };

  const stats = {
    recipes: countFiles(
      fileTree.find((n) => n.path === "recipes") || { name: "", type: "directory", path: "" },
    ),
    theory: countFiles(
      fileTree.find((n) => n.path === "theory") || { name: "", type: "directory", path: "" },
    ),
    calculators: countFiles(
      fileTree.find((n) => n.path === "calculators") || { name: "", type: "directory", path: "" },
    ),
    exercises: countFiles(
      fileTree.find((n) => n.path === "exercises") || { name: "", type: "directory", path: "" },
    ),
    total: countFiles({ name: "root", type: "directory", path: "", children: fileTree }),
    published: (() => {
      let count = 0;
      const walk = (ns: FileNode[]) => {
        for (const n of ns) {
          if (n.type === "file" && !n.isDraft) count++;
          else if (n.children) walk(n.children);
        }
      };
      walk(fileTree);
      return count;
    })(),
    readiness: 0, // calculated below
    drafts: 0, // for backward compatibility if needed
  };
  stats.readiness = Math.round((stats.published / (stats.total || 1)) * 100);
  stats.drafts = stats.total - stats.published;

  const getRecentFiles = (nodes: FileNode[]) => {
    const allFiles: { path: string; name: string; mtime: string }[] = [];
    const flatten = (ns: FileNode[]) => {
      for (const n of ns) {
        if (n.type === "file") {
          allFiles.push({
            path: n.path,
            name: n.name.replace(".md", ""),
            mtime: n.lastModified || "Unknown",
          });
        } else if (n.children) flatten(n.children);
      }
    };
    flatten(nodes);
    return allFiles
      .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime())
      .slice(0, 5);
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-neutral-200 flex flex-col font-sans overflow-hidden capitalize-none selection:bg-amber-500/30">
      {/* HEADER */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d] z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExplorerVisible(!isExplorerVisible)}
            className="p-2 hover:bg-white/5 rounded-xl transition-all"
            title="Toggle Sidebar"
          >
            {isExplorerVisible ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Activity size={18} className="text-black" />
            </div>
            <span className="font-black text-[13px] uppercase tracking-[0.2em]">
              Dr. Welnes <span className="text-neutral-500 font-bold">IDE</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasLocalBackup && (
            <button
              onClick={restoreFromBackup}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-black uppercase tracking-widest rounded-xl border border-blue-500/20 transition-all animate-pulse"
            >
              Восстановить
            </button>
          )}

          <div className="flex items-center gap-2 bg-neutral-900/50 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl
                ${isPublishing ? "bg-cyan-500/10 text-cyan-500/40 border border-cyan-500/10 cursor-not-allowed" : "bg-cyan-500 text-black hover:bg-cyan-400 hover:-translate-y-0.5 shadow-cyan-500/20"}`}
            >
              <UploadCloud size={16} className={isPublishing ? "animate-bounce" : ""} />
              {isPublishing ? "Публикация..." : "Опубликовать на сервер"}
            </button>

            <button
              onClick={() =>
                window.open(activeFile ? "/" + activeFile.replace(".md", "") : "/", "_blank")
              }
              className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-indigo-500/20"
              title="Перейти на сайт"
            >
              <ExternalLink size={16} />
              На сайт
            </button>

            <button
              onClick={saveFile}
              disabled={isSaving || !isDirty}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all
                 ${
                   isDirty
                     ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
                     : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                 }`}
            >
              <Save size={14} className={isSaving ? "animate-spin" : ""} />
              {isSaving ? "Сохранение..." : isDirty ? "Сохранить" : "Сохранено"}
            </button>
          </div>

          <div className="w-px h-8 bg-white/5 mx-2" />

          <div className="flex flex-col items-end px-2">
            <span className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">
              Оператор
            </span>
            <span className="text-[12px] font-bold">{username}</span>
          </div>

          <button
            onClick={() => setIsHotkeysHelpOpen(true)}
            className="p-2.5 hover:bg-white/5 rounded-xl text-neutral-500 hover:text-white transition-all ml-2"
          >
            <Info size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex min-h-0 overflow-y-auto overflow-x-hidden">
        {isExplorerVisible && (
          <AdminSidebar
            fileTree={fileTree}
            activeFile={activeFile}
            loadFile={loadFile}
            handleCreateFile={handleCreateFile}
            handleDuplicate={handleDuplicate}
            handleDeleteFile={handleDeleteFile}
            isSearching={searchMode === "content"}
            setIsSearching={(val) => setSearchMode(val ? "content" : "filename")}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sidebarWidth={explorerWidth}
            setSidebarWidth={setExplorerWidth}
            isResizingSidebar={isResizingExplorer}
            setIsResizingSidebar={setIsResizingExplorer}
            isSidebarCollapsed={!isExplorerVisible}
            setIsSidebarCollapsed={(val) => setIsExplorerVisible(!val)}
            openGallery={openGallery}
            handleRenameMedia={handleRenameMedia}
            expandedFolders={expandedFolders}
            setExpandedFolders={setExpandedFolders}
          />
        )}

        {activeFile ? (
          <div className="flex-1 flex flex-col min-h-0">
            <AdminEditor
              activeFile={activeFile}
              frontmatter={frontmatter}
              setFrontmatter={setFrontmatter}
              fileContent={fileContent}
              setFileContent={setFileContent}
              isAIGenerating={isAIGenerating}
              handleAICommand={handleAICommand}
              applyMarkdown={applyMarkdown}
              openGallery={openGallery}
              handleUploadMedia={handleGalleryUpload}
              moveItem={moveItem}
              editorRef={editorRef}
            />
          </div>
        ) : (
          <AdminStats
            stats={stats}
            recentFiles={getRecentFiles(fileTree)}
            loadFile={loadFile}
            setIsSidebarCollapsed={(val) => setIsExplorerVisible(!val)}
          />
        )}
      </main>

      <CreateContentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={onConfirmCreate}
      />

      <PremiumConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      <AdminGallery
        key={gallerySessionKey}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        mediaGallery={mediaGallery}
        isGalleryLoading={isGalleryLoading}
        fetchMedia={fetchMedia}
        initialFolderPath={galleryInitialFolderPath}
        gallerySearchQuery={gallerySearchQuery}
        setGallerySearchQuery={setGallerySearchQuery}
        insertMediaLink={insertMediaLink}
        handleDeleteMedia={handleDeleteMedia}
        handleDeleteMultipleMedia={handleDeleteMultipleMedia}
        handleMoveMultipleMedia={handleMoveMultipleMedia}
        handleRenameMedia={handleRenameMedia}
        handleUpload={handleGalleryUpload}
        handleCreateFolder={handleCreateFolder}
        isPicking={!!galleryTargetField}
        activeContentTitle={frontmatter.title}
        addToast={addToast}
        setConfirmModal={setConfirmModal}
      />

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6 text-amber-500">
                <AlertCircle size={32} />
                <h3 className="text-xl font-black tracking-tight text-white">
                  {confirmDialog.title}
                </h3>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed font-medium">
                {confirmDialog.message}
              </p>
            </div>
            <div className="flex items-center gap-3 p-6 bg-white/5 border-t border-white/5">
              <button
                onClick={confirmDialog.onCancel}
                className="flex-1 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-amber-500 text-black hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10"
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 z-2100 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-4 p-5 rounded-3xl border shadow-2xl min-w-[320px] max-w-sm glass
              animate-in slide-in-from-right-10 duration-500
              ${
                toast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : toast.type === "error"
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }
            `}
          >
            {toast.type === "success" && <CheckCircle2 size={20} className="shrink-0" />}
            {toast.type === "error" && <AlertCircle size={20} className="shrink-0" />}
            {toast.type === "info" && <Info size={20} className="shrink-0" />}

            <div className="flex-1 pt-0.5">
              <p className="text-[13px] font-bold leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="p-1 hover:bg-white/10 rounded-xl transition-colors opacity-40 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {isHotkeysHelpOpen && (
        <div
          className="fixed inset-0 z-2200 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
          onClick={() => setIsHotkeysHelpOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[40px] shadow-2xl p-10 animate-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white uppercase tracking-[0.3em]">
                Горячие клавиши
              </h3>
              <button
                onClick={() => setIsHotkeysHelpOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full text-neutral-600 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Сохранить файл", keys: ["Ctrl", "S"], color: "text-amber-500" },
                { label: "Поиск файлов", keys: ["/"] },
                { label: "Предпросмотр", keys: ["Ctrl", "P"], isUpcoming: true },
              ].map((hk, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 ${hk.isUpcoming ? "opacity-30" : ""}`}
                >
                  <span className="text-[13px] font-black uppercase text-neutral-400 tracking-widest">
                    {hk.label}
                  </span>
                  <div className="flex gap-1.5">
                    {hk.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className={`px-3 py-1.5 bg-neutral-900 ${hk.color || "text-neutral-300"} rounded-xl text-[11px] font-black border border-white/10 shadow-lg min-w-10 text-center`}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 text-[9px] text-neutral-600 text-center uppercase tracking-[0.4em] font-black">
              Dr. Welnes IDE • 2026
            </p>
          </div>
        </div>
      )}

      {saveStatus === "saving" && (
        <div className="fixed inset-0 z-2300 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 animate-pulse">
              Синхронизация...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
