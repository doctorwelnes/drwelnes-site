"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ShieldCheck,
  RefreshCw,
  Mail,
  Phone,
  MessageSquare,
  Users,
  Trash2,
  Loader2,
} from "lucide-react";

type AdminUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  telegram?: string | null;
  role: string;
  image?: string | null;
  createdAt: string;
};

export default function AdminUsersWidget() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch users");
      }

      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalUsers = useMemo(() => users.length, [users]);
  const adminUsers = useMemo(() => users.filter((user) => user.role === "ADMIN").length, [users]);
  const currentUserId = session?.user?.id;

  const handleDeleteUser = useCallback(async (user: AdminUser) => {
    const confirmed = window.confirm(
      `Удалить пользователя ${user.name || user.email || user.phone || user.id}? Это действие нельзя отменить.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Не удалось удалить пользователя");
      }

      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== user.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Не удалось удалить пользователя",
      );
    } finally {
      setDeletingUserId(null);
    }
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111217] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
            Пользователи
          </p>
          <h3 className="text-lg font-black text-white">Все пользователи системы</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Всего: {totalUsers} · Админов: {adminUsers}
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black uppercase tracking-widest text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Обновить
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-500">
          Загрузка пользователей...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-zinc-500">
          Пользователи не найдены
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-white/10 bg-[#111217] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.25)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f95700]/10 border border-[#f95700]/20 text-[#f95700]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-white">
                      {user.name || "Без имени"}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${
                    user.role === "ADMIN"
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                      : "border-white/10 bg-white/5 text-zinc-300"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {user.role}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-zinc-300">
                {user.email && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                    <Mail className="h-4 w-4 shrink-0 text-[#f95700]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                    <Phone className="h-4 w-4 shrink-0 text-[#f95700]" />
                    <span className="truncate">{user.phone}</span>
                  </div>
                )}
                {user.telegram && (
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                    <MessageSquare className="h-4 w-4 shrink-0 text-[#f95700]" />
                    <span className="truncate">{user.telegram}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                {user.id === currentUserId ? (
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                    Это вы
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">
                    Пользователь
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteUser(user)}
                  disabled={deletingUserId === user.id || user.id === currentUserId}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-300 transition-colors hover:bg-red-500/15 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingUserId === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
