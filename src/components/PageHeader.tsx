"use client";
// Version 1.1.2 - Forced Refresh Header

import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { pluralize } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  countValue?: number;
  pluralLabels?: [string, string, string]; // [один, два, пять] - e.g. ["РЕЦЕПТ", "РЕЦЕПТА", "РЕЦЕПТОВ"]
  countValueSuffix?: string;
  countLabel?: string; // Legacy fallback
  icon: LucideIcon;
  accentColor?: string; // e.g. "orange", "blue", "amber"
}

export default function PageHeader({
  title,
  subtitle,
  countValue,
  pluralLabels,
  countValueSuffix,
  countLabel,
  icon: Icon,
  accentColor = "orange",
}: PageHeaderProps) {
  const resolvedLabel =
    pluralLabels && countValue !== undefined ? pluralize(countValue, ...pluralLabels) : countLabel;
  const colors: Record<string, string> = {
    orange: "from-orange-500 bg-[#f95700]",
    blue: "from-blue-500 bg-blue-500",
    amber: "from-amber-500 bg-amber-500",
    purple: "from-purple-500 bg-purple-500",
    green: "from-emerald-500 bg-emerald-500",
    red: "from-red-500 bg-red-500",
  };

  const currentColors = colors[accentColor] || colors.orange;

  const textColors: Record<string, string> = {
    orange: "text-orange-500",
    blue: "text-blue-500",
    amber: "text-amber-500",
    purple: "text-purple-500",
    green: "text-emerald-500",
    red: "text-red-500",
  };

  const currentTextColor = textColors[accentColor] || textColors.orange;

  return (
    <header className="relative overflow-hidden bg-[#16181d] rounded-[16px] md:rounded-[32px] border border-white/10 shadow-2xl mb-6 md:mb-8 group p-3 md:p-5">
      {/* Background Mesh Blobs (Local to header) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-1/2 -right-1/4 w-full h-full opacity-10 blur-[100px] rounded-full ${currentColors.split(" ")[1]}`}
        />
        <div
          className={`absolute -bottom-1/2 -left-1/4 w-1/2 h-full opacity-5 blur-[80px] rounded-full ${currentColors.split(" ")[1]}`}
        />
      </div>

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent blur-sm" />

      {/* Bottom gradient line - identical to top */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent blur-sm" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-8">
        <div className="space-y-3 md:space-y-4 lg:space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 group/back">
            <div
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 border border-white/5 group-hover/back:border-white/20 transition-all ${currentTextColor}`}
            >
              <ChevronRight className="rotate-180 w-2.5 h-2.5 md:w-3 md:h-3" />
            </div>
            <span
              className={`font-black uppercase tracking-[0.2em] text-zinc-600 group-hover/back:text-white transition-colors text-[9px] md:text-[10px]`}
            >
              На главную
            </span>
          </Link>

          <div className="space-y-1.5">
            <h1
              className={`font-black text-white uppercase tracking-tighter italic leading-[1.1] break-words hyphens-auto text-2xl sm:text-3xl md:text-4xl lg:text-5xl sm:leading-none`}
            >
              {title}
            </h1>

            <div className="flex items-center gap-3">
              <div className={`h-[2px] w-8 rounded-full ${currentColors.split(" ")[1]}`} />
              <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4`}>
                {(resolvedLabel || countLabel) && countValue !== undefined && (
                  <p
                    className={`text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs`}
                  >
                    <span className={currentTextColor}>{countValue}</span>{" "}
                    {countValueSuffix && <span className="mr-1">{countValueSuffix}</span>}
                    {resolvedLabel || countLabel}
                  </p>
                )}
                {subtitle && (
                  <p
                    className={`text-zinc-600 font-bold uppercase tracking-[0.2em] border-l border-white/10 pl-4 hidden sm:block text-[10px] md:text-xs`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={`shrink-0 h-full flex items-center hidden sm:flex`}>
          <div className="p-1 rounded-[20px] relative overflow-hidden opacity-20 rotate-12">
            <Icon className={`w-24 h-24 ${currentTextColor} opacity-30`} />
          </div>
        </div>
      </div>
    </header>
  );
}
