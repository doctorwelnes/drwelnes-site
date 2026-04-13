"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Dumbbell } from "lucide-react";
import type { Exercise } from "@/lib/content";

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}

const ExerciseCard = memo(function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
}: ExerciseCardProps) {
  const getDifficultyBars = (difficulty: string | undefined) => {
    if (!difficulty) return 1;
    const d = difficulty.toLowerCase();
    if (d.includes("легк") || d.includes("нач") || d.includes("low")) return 1;
    if (d.includes("средн") || d.includes("med")) return 2;
    if (
      d.includes("сложн") ||
      d.includes("продв") ||
      d.includes("тяжел") ||
      d.includes("высок") ||
      d.includes("hard") ||
      d.includes("high")
    )
      return 3;
    return 1;
  };

  const bars = getDifficultyBars(exercise.difficulty);

  return (
    <div className="group flex flex-col relative bg-[#13151a] border border-white/5 rounded-[32px] overflow-hidden hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-full">
      {/* Card Image */}
      <Link
        href={`/exercises/${exercise.slug}`}
        className="relative h-70 overflow-hidden shrink-0 bg-[#0a0c0e] block"
      >
        {exercise.image ? (
          <Image
            src={exercise.image}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            style={{
              objectPosition: `${exercise.imagePositionX ?? 50}% ${exercise.imagePositionY ?? 50}%`,
            }}
            alt={exercise.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-12 h-12 text-zinc-800" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#13151a] to-transparent" />

        <div
          role="button"
          tabIndex={0}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            onToggleFavorite(exercise.slug);
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggleFavorite(exercise.slug);
            }
          }}
          className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-md border transition-all hover:scale-110 active:scale-95 cursor-pointer ${
            isFavorite
              ? "bg-orange-500/20 border-orange-500 text-orange-500"
              : "bg-black/50 border-white/10 text-white hover:bg-orange-500/50 hover:border-orange-500"
          }`}
          aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-orange-500" : ""}`} />
        </div>
      </Link>

      <div className="flex flex-col flex-1 relative p-4 pt-3 pb-3.5 md:p-8 md:pt-4 md:pb-2">
        {/* Neon Line */}
        <div className="absolute top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity left-4 right-4 md:left-8 md:right-8" />
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1">
            {exercise.difficulty && (
              <span className="flex items-center gap-2 mb-2">
                <div className="flex items-end gap-0.5 h-3">
                  <div
                    className={`w-1 rounded-[1px] ${bars >= 1 ? "h-1.5 bg-orange-500" : "h-1.5 bg-zinc-700/50"}`}
                  />
                  <div
                    className={`w-1 rounded-[1px] ${bars >= 2 ? "h-2 bg-orange-500" : "h-2 bg-zinc-700/50"}`}
                  />
                  <div
                    className={`w-1 rounded-[1px] ${bars >= 3 ? "h-3 bg-orange-500" : "h-3 bg-zinc-700/50"}`}
                  />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                  {exercise.difficulty}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-bold text-white uppercase tracking-tighter italic leading-tight text-base md:text-lg group-hover:text-orange-500 transition-colors">
            {exercise.title}
          </h2>
          {exercise.description && (
            <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2">
              {exercise.description}
            </p>
          )}
        </div>

        <div className="pt-4 mt-auto border-t border-white/5 grid grid-flow-col auto-cols-max gap-2 overflow-hidden relative">
          {/* Gradient fade effect for overflow */}
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#13151a] to-transparent pointer-events-none" />

          {exercise.muscles?.map((m) => (
            <span
              key={m}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-500 shadow-lg shrink-0"
            >
              <div className="w-1 h-1 rounded-full bg-orange-500/50" />
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ExerciseCard;
