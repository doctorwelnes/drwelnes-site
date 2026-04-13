"use client";

import React from "react";
import {
  Activity,
  ChevronRight,
  PanelLeft,
  Edit,
  ExternalLink,
} from "lucide-react";

interface AdminStatsProps {
  stats: {
    recipes: number;
    theory: number;
    calculators: number;
    exercises: number;
    total: number;
    published: number;
    readiness: number;
  };
  recentFiles: { path: string; name: string; mtime: string }[];
  loadFile: (path: string) => void;
  setIsSidebarCollapsed: (v: boolean) => void;
}

export function AdminStats({
  stats,
  recentFiles,
  loadFile,
  setIsSidebarCollapsed,
}: AdminStatsProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#080808] p-8 lg:p-12 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Контрольная панель
            </h1>
            <p className="text-neutral-500 font-medium">
              Добро пожаловать в Dr.Welnes CMS. Готовы создавать контент?
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="flex items-center gap-2 px-5 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-all shadow-xl active:scale-95"
            >
              <PanelLeft className="w-4 h-4 text-amber-500" />
              Проводник
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          {[
            { label: "Рецептов", value: stats.recipes, icon: "🥗", color: "from-amber-500/20" },
            { label: "Теории", value: stats.theory, icon: "📖", color: "from-blue-500/20" },
            {
              label: "Калькуляторов",
              value: stats.calculators,
              icon: "🧮",
              color: "from-rose-500/20",
            },
            {
              label: "Упражнений",
              value: stats.exercises,
              icon: "🏋",
              color: "from-emerald-500/20",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`bg-[#0d0d0d] border border-white/5 p-6 rounded-[32px] relative overflow-hidden group hover:border-white/10 transition-all shadow-2xl`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative z-10 flex flex-col gap-4">
                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                  {stat.icon}
                </span>
                <div>
                  <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">
                    {stat.label}
                  </div>
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Readiness Section */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="bg-[#0d0d0d] border border-white/5 rounded-[40px] p-8 lg:p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Готовность контента
                  </h3>
                  <div className="flex items-center gap-2 bg-neutral-900 border border-white/5 px-4 py-2 rounded-xl text-amber-500 text-xs font-black">
                    <Activity className="w-4 h-4" />
                    {stats.readiness}% REALIZED
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="h-6 bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-1 relative shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.3)] relative"
                      style={{ width: `${stats.readiness}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress_1s_linear_infinite]" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {stats.published} Опубликовано
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                      <span className="w-2 h-2 rounded-full bg-neutral-800" />
                      {stats.total - stats.published} Черновика
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors">
                <Edit className="w-5 h-5 text-neutral-600 mb-3" />
                <h4 className="text-neutral-300 font-bold text-sm mb-1 uppercase tracking-wider">
                  Быстрый старт
                </h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Используйте горячую клавишу <b>&quot;/&quot;</b> для быстрого фокуса на поиске в проводнике.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/5 hover:border-white/10 transition-colors">
                <ExternalLink className="w-5 h-5 text-neutral-600 mb-3" />
                <h4 className="text-neutral-300 font-bold text-sm mb-1 uppercase tracking-wider">
                  Сохранение
                </h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Нажмите <b>Ctrl + S</b> для мгновенного сохранения изменений.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Files Sidebar-like Section */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <div className="bg-[#0d0d0d] border border-white/5 rounded-[40px] p-8 shadow-2xl h-full">
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] mb-8">
                Последние правки
              </h3>
              <div className="space-y-4">
                {recentFiles.map((file, i) => (
                  <div
                    key={i}
                    onClick={() => loadFile(file.path)}
                    className="flex justify-between items-center group cursor-pointer border-b border-white/5 pb-4 last:border-none last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-neutral-300 group-hover:text-amber-500 transition-colors truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-neutral-600 font-medium uppercase tracking-widest mt-1">
                        {file.mtime}
                      </div>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-neutral-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
