"use client";

import React, { useState } from "react";
import { Gift, ArrowUpRight } from "lucide-react";
import GuideDownloadModal from "@/components/GuideDownloadModal";

export const HomeGiftForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="mt-4 lg:mt-6 w-full max-w-md lg:mx-0 bg-[#16181d]/80 backdrop-blur-xl p-5 lg:p-6 rounded-[28px] border border-white/5 hover:border-[#f95700]/30 transition-all group overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#f95700]/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#f95700]/10 rounded-full flex items-center justify-center shrink-0 border border-[#f95700]/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
            <Gift className="w-5 h-5 lg:w-6 lg:h-6 text-[#f95700]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-white font-bold text-base lg:text-lg leading-snug">
              Как улучшить свое здоровье спортом по науке?
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={handleOpenModal}
            className="w-full bg-[#f95700] hover:bg-orange-500 text-black font-black uppercase tracking-widest text-[11px] rounded-2xl py-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#f95700]/20"
          >
            Получить гайд
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <GuideDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        fileName="Dr_Welnes_Premium_Guide.pdf"
      />
    </div>
  );
};
