"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "outline" | "filled" | "neon";
  className?: string;
}

export function Badge({ children, variant = "outline", className = "" }: BadgeProps) {
  const baseStyles =
    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] shadow-lg transition-all";

  const variants = {
    outline: "bg-black/60 backdrop-blur-md border border-white/10 text-white",
    filled: "bg-orange-500 text-black border-orange-500",
    neon: "bg-orange-500/10 border border-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`}>{children}</div>;
}
