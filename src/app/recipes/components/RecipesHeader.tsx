"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function RecipesHeader({ totalCount }: { totalCount: number }) {
  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-2 group">
        <div className="p-2 rounded-xl bg-white/5 border border-white/5 group-hover:border-orange-500/30 transition-all">
          <ChevronRight className="w-3 h-3 rotate-180 text-orange-500" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 group-hover:text-white transition-colors">
          На главную
        </span>
      </Link>
      <div className="space-y-1">
        <h1 className="font-black text-white uppercase tracking-tighter italic leading-none text-2xl md:text-4xl lg:text-5xl xl:text-6xl">
          Рецепты
        </h1>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="h-[2px] bg-orange-500 rounded-full w-6 md:w-8" />
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[8px] md:text-[10px] lg:text-xs">
            <span className="text-orange-500">{totalCount}</span> ПП РЕЦЕПТОВ
          </p>
        </div>
      </div>
    </div>
  );
}
