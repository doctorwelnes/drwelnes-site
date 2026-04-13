"use client";

import { X, Calendar, User, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");

  // Категории консультаций
  const categories = [
    { id: "personal", name: "Персональные тренировки", icon: "🏃", color: "text-blue-400" },
    { id: "group", name: "Групповые программы", icon: "👥", color: "text-green-400" },
    { id: "nutrition", name: "Консультации питания", icon: "🥗", color: "text-orange-400" },
    { id: "recovery", name: "Восстановление", icon: "💪", color: "text-purple-400" },
    { id: "other", name: "Другое", icon: "📝", color: "text-gray-400" },
  ];

  // Форматирование телефона и Telegram
  const formatContact = (value: string) => {
    // Убираем все нецифровые символы и не буквы
    const cleanValue = value.replace(/[^\d+a-zA-Z_@+]/g, "");

    // Если начинаются с букв - это Telegram username
    if (/^[a-zA-Z_@]/.test(cleanValue) && !/^\+?\d/.test(cleanValue)) {
      // Форматирование для Telegram username
      return cleanValue.startsWith("@") ? cleanValue : "@" + cleanValue;
    }

    // Если начинаются с цифр - это телефон
    if (/^\+?\d/.test(cleanValue)) {
      return formatPhoneNumber(value);
    }

    return value;
  };

  // Форматирование телефона как в профиле
  const formatPhoneNumber = (phone: string) => {
    // Убираем все нецифровые символы
    const digits = phone.replace(/\D/g, "");

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

  const contactMaxLength = contact.startsWith("@") ? 32 : 18;

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatContact(e.target.value);
    setContact(formattedValue);
  };

  useEffect(() => {
    // Reset after close animation
    const timer = setTimeout(() => {
      setIsSubmitted(false);
      setIsLoading(false);
      setName("");
      setContact("");
      setMessage("");
      setCategory("");
    }, 500);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const data = {
      name,
      contact,
      message,
      category,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Ошибка при отправке");
      }

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      // In a real app we would use toast here, but currently keeping it simple
      alert("Произошла ошибка при отправке заявки. Попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 sm:p-6 overflow-y-auto custom-scrollbar">
      <div className="w-full h-full flex items-center justify-center py-8">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-lg bg-[#16181d] border border-white/10 rounded-4xl sm:rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[85vh] flex flex-col overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-[#f95700]/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="p-6 md:p-12 relative z-10 overflow-y-auto custom-scrollbar flex-1">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors outline-none z-20"
            >
              <X className="w-6 h-6" />
            </button>

            {!isSubmitted ? (
              <div className="space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight">
                    Запись на <br className="sm:hidden" />{" "}
                    <span className="text-[#f95700]">консультацию</span>
                  </h2>
                  <p className="text-zinc-500 text-[12px] sm:text-sm font-medium">
                    Оставьте ваши данные, и мы с вами свяжемся в ближайшее время.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#f95700] transition-colors">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 text-white text-sm outline-none focus:border-[#f95700]/50 focus:bg-white/8 transition-all"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#f95700] transition-colors">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="+7 (___) ___-__-__ или @username"
                      value={contact}
                      onChange={handleContactChange}
                      maxLength={contactMaxLength}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 sm:py-4 pl-12 sm:pl-14 pr-6 text-white text-sm outline-none focus:border-[#f95700]/50 focus:bg-white/8 transition-all"
                    />
                    <div className="mt-1.5 text-[10px] font-medium uppercase tracking-widest text-zinc-600 px-1">
                      Формат телефона: +7 (999) 123-45-67
                    </div>
                  </div>

                  {/* Категории консультаций */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Тип консультации</span>
                    </div>
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/8 hover:border-[#f95700]/30 transition-all group"
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat.id}
                            checked={category === cat.id}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            className="w-4 h-4 text-[#f95700] border-white/20 bg-white/5 focus:ring-[#f95700]/50 focus:ring-offset-0"
                          />
                          <span className={`text-lg ${cat.color}`}>{cat.icon}</span>
                          <span className="text-white text-sm font-medium group-hover:text-[#f95700] transition-colors">
                            {cat.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-5 top-5 text-zinc-500 group-focus-within:text-[#f95700] transition-colors">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <textarea
                      placeholder="Ваш комментарий (если необходимо)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-14 pr-6 text-white text-sm outline-none focus:border-[#f95700]/50 focus:bg-white/8 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !category}
                    className="w-full bg-[#f95700] hover:bg-[#ff6a1a] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest text-[10px] sm:text-xs py-4 sm:py-5 rounded-2xl shadow-xl shadow-orange-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-4 h-4" />
                    {isLoading ? "Отправка..." : "Отправить в Telegram"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#f95700]/10 flex items-center justify-center border border-[#f95700]/20">
                  <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#f95700]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter text-white">
                    Готово!
                  </h2>
                  <p className="text-zinc-500 text-sm font-medium max-w-[20ch] mx-auto leading-relaxed">
                    Заявка принята. <br /> Мы скоро с вами свяжемся.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
