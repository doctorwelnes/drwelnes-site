"use client";

import React from "react";
import { AlertCircle, X, Check } from "lucide-react";

interface PremiumConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
}

export function PremiumConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  type = "info",
}: PremiumConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[600] flex items-center justify-center p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === "danger" ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"}`}>
              <AlertCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{title}</h2>
              <p className="text-neutral-500 text-sm mt-1">{message}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 font-bold py-4 rounded-2xl transition-all border border-neutral-800"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 font-black py-4 rounded-2xl transition-all shadow-lg ${type === "danger" 
                ? "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20" 
                : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
