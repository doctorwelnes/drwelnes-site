"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Utensils, Dumbbell, Calendar, Calculator, User } from "lucide-react";

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setOpen(false)}
      />

      <Command
        className="w-full max-w-2xl bg-[#0c0d10] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10 flex flex-col font-sans"
        shouldFilter={true}
      >
        <div className="flex items-center px-4 border-b border-white/5" cmdk-input-wrapper="">
          <Search className="w-5 h-5 text-zinc-500 mr-2 shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Искать рецепты, упражнения, теорию (Cmd+K)..."
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-white placeholder:text-zinc-500 py-4"
          />
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-2 py-0.5 text-[10px] font-sans font-medium text-zinc-400 bg-white/5 rounded border border-white/10">
              esc
            </kbd>
          </div>
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          <Command.Empty className="py-6 text-center text-sm text-zinc-500">
            Ничего не найдено.
          </Command.Empty>

          <Command.Group
            heading="Разделы"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            <Command.Item
              onSelect={() => runCommand(() => router.push("/recipes"))}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white rounded-xl aria-selected:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Utensils className="w-4 h-4 text-zinc-400" />
              Рецепты
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/exercises"))}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white rounded-xl aria-selected:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Dumbbell className="w-4 h-4 text-zinc-400" />
              Упражнения
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/theory"))}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white rounded-xl aria-selected:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Calendar className="w-4 h-4 text-zinc-400" />
              Теория
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/calculators"))}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white rounded-xl aria-selected:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <Calculator className="w-4 h-4 text-zinc-400" />
              Калькуляторы
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading="Профиль"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-zinc-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider mt-2"
          >
            <Command.Item
              onSelect={() => runCommand(() => router.push("/admin"))}
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-white rounded-xl aria-selected:bg-white/10 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <User className="w-4 h-4 text-orange-500" />
              Профиль
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
