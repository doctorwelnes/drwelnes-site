"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Dumbbell, ChevronLeft, Heart, Trash2, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface FavoriteExercise {
  id: string;
  exerciseId: string;
  createdAt: string;
  exercise?: {
    title: string;
    category: string;
  };
}

export default function FavoriteExercisesPage() {
  const [favorites, setFavorites] = useState<FavoriteExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: FavoriteExercise | null;
  }>({
    isOpen: false,
    item: null,
  });

  useEffect(() => {
    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites/exercises");
        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
        }
      } catch (error) {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    }
    loadFavorites();
  }, []);

  async function removeFavorite(id: string, title?: string) {
    try {
      const response = await fetch(`/api/favorites/exercises?exerciseId=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.exerciseId !== id));
        toast.success("Упражнение удалено", {
          description: `"${title || "Упражнение"}" удалено из избранного`,
        });
      }
    } catch (error) {
      toast.error("Ошибка удаления", {
        description: "Не удалось удалить упражнение из избранного",
      });
    }
  }

  function confirmDelete(item: FavoriteExercise) {
    setDeleteModal({ isOpen: true, item });
  }

  function handleConfirmDelete() {
    if (deleteModal.item) {
      removeFavorite(deleteModal.item.exerciseId, deleteModal.item.exercise?.title);
      setDeleteModal({ isOpen: false, item: null });
    }
  }

  function handleCancelDelete() {
    setDeleteModal({ isOpen: false, item: null });
  }

  return (
    <main className="min-h-screen bg-[#0c0d10] font-sans text-zinc-300 pb-24 md:pb-12">
      <div className="mx-auto max-w-2xl px-4 space-y-6">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white transition-colors pt-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Назад в кабинет
        </Link>

        {/* Header */}
        <div className="bg-[#16181d] border border-white/10 rounded-xl p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tight text-white">
                Избранные упражнения
              </h1>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {favorites.length}{" "}
                {favorites.length === 1
                  ? "упражнение"
                  : favorites.length < 5
                    ? "упражнения"
                    : "упражнений"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#16181d] border border-white/5 rounded-xl p-4 h-20 animate-pulse"
              />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-3">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="group bg-[#16181d] border border-white/5 rounded-xl p-4 flex items-center gap-3 hover:border-blue-500/30 transition-all"
              >
                <Link
                  href={`/exercises/${fav.exerciseId}`}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {fav.exercise?.title || `Упражнение ${fav.exerciseId}`}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {fav.exercise?.category || "Избранное"} •{" "}
                      {new Date(fav.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => confirmDelete(fav)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  aria-label="Удалить из избранного"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#16181d] border border-white/5 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-white mb-2">Нет избранных упражнений</p>
            <p className="text-sm text-zinc-500 mb-4">Сохраняйте любимые упражнения в избранное</p>
            <Link
              href="/exercises"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-black font-bold text-sm rounded-lg hover:bg-orange-400 transition-colors"
            >
              <Dumbbell className="w-4 h-4" />
              Перейти к упражнениям
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelDelete}
          />
          <div className="relative bg-[#16181d] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <button
              onClick={handleCancelDelete}
              className="absolute top-4 right-4 p-1 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">Удалить из избранного?</h3>
              <p className="text-sm text-zinc-400 mb-6">
                "{deleteModal.item?.exercise?.title || "Упражнение"}" будет удалено из вашего списка
                избранного
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 font-bold text-sm rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
