"use client";

import React from "react";

interface MacroWidgetProps {
  label: string;
  value: string | number;
  variant?: "default" | "highlight";
  size?: "default" | "sm";
  className?: string;
}

export function MacroWidget({
  label,
  value,
  variant = "default",
  size = "default",
  className = "",
}: MacroWidgetProps) {
  const isSm = size === "sm";
  const containerPad = isSm ? "p-1.5 md:p-1.5 lg:p-2" : "p-3";
  const labelSize = isSm
    ? "text-[9px] md:text-[7px] lg:text-[8px]"
    : "text-[8px] md:text-[10px] lg:text-xs";
  const valueSize = isSm
    ? "text-[11px] md:text-[11px] lg:text-xs"
    : "text-lg md:text-xl lg:text-2xl";

  if (variant === "highlight") {
    return (
      <div
        className={`bg-orange-500/10 rounded-xl ${containerPad} border border-orange-500/20 flex flex-col items-center justify-center relative overflow-hidden text-center min-w-[115px] md:min-w-[70px] ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
        <div
          className={`${labelSize} text-orange-500/70 font-bold uppercase tracking-[0.2em] mb-1 relative leading-none`}
        >
          {label}
        </div>
        <div
          className={`${valueSize} font-mono font-black text-orange-500 relative leading-none whitespace-nowrap`}
        >
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-black/40 rounded-xl ${containerPad} border border-white/5 flex flex-col items-center justify-center text-center min-w-[65px] md:min-w-[70px] ${className}`}
    >
      <div
        className={`${labelSize} text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1 leading-none`}
      >
        {label}
      </div>
      <div className={`${valueSize} font-mono font-bold text-white leading-none whitespace-nowrap`}>
        {value}
      </div>
    </div>
  );
}
