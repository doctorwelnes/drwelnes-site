"use client";

import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  User,
  Phone,
  MessageCircle,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  // Profile states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);

  // Загружаем данные из сессии после монтирования компонента
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setPhone(session.user.phone || "");
      setTelegram(session.user.telegram || "");
    }
  }, [session]);

  const formatTelegram = (value: string) => {
    const cleaned = value.replace(/[^\w@]/g, "").slice(0, 32);
    if (!cleaned) return "";
    return cleaned.startsWith("@") ? cleaned : `@${cleaned}`;
  };

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelegram(formatTelegram(e.target.value));
  };

  // Автоматическая подстановка +7 и форматирование телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Если поле пустое и пользователь начинает вводить цифру, добавляем +7
    if (!phone && value && !value.startsWith("+")) {
      // Убираем все нецифровые символы и оставляем только цифры
      const digits = value.replace(/\D/g, "");
      if (digits) {
        value = "+7" + digits;
      }
    }

    // Форматируем телефон
    const formattedValue = formatPhoneNumber(value);
    setPhone(formattedValue);
  };

  // Функция форматирования телефона
  const formatPhoneNumber = (value: string) => {
    // Убираем все нецифровые символы
    const digits = value.replace(/\D/g, "");

    // Если нет цифр, возвращаем пустую строку
    if (!digits) return "";

    // Если начинается не с 7, добавляем 7
    let cleanDigits = digits;
    if (cleanDigits.length > 0 && !cleanDigits.startsWith("7")) {
      cleanDigits = "7" + cleanDigits;
    }

    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    cleanDigits = cleanDigits.slice(0, 11);

    // Форматируем: +7 (XXX) XXX-XX-XX
    if (cleanDigits.length === 1) {
      return `+${cleanDigits}`;
    } else if (cleanDigits.length <= 4) {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1)}`;
    } else if (cleanDigits.length <= 7) {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4)}`;
    } else if (cleanDigits.length <= 9) {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7)}`;
    } else {
      return `+${cleanDigits.slice(0, 1)} (${cleanDigits.slice(1, 4)}) ${cleanDigits.slice(4, 7)}-${cleanDigits.slice(7, 9)}-${cleanDigits.slice(9, 11)}`;
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      "Удалить профиль? Это действие нельзя отменить, а все ваши данные будут удалены.",
    );

    if (!confirmed) {
      return;
    }

    setIsDeletingProfile(true);
    setProfileError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Ошибка удаления профиля");
      }

      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Ошибка удаления профиля");
      setIsDeletingProfile(false);
    }
  };

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Upload states
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(session?.user?.image || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError("");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/user/avatar", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Ошибка загрузки");
        }

        const data = await response.json();

        // Update session with new image
        await update({ image: data.imageUrl });
        setCurrentAvatar(data.imageUrl);
        setPreviewImage(null);
      } catch {
        setUploadError("Ошибка загрузки фото");
        setPreviewImage(null);
      } finally {
        setIsUploading(false);
      }
    },
    [update],
  );

  const handlePhotoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentAvatar || session?.user?.image) {
      setShowPhotoMenu(!showPhotoMenu);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleDeletePhoto = async () => {
    setShowPhotoMenu(false);
    try {
      const response = await fetch("/api/user/avatar", { method: "DELETE" });
      if (response.ok) {
        setCurrentAvatar(null);
        setPreviewImage(null);
        await update({ image: null });
      }
    } catch {
      // Silent fail for delete error
    }
  };

  const handleChangePhoto = () => {
    setShowPhotoMenu(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Пожалуйста, выберите изображение");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Файл слишком большой (макс. 5MB)");
        return;
      }

      setUploadError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      handleUpload(file);
    },
    [handleUpload],
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, telegram }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка сохранения");
      }

      // Update session
      await update({ name, phone, telegram });
      router.refresh();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Ошибка сохранения профиля");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Новые пароли не совпадают");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Пароль должен быть не менее 6 символов");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка смены пароля");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Ошибка смены пароля");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0c0d10] font-sans text-zinc-300 pb-24 md:pb-12">
      <div className="mx-auto max-w-2xl px-4 space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-xl font-black italic uppercase tracking-tight text-white">
              НАСТРОЙКИ
            </h1>
            <p className="text-xs font-bold text-zinc-500">Управление профилем</p>
          </div>
        </div>

        {/* Profile Photo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500/30 shadow-2xl bg-zinc-800 flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={handlePhotoClick}
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : currentAvatar || session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentAvatar || session?.user?.image || ""}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center text-zinc-600">
                  <Camera className="w-8 h-8" />
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-400 transition-colors disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-black" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Photo Modal */}
          {showPhotoMenu && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowPhotoMenu(false)}
            >
              <div
                className="bg-[#16181d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden w-full max-w-sm animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-black uppercase tracking-wider text-white">
                    Фото профиля
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Управление фотографией</p>
                </div>

                {/* Modal Body */}
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleChangePhoto();
                    }}
                    className="w-full px-4 py-4 text-left text-sm text-white hover:bg-white/5 flex items-center gap-3 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold">Изменить фото</p>
                      <p className="text-xs text-zinc-500">Загрузить новое изображение</p>
                    </div>
                  </button>

                  <div className="h-px bg-white/5 mx-4" />

                  <button
                    type="button"
                    onClick={() => {
                      handleDeletePhoto();
                    }}
                    className="w-full px-4 py-4 text-left text-sm text-red-400 hover:bg-red-500/5 flex items-center gap-3 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold">Удалить фото</p>
                      <p className="text-xs text-zinc-500">Удалить текущее фото</p>
                    </div>
                  </button>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowPhotoMenu(false)}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-500">Нажмите для загрузки фото</p>
          {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        </div>

        {/* Profile Form */}
        <div className="bg-[#16181d] border border-white/5 rounded-4xl p-6 shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-500" />
            Данные профиля
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Имя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[18px] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Телефон
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (999) 999-99-99"
                  className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[18px] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Telegram
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  value={telegram}
                  onChange={handleTelegramChange}
                  placeholder="@username"
                  className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[18px] py-4 pl-12 pr-4 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/5 transition-all"
                />
              </div>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Профиль сохранен!
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="w-full h-12 rounded-[18px] bg-orange-500 text-black font-black uppercase tracking-widest text-xs hover:bg-orange-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить изменения
                </>
              )}
            </button>
          </form>
        </div>

        {/* Password Change Form */}
        <div className="bg-[#16181d] border border-white/5 rounded-4xl p-6 shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <Lock className="w-4 h-4 text-orange-500" />
            Изменить пароль
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Текущий пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[18px] py-4 pl-12 pr-12 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-500 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Новый пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[18px] py-4 pl-12 pr-12 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-500 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  className="w-full bg-[#0c0d10]/50 border border-white/5 rounded-[18px] py-4 pl-12 pr-12 text-sm font-bold text-white placeholder:text-zinc-800 outline-none focus:border-orange-500/30 focus:ring-2 focus:ring-orange-500/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-orange-500 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Пароль изменен!
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full h-12 rounded-[18px] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:border-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Изменение...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Изменить пароль
                </>
              )}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/10 rounded-4xl p-6 shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-300 mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" />
            Удаление профиля
          </h2>
          <p className="text-sm text-zinc-400 leading-6">
            После удаления аккаунта все ваши данные будут удалены из системы. Это действие
            необратимо.
          </p>

          <button
            type="button"
            onClick={handleDeleteProfile}
            disabled={isDeletingProfile}
            className="mt-4 w-full h-12 rounded-[18px] bg-red-500/10 border border-red-500/20 text-red-300 font-black uppercase tracking-widest text-xs hover:bg-red-500/15 hover:border-red-400/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeletingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Удалить профиль
              </>
            )}
          </button>
        </div>

        <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 pb-12">
          Dr.Welnes Premium v2.1
        </div>
      </div>
    </main>
  );
}
