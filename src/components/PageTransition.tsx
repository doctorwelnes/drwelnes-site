"use client";

import { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  return <div className="flex-1 flex flex-col w-full">{children}</div>;
}
