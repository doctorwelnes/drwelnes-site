"use client";

import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate as globalMutate } from "swr";
import {
  LogOut,
  Settings,
  Camera,
  Calculator,
  Utensils,
  ChevronRight,
  Dumbbell,
  Phone,
  Smartphone,
  UserPlus,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { fetcher, swrKeys } from "@/lib/swr";
import WorkoutCalendar from "@/components/WorkoutCalendarCompact";
import UserWorkoutBookings from "@/components/UserWorkoutBookings";
import UserWaitlist from "@/components/UserWaitlist";

interface Calculation {
  id: string;
  type: string;
  name: string;
  result: Record<string, unknown>;
  createdAt: string;
}

interface FavoriteItem {
  id: string;
  recipeId?: string;
  exerciseId?: string;
  createdAt: string;
}

interface ContentItem {
  slug: string;
  title: string;
}

interface WorkoutBookingSummary {
  slot?: {
    date?: string;
    startTime?: string;
  };
  status?: string;
}

interface DashboardUser {
  id?: string;
  name?: string | null;
  image?: string | null;
  phone?: string | null;
  telegram?: string | null;
  role?: string | null;
}

const calculatorTypes: Record<string, { icon: string; color: string; label: string; url: string }> =
  {
    BMI: {
      icon: "⚖️",
      color: "from-blue-500/20 to-blue-600/20",
      label: "ИМТ",
      url: "/calculators/bmi",
    },
    CALORIES: {
      icon: "🔥",
      color: "from-orange-500/20 to-orange-600/20",
      label: "Обмен энергии",
      url: "/calculators/tdee",
    },
    BJU: {
      icon: "🥗",
      color: "from-green-500/20 to-green-600/20",
      label: "БЖУ",
      url: "/calculators/macros",
    },
    WATER: {
      icon: "💧",
      color: "from-cyan-500/20 to-cyan-600/20",
      label: "Вода",
      url: "/calculators/water",
    },
    IDEAL_WEIGHT: {
      icon: "🎯",
      color: "from-purple-500/20 to-purple-600/20",
      label: "Вес",
      url: "/calculators/ideal-weight",
    },
  };

/** Resolve slug → title from content list (or fallback to slug) */
function resolveTitle(
  items: ContentItem[] | undefined,
  slug: string | undefined,
  fallback: string,
): string {
  if (!slug) return fallback;
  if (!items || items.length === 0) return slug.replace(/-/g, " ");
  const found = items.find((item) => item.slug === slug);
  return found?.title ?? slug.replace(/-/g, " ");
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showPhoneWarning, setShowPhoneWarning] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expandedPWA, setExpandedPWA] = useState<"ios" | "android" | null>(null);
  const [authUser, setAuthUser] = useState<DashboardUser | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const isLoggedIn = !!authUser;
  const userName = authUser?.name || "Ваше имя";
  const currentUserId = authUser?.id || "";

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as {
          user?: DashboardUser;
        } | null;
        const user = payload?.user ?? null;

        if (!isMounted) return;

        setAuthUser(user);
        setIsAuthChecked(true);

        if (!user) {
          router.replace("/login?next=/dashboard");
        }
      } catch {
        if (!isMounted) return;

        setAuthUser(null);
        setIsAuthChecked(true);
        router.replace("/login?next=/dashboard");
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleBookingSuccess = () => {
    setRefreshTrigger((prev) => prev + 1); // Обновляем список записей
  };

  const hasContact = Boolean(authUser?.phone || authUser?.telegram);

  // Force refresh favorites on mount (fixes bfcache issue)
  useEffect(() => {
    if (authUser) {
      globalMutate(swrKeys.favorites.recipes);
      globalMutate(swrKeys.favorites.exercises);
    }
  }, [authUser]);

  // --- SWR data fetching (replaces 8 useState + 3 useEffect) ---
  const { data: calcData, isLoading: isLoadingCalculations } = useSWR<{
    calculations: Calculation[];
  }>(authUser ? swrKeys.user.calculations : null, fetcher, {
    revalidateOnFocus: false,
    fallbackData: { calculations: [] },
  });

  const { data: recipeFavData, isLoading: isLoadingRecipeFavs } = useSWR<{
    favorites: FavoriteItem[];
  }>(authUser ? swrKeys.favorites.recipes : null, fetcher, {
    fallbackData: { favorites: [] },
  });

  const { data: exerciseFavData, isLoading: isLoadingExerciseFavs } = useSWR<{
    favorites: FavoriteItem[];
  }>(authUser ? swrKeys.favorites.exercises : null, fetcher, {
    fallbackData: { favorites: [] },
  });

  // Fetch workout bookings data
  const { data: bookingsData } = useSWR<WorkoutBookingSummary[]>(
    authUser ? `/api/workout-bookings?userId=${currentUserId}` : null,
    fetcher,
    {
      fallbackData: [],
    },
  );

  // Fetch content lists to resolve slug → title
  const { data: allRecipes } = useSWR<ContentItem[]>(
    recipeFavData?.favorites?.length ? "/api/content/recipes" : null,
    fetcher,
  );
  const { data: allExercises } = useSWR<ContentItem[]>(
    exerciseFavData?.favorites?.length ? "/api/content/exercises" : null,
    fetcher,
  );

  // Derived values
  const calculations = calcData?.calculations?.slice(0, 4) ?? [];
  const favoriteRecipes = recipeFavData?.favorites?.slice(0, 3) ?? [];
  const favoriteExercises = exerciseFavData?.favorites?.slice(0, 3) ?? [];
  const totalFavoriteExercises = exerciseFavData?.favorites?.length ?? 0;
  const isLoadingFavorites = isLoadingRecipeFavs || isLoadingExerciseFavs;

  const isUpcomingWorkout = (booking: WorkoutBookingSummary) => {
    if (!booking.slot?.date || !booking.slot?.startTime) return false;

    const slotDate = new Date(booking.slot.date);
    const [hours, minutes] = booking.slot.startTime.split(":").map(Number);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate > new Date();
  };

  // Calculate upcoming workouts
  const upcomingWorkouts =
    bookingsData?.filter((booking) => booking.status !== "CANCELLED" && isUpcomingWorkout(booking))
      .length ?? 0;

  if (!isAuthChecked) {
    return (
      <main className="min-h-screen bg-[#0c0d10] font-sans text-zinc-300 pb-24 md:pb-12 overflow-x-hidden">
        <div className="mx-auto max-w-2xl px-4 space-y-6 animate-in fade-in duration-1000">
          <div className="pt-4">
            <div className="h-7 w-24 rounded-xl bg-white/5 animate-pulse" />
          </div>
          <div className="h-24 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0c0d10] font-sans text-zinc-300 pb-24 md:pb-12 overflow-x-hidden">
      <div className="mx-auto max-w-2xl px-4 space-y-6 animate-in fade-in duration-1000">
        {/* Page Title */}
        <div className="pt-4">
          <h1 className="text-xl font-black italic uppercase tracking-widest text-white">
            Профиль
          </h1>
        </div>

        {/* Header Section with Avatar and Name */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-800 flex items-center justify-center">
                {authUser?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authUser.image} alt="Profile" className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center text-zinc-600">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0c0d10]" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-black italic uppercase tracking-tight text-white">
                {userName}
              </h2>
              <p className="text-xs font-bold text-zinc-500">Добро пожаловать</p>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {authUser?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs hover:bg-amber-500/20 transition-all whitespace-nowrap"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Админка</span>
              </Link>
            )}
            <button
              onClick={async () => {
                try {
                  setIsLoggingOut(true);
                  await signOut({ redirect: false });
                  router.push("/login");
                } catch {
                  router.push("/login");
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-22.5"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  <span className="hidden sm:inline">Выход...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </>
              )}
            </button>
            <Link
              href="/dashboard/settings"
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 items-stretch">
          {/* Workout Tile - Large */}
          <div
            className="relative overflow-hidden bg-linear-to-br from-[#f95700]/75 via-orange-500/75 to-[#ff8a1f]/70 border border-orange-300/20 rounded-xl p-4 text-center cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 row-span-2 flex flex-col justify-center shadow-[0_18px_45px_rgba(249,87,0,0.22)]"
            onClick={() => {
              if (!isLoggedIn) {
                setShowAuthWarning(true);
              } else if (!hasContact) {
                setShowPhoneWarning(true);
              } else {
                setIsCalendarOpen(true);
              }
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_45%)]" />
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 border border-white/15">
              {isLoggedIn ? (
                <Dumbbell className="w-5 h-5 text-white/90" />
              ) : (
                <Lock className="w-5 h-5 text-white/90" />
              )}
            </div>
            {isLoggedIn ? (
              <>
                <p className="relative z-10 text-xs font-black text-white/90 uppercase leading-tight mb-2 tracking-wide">
                  Записаться на тренировку
                </p>
                <p className="relative z-10 text-3xl font-black text-white leading-none">
                  {upcomingWorkouts}
                </p>
                <p className="relative z-10 text-[10px] font-bold text-white/70 uppercase tracking-widest mt-1">
                  Предстоящих тренировок
                </p>
              </>
            ) : (
              <>
                <p className="relative z-10 text-xs font-black text-white/90 uppercase leading-tight mb-2 tracking-wide">
                  Войти / Регистрация
                </p>
                <p className="relative z-10 text-[11px] font-semibold text-white/85 leading-snug px-1">
                  Чтобы записываться на тренировки, нужен аккаунт.
                </p>
                <p className="relative z-10 text-[10px] font-bold text-white/70 uppercase tracking-widest mt-2">
                  Нажмите, чтобы войти
                </p>
              </>
            )}
          </div>

          {/* Small Stats Column */}
          <div className="grid grid-rows-2 gap-3 h-full">
            {/* Recipes Tile - Small */}
            <div className="bg-[#16181d] border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center h-full">
              <div className="w-6 h-6 rounded-full bg-[#f95700]/10 flex items-center justify-center mx-auto mb-1">
                <Utensils className="w-3 h-3 text-[#f95700]" />
              </div>
              <p className="text-sm font-black text-white">
                {recipeFavData?.favorites?.length ?? 0}
              </p>
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                Рецептов
              </p>
            </div>

            {/* Exercises Tile - Small */}
            <div className="bg-[#16181d] border border-white/5 rounded-xl p-2 text-center flex flex-col justify-center h-full">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-1">
                <Dumbbell className="w-3 h-3 text-blue-500" />
              </div>
              <p className="text-sm font-black text-white">{totalFavoriteExercises}</p>
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                Упражнений
              </p>
            </div>
          </div>
        </div>

        {/* Workout Bookings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-500" />
              Тренировки
            </h2>
          </div>

          {isLoggedIn ? (
            <UserWorkoutBookings
              userId={currentUserId}
              refreshTrigger={refreshTrigger}
              section="preview"
              previewLimit={1}
              upcomingHref="/dashboard/workouts/upcoming"
              pastHref="/dashboard/workouts/past"
            />
          ) : (
            <div className="rounded-2xl border border-white/5 bg-[#16181d] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-white">
                    Нужен вход в аккаунт
                  </p>
                  <p className="mt-2 text-sm text-zinc-400 leading-snug">
                    Чтобы видеть тренировки, записываться на них и управлять очередью, сначала
                    войдите или зарегистрируйтесь.
                  </p>
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/login?next=/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-black uppercase tracking-widest text-black transition-colors hover:bg-orange-400"
                    >
                      <UserPlus className="h-4 w-4" />
                      Войти
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10"
                    >
                      Регистрация
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Favorite Recipes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#f95700]" />
              Избранные рецепты
            </h2>
            <Link
              href="/recipes/favorites"
              className="text-[10px] font-black uppercase tracking-widest text-[#f95700] hover:underline underline-offset-4"
            >
              Все
            </Link>
          </div>

          {isLoadingFavorites ? (
            <div className="bg-[#16181d] border border-white/5 rounded-2xl p-4 h-20 animate-pulse" />
          ) : favoriteRecipes.length > 0 ? (
            <div className="space-y-2">
              {favoriteRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.recipeId}`}
                  className="group bg-[#16181d] border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-red-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f95700]/10 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-[#f95700]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white capitalize">
                      {resolveTitle(allRecipes, recipe.recipeId, "Рецепт")}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(recipe.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-red-500" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f95700]/10 flex items-center justify-center mx-auto mb-3">
                <Utensils className="w-6 h-6 text-[#f95700]" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Нет избранных рецептов</p>
              <p className="text-xs text-zinc-500 mb-3">Сохраняйте любимые рецепты</p>
              <Link
                href="/recipes"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400"
              >
                Перейти к рецептам
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Favorite Exercises Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-500" />
              Избранные упражнения
            </h2>
            <Link
              href="/exercises/favorites"
              className="text-[10px] font-black uppercase tracking-widest text-[#f95700] hover:underline underline-offset-4"
            >
              Все
            </Link>
          </div>

          {isLoadingFavorites ? (
            <div className="bg-[#16181d] border border-white/5 rounded-2xl p-4 h-20 animate-pulse" />
          ) : favoriteExercises.length > 0 ? (
            <div className="space-y-2">
              {favoriteExercises.map((exercise) => (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.exerciseId}`}
                  className="group bg-[#16181d] border border-white/5 rounded-2xl p-4 flex items-center gap-3 hover:border-blue-500/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white capitalize">
                      {resolveTitle(allExercises, exercise.exerciseId, "Упражнение")}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {new Date(exercise.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-500" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <Dumbbell className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Нет избранных упражнений</p>
              <p className="text-xs text-zinc-500 mb-3">Сохраняйте любимые упражнения</p>
              <Link
                href="/exercises"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400"
              >
                Перейти к упражнениям
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Calculators Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-500" />
              Калькуляторы
            </h2>
            <Link
              href="/calculators"
              className="text-[10px] font-black uppercase tracking-widest text-[#f95700] hover:underline underline-offset-4"
            >
              Все
            </Link>
          </div>

          {isLoadingCalculations ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#16181d] border border-white/5 rounded-xl p-4 h-16 animate-pulse"
                />
              ))}
            </div>
          ) : calculations.length > 0 ? (
            <div className="space-y-2">
              {calculations.map((calc) => {
                const typeInfo = calculatorTypes[calc.type] || {
                  icon: "📊",
                  color: "from-zinc-500/20 to-zinc-600/20",
                  label: calc.type,
                };
                return (
                  <Link
                    key={calc.id}
                    href={typeInfo.url || "/calculators"}
                    className="group bg-[#16181d] border border-white/5 rounded-xl p-4 hover:border-orange-500/30 transition-all flex items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-linear-to-br ${typeInfo.color} flex items-center justify-center text-lg shrink-0`}
                    >
                      {typeInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-400 uppercase">
                          {typeInfo.label}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {new Date(calc.createdAt).toLocaleDateString("ru-RU")}
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-white truncate">{typeInfo.label}</p>
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-orange-500" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#16181d] border border-white/5 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                <Calculator className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-sm font-bold text-white mb-1">Нет расчетов</p>
              <p className="text-xs text-zinc-500 mb-3">Начните использовать калькуляторы</p>
              <Link
                href="/calculators"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400"
              >
                Перейти к калькуляторам
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Waitlist Section */}
        <div className="mt-8">
          {isLoggedIn ? (
            <UserWaitlist userId={currentUserId} refreshTrigger={refreshTrigger} />
          ) : (
            <div className="rounded-2xl border border-white/5 bg-[#16181d] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-500">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-white">
                    Очередь доступна после входа
                  </p>
                  <p className="mt-2 text-sm text-zinc-400 leading-snug">
                    Авторизуйтесь, чтобы видеть свои записи, очередь и возможность записаться на
                    тренировку.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Browser Install Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              Установить приложение
            </h2>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Yandex
            </div>
          </div>

          {/* iOS */}
          <div className="bg-[#16181d] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedPWA(expandedPWA === "ios" ? null : "ios")}
              className="w-full p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-base">
                  🍎
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">
                    iPhone / iPad (Яндекс Браузер)
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Меню → На экран Домой
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                    expandedPWA === "ios" ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>
            {expandedPWA === "ios" && (
              <div className="px-4 pb-4 space-y-2.5">
                {[
                  "Откройте сайт в Яндекс Браузере на iPhone или iPad",
                  "Нажмите кнопку меню внизу или сверху браузера",
                  "Выберите \u00ABНа экран Домой\u00BB или \u00ABДобавить ярлык\u00BB, если пункт доступен",
                  "Подтвердите добавление — иконка появится на рабочем столе",
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-black text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-zinc-300 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Android */}
          <div className="bg-[#16181d] border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedPWA(expandedPWA === "android" ? null : "android")}
              className="w-full p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-base">
                  🤖
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">
                    Android (Яндекс Браузер)
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Меню → Установить
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                    expandedPWA === "android" ? "rotate-90" : ""
                  }`}
                />
              </div>
            </button>
            {expandedPWA === "android" && (
              <div className="px-4 pb-4 space-y-2.5">
                {[
                  "Откройте сайт в Яндекс Браузере на Android",
                  "Нажмите меню браузера (три точки или значок меню)",
                  "Выберите \u00ABУстановить приложение\u00BB или \u00ABДобавить на главный экран\u00BB",
                  "Подтвердите установку — ярлык появится на рабочем столе",
                ].map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5"
                  >
                    <span className="w-6 h-6 rounded-full bg-orange-500 text-black text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-zinc-300 leading-snug">{step}</p>
                  </div>
                ))}
                <p className="text-[10px] text-zinc-600 pt-1">
                  Также может появиться баннер внизу браузера с предложением установить — нажмите
                  \u00ABУстановить\u00BB.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 pb-12 pt-8">
          Dr.Welnes Premium v2.1
        </div>
      </div>

      {/* Workout Calendar Modal */}
      <WorkoutCalendar
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        userId={currentUserId}
        userPhone={authUser?.phone}
        userTelegram={authUser?.telegram}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Auth Warning Modal */}
      {showAuthWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 p-4">
          <div className="bg-linear-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Войдите в аккаунт
              </h3>
              <button
                onClick={() => setShowAuthWarning(false)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-white font-medium mb-2">
                  Для записи на тренировку нужен аккаунт
                </p>
                <p className="text-zinc-400 text-sm">
                  Войдите или зарегистрируйтесь, чтобы открыть календарь тренировок, видеть записи и
                  записываться на новые слоты.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login?next=/dashboard"
                  className="flex-1 py-3 bg-orange-500 text-black rounded-xl font-black uppercase tracking-widest hover:bg-orange-400 transition-colors text-center"
                  onClick={() => setShowAuthWarning(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors text-center"
                  onClick={() => setShowAuthWarning(false)}
                >
                  Регистрация
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Warning Modal */}
      {showPhoneWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 p-4">
          <div className="bg-linear-to-b from-[#1a1d24] to-[#13151a] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Требуется контакт
              </h3>
              <button
                onClick={() => setShowPhoneWarning(false)}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-zinc-400 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-white font-medium mb-2">
                  Для записи на тренировку нужен телефон или Telegram
                </p>
                <p className="text-zinc-400 text-sm">
                  Пожалуйста, добавьте телефон или Telegram в настройках профиля для возможности
                  записи на тренировки
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPhoneWarning(false)}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/dashboard/settings";
                  }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Добавить контакт
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
