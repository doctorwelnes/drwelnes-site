"use client";

import { X, Download, Send, MessageCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface GuideDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

export default function GuideDownloadModal({ isOpen, onClose, fileName }: GuideDownloadModalProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleClose = () => {
    setIsDownloaded(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleDirectDownload = () => {
    const link = document.createElement("a");
    link.href = `/${fileName}`;
    link.setAttribute("download", fileName);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloaded(true);
    toast.success("Гайд скачивается!", {
      description: "Ваш секретный PDF уже загружается на устройство",
    });

    setTimeout(handleClose, 2000);
  };

  const handleShareTelegram = () => {
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}/${fileName}`;
    const text = encodeURIComponent("Лови секретный Premium гайд от Dr. Welnes!");
    const url = `https://t.me/share/url?url=${encodeURIComponent(fileUrl)}&text=${text}`;
    window.open(url, "_blank");
    handleClose();
  };

  const handleShareMax = () => {
    const baseUrl = window.location.origin;
    const fileUrl = `${baseUrl}/${fileName}`;

    // Используем универсальную ссылку vk.me, которая корректно работает на iOS
    // и открывает мессенджер (VK или Max), если он установлен.
    const url = `https://vk.com/share.php?url=${encodeURIComponent(fileUrl)}`;
    const messengerUrl = `https://vk.me/share?url=${encodeURIComponent(fileUrl)}`;

    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      // На iOS vk.me надежнее, чем кастомные протоколы vkm://
      window.open(messengerUrl, "_blank");
    } else {
      window.open(url, "_blank");
    }
    handleClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#16181d] border border-white/10 rounded-4xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-[#f95700]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="p-8 md:p-10 relative z-10">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors outline-none z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {!isDownloaded ? (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                  Выберите способ <br />
                  <span className="text-[#f95700]">получения гайда</span>
                </h2>
                <p className="text-zinc-500 text-sm font-medium">
                  Как вам удобнее получить секретный PDF?
                </p>
              </div>

              <div className="grid gap-3">
                {/* Direct Download */}
                <button
                  onClick={handleDirectDownload}
                  className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#f95700]/50 hover:bg-[#f95700]/5 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
                    <Download className="w-5 h-5 text-[#f95700]" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Скачать прямо сейчас</div>
                    <div className="text-zinc-500 text-[11px]">Файл загрузится на устройство</div>
                  </div>
                </button>

                {/* Telegram */}
                <button
                  onClick={handleShareTelegram}
                  className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0088cc]/50 hover:bg-[#0088cc]/5 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0088cc]/10 flex items-center justify-center border border-[#0088cc]/20 group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5 text-[#0088cc]" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Отправить в Telegram</div>
                    <div className="text-[11px] text-zinc-500">
                      В &quot;Избранное&quot; или другу
                    </div>
                  </div>
                </button>

                {/* Max (VK) */}
                <button
                  onClick={handleShareMax}
                  className="w-full group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#0077ff]/50 hover:bg-[#0077ff]/5 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0077ff]/10 flex items-center justify-center border border-[#0077ff]/20 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-5 h-5 text-[#0077ff]" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Отправить в Max</div>
                    <div className="text-zinc-500 text-[11px]">Через мессенджер VK</div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-[#f95700]/10 flex items-center justify-center border border-[#f95700]/20 mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#f95700]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase text-white">Успешно!</h3>
                <p className="text-zinc-500 text-sm font-medium">Приятного чтения и тренировок!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
