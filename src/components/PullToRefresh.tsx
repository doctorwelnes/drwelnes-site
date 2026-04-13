"use client";

import { ReactNode } from "react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function PullToRefresh({ children }: PullToRefreshProps) {
  // Completely disabled - just renders children
  return <>{children}</>;
}
