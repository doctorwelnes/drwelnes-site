"use client";

import React from "react";
import {
  Folder,
  File,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Image as ImageIcon,
  Trash2,
  Copy,
  Calendar,
} from "lucide-react";

export interface FileNode {
  name: string;
  title?: string;
  type: "directory" | "file";
  path: string;
  children?: FileNode[];
  lastModified?: string;
  isDraft?: boolean;
}

interface AdminSidebarProps {
  fileTree: FileNode[];
  activeFile: string | null;
  loadFile: (path: string) => void;
  handleCreateFile: () => void;
  handleDuplicate: (path: string, e: React.MouseEvent) => void;
  handleDeleteFile: (path: string, e: React.MouseEvent) => void;
  handleRenameMedia: (url: string, name: string) => void;
  isPicking?: boolean;
  isSearching: boolean;
  setIsSearching: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sidebarWidth: number;
  setSidebarWidth: (val: number) => void;
  isResizingSidebar: boolean;
  setIsResizingSidebar: (val: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean) => void;
  openGallery: (targetField?: string | null) => void;
  expandedFolders: Set<string>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function AdminSidebar({
  fileTree,
  activeFile,
  loadFile,
  handleCreateFile,
  handleDuplicate,
  handleDeleteFile,
  isSearching,
  setIsSearching,
  searchQuery,
  setSearchQuery,
  sidebarWidth,
  setIsResizingSidebar,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  openGallery,
  expandedFolders,
  setExpandedFolders,
  isPicking,
}: AdminSidebarProps) {
  const toggleFolder = (path: string) => {
    const newFolders = new Set(expandedFolders);
    if (newFolders.has(path)) newFolders.delete(path);
    else newFolders.add(path);
    setExpandedFolders(newFolders);
  };

  // Count files in directory recursively
  const countFiles = (node: FileNode): number => {
    if (node.type === "file") return 1;
    return (node.children || []).reduce((acc, child) => acc + countFiles(child), 0);
  };

  const renderTree = (nodes: FileNode[]) => {
    // Filter nodes if searching by filename
    const filteredNodes = nodes.filter((node) => {
      if (isSearching) return true; // Don't filter here if deep search is enabled (it's handled by searchMode === "content")
      if (!searchQuery.trim()) return true;

      // Keep folders if they have matching children or if folder name matches
      if (node.type === "directory") {
        const hasMatchingChild = (n: FileNode): boolean => {
          if (n.name.toLowerCase().includes(searchQuery.toLowerCase())) return true;
          if (n.children) return n.children.some((child) => hasMatchingChild(child));
          return false;
        };
        return hasMatchingChild(node);
      }

      return node.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return filteredNodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((node) => {
        const isCalculators = node.path.startsWith("calculators");
        const isExpanded = expandedFolders.has(node.path);
        const isActive = activeFile === node.path;

        if (node.type === "directory") {
          return (
            <div key={node.path} className="select-none">
              <div
                onClick={() => !isCalculators && toggleFolder(node.path)}
                className={`flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 cursor-pointer text-neutral-400 group transition-colors ${isCalculators ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
                title={isCalculators ? "Редактирование калькуляторов временно отключено" : ""}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder
                  size={14}
                  className={isExpanded ? "text-amber-500/80" : "text-neutral-600"}
                />
                <span className="text-[12px] font-bold group-hover:text-neutral-200">
                  {(() => {
                    const translations: Record<string, string> = {
                      recipes: "Рецепты",
                      exercises: "Упражнения",
                      theory: "Теория",
                      calculators: "Калькуляторы",
                    };
                    return translations[node.name] || node.name;
                  })()}
                  {isCalculators && " (Locked)"}
                </span>
                <span className="text-[10px] text-neutral-600 font-black ml-auto">
                  {countFiles(node)}
                </span>
              </div>
              {isExpanded && node.children && (
                <div className="ml-4 border-l border-white/5">{renderTree(node.children)}</div>
              )}
            </div>
          );
        }

        return (
          <div
            key={node.path}
            onClick={() => !isCalculators && loadFile(node.path)}
            onContextMenu={(e) => !isCalculators && handleDuplicate(node.path, e)}
            className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer group transition-all border-l-2 ${isCalculators ? "opacity-30 cursor-not-allowed pointer-events-none" : ""} ${isActive ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]" : "hover:bg-white/5 border-transparent text-neutral-500 hover:text-neutral-300"}`}
            title={isCalculators ? "Редактирование заблокировано" : ""}
          >
            <div className="w-4 flex items-center justify-center">
              <File
                size={14}
                className={
                  isActive ? "text-amber-500" : "text-neutral-600 group-hover:text-neutral-400"
                }
              />
            </div>
            <span
              className={`text-[12px] tracking-wide truncate flex-1 ${isActive ? "font-black" : "font-medium"}`}
            >
              {node.title || node.name.replace(".md", "")}
            </span>
            {node.isDraft && (
              <span className="text-[8px] bg-neutral-800 text-neutral-500 px-1 rounded font-bold uppercase tracking-tighter">
                Черновик
              </span>
            )}
            {!isCalculators && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => handleDuplicate(node.path, e)}
                  className="p-1 text-neutral-600 hover:text-amber-500 rounded-md hover:bg-amber-500/10"
                  title="Копировать файл"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => handleDeleteFile(node.path, e)}
                  className="p-1 text-neutral-600 hover:text-rose-500 rounded-md hover:bg-rose-500/10"
                  title="Удалить файл"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <aside
      className={`bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-all duration-300 relative group/sidebar ${isSidebarCollapsed ? "w-0 overflow-hidden border-none" : ""}`}
      style={{ width: isSidebarCollapsed ? 0 : `${sidebarWidth}px` }}
    >
      {/* Sidebar Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-5 bg-[#0d0d0d]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Settings className="text-black w-4 h-4" />
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
            Dr. Welnes Админ
          </span>
        </div>
        <button
          onClick={() => setIsSidebarCollapsed(true)}
          className="text-neutral-600 hover:text-white transition-colors"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Primary Actions */}
      <div className="p-4 space-y-3">
        <button
          onClick={handleCreateFile}
          className="w-full flex items-center justify-center gap-2 bg-neutral-900 border border-white/5 hover:border-amber-500/50 hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          Создать контент
        </button>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 group/search">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isSearching ? "text-amber-500" : "text-neutral-600 group-focus-within/search:text-amber-500"}`}
              size={14}
            />
            <input
              type="text"
              placeholder={isSearching ? "Поиск по тексту..." : "Фильтр файлов..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-[#0d0d0d] border border-white/5 rounded-xl py-2 pl-9 pr-3 text-[12px] text-neutral-300 outline-none focus:border-amber-500/30 transition-all placeholder-neutral-700
                ${isSearching ? "border-amber-500/40 ring-1 ring-amber-500/10" : ""}`}
            />
          </div>
          <button
            onClick={() => setIsSearching(!isSearching)}
            className={`p-2.5 rounded-xl border transition-all ${isSearching ? "bg-amber-500 border-amber-400 text-black shadow-lg" : "bg-[#0d0d0d] border-white/5 text-neutral-600 hover:text-white hover:border-neutral-700"}`}
            title={isSearching ? "Переключить на фильтр" : "Включить поиск по содержимому"}
          >
            <PanelLeft size={14} />
          </button>
        </div>

        <button
          onClick={() => openGallery(null)}
          className="w-full flex items-center justify-center gap-2 bg-neutral-900/50 border border-white/5 hover:bg-neutral-900 text-neutral-600 hover:text-neutral-300 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all h-10"
        >
          <ImageIcon size={14} />
          Медиатека
        </button>

        <button
          onClick={() => (window.location.href = "/admin/workout-planning")}
          className="w-full flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-500 hover:text-orange-400 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all h-10"
        >
          <Calendar size={14} />
          Планирование тренировок
        </button>

        <button
          onClick={() => (window.location.href = "/admin/workouts")}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all h-10"
        >
          <Calendar size={14} />
          Дашборд тренировок
        </button>
      </div>

      {/* File Explorer */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-8">
        <h2 className="text-sm font-black text-neutral-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          {isPicking ? "Выберите файл" : "Медиатека"}
        </h2>
        {renderTree(fileTree)}
      </div>

      {/* Resizer Sidebar */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-amber-500/30 z-[100]"
        onMouseDown={() => setIsResizingSidebar(true)}
      />
    </aside>
  );
}
