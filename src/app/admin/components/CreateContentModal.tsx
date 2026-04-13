"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  ChefHat, 
  BookOpen, 
  Dumbbell, 
  Calculator, 
  Check,
  ChevronRight,
  Sparkles
} from "lucide-react";

interface CreateContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { title: string; category: string; slug: string }) => void;
}

const CATEGORIES = [
  { id: "recipes", name: "Рецепт", icon: ChefHat, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "theory", name: "Статья", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "exercises", name: "Упражнение", icon: Dumbbell, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "calculators", name: "Калькулятор", icon: Calculator, color: "text-purple-500", bg: "bg-purple-500/10" },
];

export function CreateContentModal({ isOpen, onClose, onConfirm }: CreateContentModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("recipes");
  const [slug, setSlug] = useState("");
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  const getGeneratedSlug = (val: string) => {
    if (!val) return "";
    const generated = val
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50);
    
    // Simple transliteration for Russian characters
    const ru: Record<string, string> = {
      'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'e', 'ж':'j', 'з':'z', 'и':'i', 'й':'y', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o', 'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c', 'ч':'ch', 'ш':'sh', 'щ':'shch', 'ы':'y', 'э':'e', 'ю':'yu', 'я':'ya'
    };
    
    return generated.split('').map(char => ru[char] || char).join('');
  };

  const currentSlug = isAutoSlug ? getGeneratedSlug(title) : slug;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Sparkles className="text-black w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Создание контента</h2>
              <p className="text-neutral-500 text-sm">Выберите тип и заполните детали</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Category Selection */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const isLocked = cat.id === "calculators";
              return (
                <button
                  key={cat.id}
                  disabled={isLocked}
                  onClick={() => setCategory(cat.id)}
                  className={`relative p-4 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-3 group
                    ${isLocked ? "opacity-30 cursor-not-allowed grayscale" : ""}
                    ${category === cat.id 
                      ? `bg-[#151515] border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.05)]` 
                      : "bg-neutral-900/50 border-white/5 hover:border-white/10"}`}
                  title={isLocked ? "Создание калькуляторов временно отключено" : ""}
                >
                  <div className={`w-12 h-12 ${cat.bg} rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                    <cat.icon size={24} />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${category === cat.id ? "text-amber-500" : "text-neutral-500"}`}>
                    {cat.name} {isLocked && "(Lock)"}
                  </span>
                  {category === cat.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-1">
                Заголовок <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Например: Полезный завтрак..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full bg-[#151515] border rounded-2xl py-4 px-6 text-white outline-none transition-all placeholder-neutral-700 ${!title ? "border-rose-500/20" : "border-white/5 focus:border-amber-500/40"}`}
              />
            </div>

            {/* Slug Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
                  URL (Slug)
                </label>
                <button 
                  onClick={() => setIsAutoSlug(!isAutoSlug)}
                  className={`text-[9px] font-black uppercase tracking-wider transition-colors ${isAutoSlug ? "text-amber-500" : "text-neutral-600 hover:text-neutral-400"}`}
                >
                  {isAutoSlug ? "Авто-генерация ВКЛ" : "Ручной ввод"}
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 text-sm pointer-events-none group-focus-within:text-amber-500/50 transition-colors">
                  /{category}/
                </div>
                <input
                  type="text"
                  readOnly={isAutoSlug}
                  value={currentSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={`w-full bg-[#151515] border border-white/5 focus:border-amber-500/40 rounded-2xl py-4 pl-[calc(2rem+${category.length * 8}px)] pr-6 text-neutral-400 outline-none transition-all ${isAutoSlug ? "cursor-default opacity-80" : "focus:text-white"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-neutral-900/30 border-t border-white/5 flex items-center justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl text-sm font-bold text-neutral-500 hover:text-white transition-all"
          >
            Отмена
          </button>
          <button 
            onClick={() => onConfirm({ title, category, slug: `${category}/${currentSlug}.md` })}
            disabled={!title || !currentSlug}
            className="px-10 py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black rounded-[1.2rem] font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(245,158,11,0.2)] transition-all flex items-center gap-2 group"
          >
            Создать
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
