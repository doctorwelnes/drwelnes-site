"use client";

import React from "react";

export interface RecipeCardSkeletonProps {
  count?: number;
}

export function RecipeCardSkeleton({ count = 1 }: RecipeCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group flex flex-col relative bg-[#13151a] border border-white/5 rounded-[32px] overflow-hidden h-full animate-pulse"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-video overflow-hidden shrink-0 bg-[#0a0c0e]">
            <div className="w-full h-full bg-zinc-800/50" />

            {/* Category Badge Skeleton */}
            <div className="absolute top-4 left-4">
              <div className="h-6 w-20 bg-zinc-800/70 rounded-full" />
            </div>

            {/* Favorite Button Skeleton */}
            <div className="absolute top-4 right-4 w-10 h-10 bg-zinc-800/70 rounded-xl" />
          </div>

          {/* Content Skeleton */}
          <div className="flex flex-col flex-1 relative p-4 pt-3 md:p-8 md:pt-4">
            {/* Title Skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-zinc-800/70 rounded w-3/4 md:w-full" />
              <div className="hidden md:block h-4 bg-zinc-800/70 rounded w-2/3" />
            </div>

            {/* Macros Grid Skeleton */}
            <div className="grid grid-cols-3 gap-2 mb-4 md:mb-8 md:gap-3">
              <div className="bg-zinc-800/50 rounded-lg h-12 md:h-16" />
              <div className="bg-zinc-800/50 rounded-lg h-12 md:h-16" />
              <div className="bg-zinc-800/50 rounded-lg h-12 md:h-16" />
            </div>

            {/* Button Skeleton */}
            <div className="w-full bg-zinc-800/50 rounded-xl h-9 md:h-14" />
          </div>
        </div>
      ))}
    </>
  );
}

export default RecipeCardSkeleton;
